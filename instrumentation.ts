/**
 * Point d'entrée d'instrumentation Next.js, exécuté une seule fois au démarrage
 * du serveur (voir https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation).
 *
 * Sur un déploiement autonome (VPS/Node via `next start`, cf. `output: 'standalone'`
 * dans next.config.ts), ceci permet au backend de planifier lui-même le récap
 * hebdomadaire Teams, sans dépendre d'un crontab système, d'AWS EventBridge,
 * de Docker ou de GitHub Actions.
 *
 * Sur Vercel, les crons sont déjà gérés nativement via `vercel.json` : le
 * scheduler interne est donc désactivé pour éviter un double déclenchement.
 */
export async function register() {
    if (process.env.NEXT_RUNTIME !== 'nodejs') {
        return;
    }

    // Vercel exécute les crons via vercel.json : ne pas dupliquer le déclenchement.
    if (process.env.VERCEL) {
        return;
    }

    // Permet de désactiver explicitement le scheduler interne si un
    // scheduler externe (crontab, AWS, GitHub Actions...) est préféré.
    if (process.env.DISABLE_INTERNAL_CRON === 'true') {
        return;
    }

    // @ts-expect-error node-cron is loaded dynamically in node environment
    const cron = await import(/* webpackIgnore: true */ 'node-cron');
    const { runWeeklyRecap } = await import('@/lib/weekly-recap');

    // Deux fois par jour, à 10h et 14h, équivalent au "0 10,14 * * *" utilisé
    // pour Vercel/AWS/crontab dans le README. Le fuseau horaire est fixé
    // explicitement (par défaut Europe/Paris) plutôt que de dépendre du fuseau
    // système du conteneur/serveur (souvent UTC), pour garantir un déclenchement
    // à l'heure française quel que soit l'environnement d'exécution.
    // Surchageable via WEEKLY_RECAP_TIMEZONE.
    const schedule = process.env.WEEKLY_RECAP_CRON || '0 10,14 * * *';
    const timezone = process.env.WEEKLY_RECAP_TIMEZONE || 'Europe/Paris';

    cron.schedule(schedule, async () => {
        try {
            const result = await runWeeklyRecap();
            console.log('[weekly-recap] envoyé avec succès', result);
        } catch (error) {
            console.error('[weekly-recap] échec du récap hebdomadaire interne', error);
        }
    }, { timezone });

    console.log(`[weekly-recap] scheduler interne activé (${schedule}, ${timezone})`);
}
