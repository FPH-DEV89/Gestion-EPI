import { runWeeklyRecap } from "@/lib/weekly-recap";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Authentification flexible : supporte Bearer token, x-api-key, ou Vercel cron
        // Compatible avec tous les schedulers (Vercel, AWS EventBridge, crontab, GitHub Actions)
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret) {
            const authHeader = request.headers.get('authorization');
            const apiKey = request.headers.get('x-api-key');
            const isAuthorized =
                authHeader === `Bearer ${cronSecret}` ||
                apiKey === cronSecret;

            if (!isAuthorized) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const result = await runWeeklyRecap();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Weekly recap error:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
