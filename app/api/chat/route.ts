import { xai } from '@ai-sdk/xai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    console.log('XAI KEY PREFIX:', process.env.XAI_API_KEY?.substring(0, 10));
    console.log('XAI KEY LENGTH:', process.env.XAI_API_KEY?.length);

    const result = streamText({
        model: xai('grok-3'),
        system: `Tu es un assistant expert en logistique pour EPI Manager.
Ton rôle est d'aider le manager à visualiser l'état du stock et les demandes.
Tu as accès à des outils pour lire la base de données.
Réponds de manière concise, précise et professionnelle.
Si on te demande une action que tu ne peux pas faire (modifier stock), explique que tu n'as que la lecture pour l'instant.`,
        messages,
        tools: {
            getStock: tool({
                description: 'Obtenir la liste des articles en stock avec leurs quantités détaillées par taille.',
                parameters: z.object({
                    category: z.string().optional().describe('La catégorie (ex: "Chaussures", "Gants"). Si omis, renvoie tout.'),
                }),
                execute: async ({ category }: { category?: string }) => {
                    const where = category ? { category: { contains: category, mode: 'insensitive' as const } } : {};
                    const items = await prisma.stockItem.findMany({
                        where,
                        select: { category: true, label: true, stock: true },
                        orderBy: { category: 'asc' },
                    });
                    // On renvoie l'objet brut, l'IA saura lire le JSON "stock"
                    return items;
                },
            }),
            getStats: tool({
                description: 'Obtenir les statistiques globales (nombre de demandes, articles distribués).',
                parameters: z.object({}),
                execute: async () => {
                    const totalRequests = await prisma.request.count();
                    const pendingRequests = await prisma.request.count({ where: { status: 'Pending' } }); // Attention à la casse "Pending"
                    const deliveredItems = await prisma.requestItem.aggregate({
                        _sum: { quantity: true },
                    });
                    return {
                        totalRequests,
                        pendingRequests,
                        totalItemsDistributed: deliveredItems._sum.quantity || 0,
                    };
                },
            }),
            getPendingRequests: tool({
                description: 'Lister les demandes en attente de validation.',
                parameters: z.object({}),
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

    console.log("METHODS:", Object.keys(result));

    // Support all AI SDK stream text response versions
    if ((result as any).toDataStreamResponse) {
        return (result as any).toDataStreamResponse();
    } else if ((result as any).toUIMessageStreamResponse) {
        return (result as any).toUIMessageStreamResponse();
    } else if ((result as any).toTextStreamResponse) {
        return (result as any).toTextStreamResponse();
    }

    return new Response('No valid response stream format found', { status: 500 });
}
