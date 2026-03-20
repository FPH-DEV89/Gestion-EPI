import { xai } from '@ai-sdk/xai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    // Clean up frontend metadata to strictly match CoreMessage schema
    const coreMessages = messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content || ''
    }));

    const result = streamText({
        model: xai('grok-3'),
        // @ts-expect-error maxSteps is fully functional at runtime
        maxSteps: 3, // Allow LLM to call tools AND then respond with formatted text
        system: `Tu es un assistant expert en logistique pour EPI Manager.
Ton rôle est STRICTEMENT limité à aider le manager à visualiser l'état du stock, les statistiques et les demandes de l'application.
Tu as accès à des outils pour lire la base de données de l'application.
Réponds de manière concise, précise et professionnelle.

RÈGLES DE SÉCURITÉ ET DE PÉRIMÈTRE :
1. Tu ne dois répondre qu'à des questions concernant EPI Manager (stock, EPI, statistiques, demandes).
2. Si on te pose une question hors sujet (ex: météo, football, actualités, cuisine, etc.), refuse poliment en expliquant que ta mission est exclusivement dédiée à la gestion des EPI de l'entreprise.
3. Si on te demande une action que tu ne peux pas faire (modifier stock), explique que tu n'as que la lecture pour l'instant.

IMPORTANT (getStock):
- L'outil getStock renvoie "category", "label", "prixUnitaire" et "stockParTaille".
- Tu dois TOUJOURS formater la réponse de stock de manière lisible.
- Si l'utilisateur demande la quantité d'un article spécifique (ex: "bonnet"), tu DOIS filtrer avec le paramètre "search" en écrivant le nom exact de l'article (ex: "bonnet"). IL EST STRICTEMENT INTERDIT de renvoyer tout le stock si l'utilisateur demande un article précis.
- Dans ce cas, NE DONNE JAMAIS les informations des autres articles.
- Sois ultra-concis. Va droit au but sans blabla inutile.`,
        messages: coreMessages,
        tools: {
            getStock: tool({
                description: 'Obtenir le stock. ATTENTION: L\'argument "search" est OBLIGATOIRE.',
                parameters: z.object({
                    search: z.string().describe('Le nom de l\'article (ex: "bonnet", "chaussure"). Si l\'utilisateur demande TOUT le stock sans préciser d\'article, passe EXPLICITEMENT la valeur "ALL".'),
                }),
                // @ts-ignore to bypass TS cascade overload mismatch
                execute: async ({ search }: { search: string }) => {
                    console.log(`[ChatTool] getStock called with search: "${search}"`);
                    const query = search ? search.trim() : '';
                    
                    // Si l'IA envoie quand même une chaîne vide '', on force un where qui ne ramènera rien
                    // sauf si l'IA spécifie expressément "ALL".
                    const where: any = (query === 'ALL')
                        ? {}
                        : (query.length > 0)
                            ? {
                                OR: [
                                    { label: { contains: query, mode: 'insensitive' as const } },
                                    { category: { contains: query, mode: 'insensitive' as const } },
                                ]
                            }
                            // Fallback drastique si query est vide et != 'ALL' :
                            // On renvoie un filtre impossible pour que le bot réalise son erreur et redemande.
                            : { id: 'FORCED_EMPTY_RESULT_BECAUSE_NO_SEARCH_ARG' };

                    const items = await prisma.stockItem.findMany({
                        where,
                        select: { category: true, label: true, price: true, stock: true },
                        orderBy: { category: 'asc' },
                    });
                    
                    return items.map((item: any) => ({
                        label: item.label,
                        category: item.category,
                        prixUnitaire: `${item.price}€`,
                        stockParTaille: item.stock,
                    }));
                },
            }),
            getStats: tool({
                description: 'Obtenir les statistiques globales (nombre de demandes, articles distribués).',
                parameters: z.object({}),
                // @ts-ignore to bypass TS cascade overload mismatch
                execute: async () => {
                    const totalRequests = await prisma.request.count();
                    const pendingRequests = await prisma.request.count({ where: { status: 'Pending' } });
                    const orderedRequests = await prisma.request.count({ where: { status: 'Ordered' } });
                    const deliveredItems = await prisma.requestItem.aggregate({
                        _sum: { quantity: true },
                    });
                    return {
                        totalRequests,
                        pendingRequests,
                        orderedRequests,
                        totalItemsDistributed: deliveredItems._sum.quantity || 0,
                    };
                },
            }),
            getPendingRequests: tool({
                description: 'Lister les demandes en attente de validation.',
                parameters: z.object({}),
                // @ts-ignore to bypass TS cascade overload mismatch
                execute: async () => {
                    const requests = await prisma.request.findMany({
                        where: { status: 'Pending' },
                        include: { items: true },
                        orderBy: { createdAt: 'desc' },
                        take: 5,
                    });
                    return requests.map((r: any) => ({
                        id: r.id,
                        employeeName: r.employeeName,
                        date: r.createdAt.toISOString().split('T')[0],
                        items: r.items.map((i: any) => `${i.quantity}x ${i.category} (${i.size})`).join(', ')
                    }));
                },
            }),
        },
        onError: ({ error }) => {
            console.error('AI Stream Error:', error);
        }
    });

    // IMPORTANT: toUIMessageStreamResponse sends tool-invocation parts with state+result
    // to the frontend. toDataStreamResponse uses the old format that doesn't include tool results in parts.
    if ((result as any).toUIMessageStreamResponse) {
        return (result as any).toUIMessageStreamResponse();
    } else if ((result as any).toDataStreamResponse) {
        return (result as any).toDataStreamResponse();
    } else if ((result as any).toTextStreamResponse) {
        return (result as any).toTextStreamResponse();
    }

    return new Response('No valid response stream format found', { status: 500 });
}
