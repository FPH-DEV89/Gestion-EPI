import React from 'react';

export default function StatisticsDashboard({ requests }: { requests: any[] }) {
    return (
        <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <h2 className="text-xl font-bold text-slate-400">Dashboard de Statistiques (Maintenance)</h2>
            <p className="text-slate-400 mt-2">Le dashboard est temporairement désactivé pour la compilation de production.</p>
        </div>
    );
}
