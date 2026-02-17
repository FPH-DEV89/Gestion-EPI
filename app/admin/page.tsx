import { prisma } from "@/lib/prisma"
import ManagerDashboard from "@/components/manager-dashboard"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
    try {
        const [requests, stock] = await Promise.all([
            prisma.request.findMany({
                orderBy: { createdAt: 'desc' },
                include: { items: true }
            }),
            prisma.stockItem.findMany({ orderBy: { label: 'asc' } })
        ])

        // Serialize Date objects to ISO strings for Client Component
        const serializedRequests = requests.map(r => ({
            id: r.id,
            employeeName: r.employeeName,
            service: r.service,
            items: r.items,
            reason: r.reason,
            status: r.status,
            createdAt: r.createdAt.toISOString()
        }))

        const serializedStock = stock.map(s => ({
            id: s.id,
            category: s.category,
            label: s.label,
            minThreshold: s.minThreshold,
            price: s.price,
            stock: (s.stock as Record<string, number>) || {}
        }))

        return (
            <main className="min-h-screen bg-background">
                <ManagerDashboard
                    initialRequests={serializedRequests}
                    initialStock={serializedStock}
                />
            </main>
        )
    } catch (error) {
        console.error("Database error:", error)
        return (
            <main className="min-h-screen bg-background p-4 md:p-10 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Erreur de connexion</h1>
                    <p className="text-gray-500">Impossible de charger les données. Veuillez réessayer.</p>
                </div>
            </main>
        )
    }
}
