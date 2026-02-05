import { prisma } from "@/lib/prisma"
import ManagerDashboard from "@/components/manager-dashboard"

export default async function AdminPage() {
    const [requests, stock] = await Promise.all([
        prisma.request.findMany({ orderBy: { createdAt: 'desc' } }),
        prisma.stockItem.findMany()
    ])

    const serializedRequests = requests.map(r => ({ ...r }))
    const serializedStock = stock.map(s => ({
        ...s,
        stock: s.stock as Record<string, number>
    }))

    return (
        <main className="min-h-screen bg-background">
            <ManagerDashboard
                initialRequests={serializedRequests}
                initialStock={serializedStock}
            />
        </main>
    )
}
