import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Verify cron secret (optional security)
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
        if (!webhookUrl) {
            return NextResponse.json({ error: 'TEAMS_WEBHOOK_URL not configured' }, { status: 500 });
        }

        // Get all stock items
        const stockItems = await prisma.stockItem.findMany();

        // Find items below threshold
        const alertItems: Array<{ label: string; category: string; size: string; currentStock: number; threshold: number }> = [];

        stockItems.forEach(item => {
            const stock = (item.stock as Record<string, number>) || {};
            Object.entries(stock).forEach(([size, qty]) => {
                if (qty < item.minThreshold) {
                    alertItems.push({
                        label: item.label || item.category,
                        category: item.category,
                        size,
                        currentStock: qty,
                        threshold: item.minThreshold
                    });
                }
            });
        });

        // Calculate consumption stats from last 90 days
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const recentRequests = await prisma.request.findMany({
            where: {
                status: 'Ordered',
                createdAt: { gte: ninetyDaysAgo }
            },
            include: { items: true }
        });

        // Consumption per category
        const categoryConsumption: Record<string, number> = {};
        recentRequests.forEach(r => {
            r.items.forEach(item => {
                categoryConsumption[item.category] = (categoryConsumption[item.category] || 0) + (item.quantity || 1);
            });
        });

        // Days remaining per category
        const stockPredictions: Array<{ label: string; daysRemaining: number; monthlyRate: number }> = [];
        stockItems.forEach(item => {
            const totalStock = Object.values(item.stock as Record<string, number>).reduce((a, b) => a + b, 0);
            const consumed = categoryConsumption[item.category] || 0;
            const dailyRate = consumed / 90;
            const daysRemaining = dailyRate > 0 ? Math.round(totalStock / dailyRate) : -1; // -1 = no consumption
            const monthlyRate = Math.round(dailyRate * 30 * 10) / 10;

            stockPredictions.push({
                label: item.label || item.category,
                daysRemaining,
                monthlyRate
            });
        });

        // Sort by days remaining (critical first)
        stockPredictions.sort((a, b) => {
            if (a.daysRemaining === -1) return 1;
            if (b.daysRemaining === -1) return -1;
            return a.daysRemaining - b.daysRemaining;
        });

        // Build the Teams message
        const now = new Date();
        const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        let alertSection = '';
        if (alertItems.length > 0) {
            alertSection = alertItems
                .map(a => `⚠️ **${a.label}** (${a.size}) : ${a.currentStock}/${a.threshold}`)
                .join('\n\n');
        } else {
            alertSection = '✅ Aucun EPI en dessous du seuil d\'alerte.';
        }

        let predictionSection = stockPredictions
            .filter(p => p.daysRemaining !== -1)
            .slice(0, 5)
            .map(p => {
                const emoji = p.daysRemaining < 30 ? '🔴' : p.daysRemaining < 60 ? '🟡' : '🟢';
                return `${emoji} **${p.label}** : ~${p.daysRemaining}j restants (${p.monthlyRate}/mois)`;
            })
            .join('\n\n');

        if (!predictionSection) {
            predictionSection = 'Pas de données de consommation disponibles.';
        }

        const cardPayload = {
            "@type": "MessageCard",
            "@context": "http://schema.org/extensions",
            "themeColor": "135bec",
            "summary": "Récap Hebdomadaire Stock EPI",
            "sections": [
                {
                    "activityTitle": `📊 Récap Hebdomadaire Stock EPI`,
                    "activitySubtitle": dateStr,
                    "markdown": true
                },
                {
                    "title": "🚨 Alertes Stock",
                    "text": alertSection,
                    "markdown": true
                },
                {
                    "title": "📈 Prévisions de stock (Top 5 critiques)",
                    "text": predictionSection,
                    "markdown": true
                },
                {
                    "title": "📦 Résumé",
                    "facts": [
                        { "name": "EPIs en alerte", "value": `${alertItems.length} taille(s)` },
                        { "name": "Distributions (90j)", "value": `${recentRequests.reduce((sum, r) => sum + r.items.length, 0)} articles` },
                        { "name": "Demandes traitées (90j)", "value": `${recentRequests.length}` }
                    ],
                    "markdown": true
                }
            ]
        };

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cardPayload)
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`Teams webhook failed: ${response.status} - ${text}`);
            return NextResponse.json({ error: 'Failed to send Teams message', status: response.status }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            alertCount: alertItems.length,
            predictions: stockPredictions.length,
            timestamp: now.toISOString()
        });
    } catch (error) {
        console.error('Weekly recap error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
