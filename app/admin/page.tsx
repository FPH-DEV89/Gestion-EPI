import { prisma } from "@/lib/prisma"
import ManagerDashboard from "@/components/manager-dashboard"
import { auth } from "@/auth"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
    try {
        const session = await auth()
        const userRole = (session?.user as any)?.role || "USER"

        const [requests, stock, auditLogs] = await Promise.all([
            prisma.request.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    items: true,
                    validatedBy: {
                        select: { name: true }
                    }
                }
            }),
            prisma.stockItem.findMany({ orderBy: { label: 'asc' } }),
            userRole === "ADMIN"
                ? prisma.auditLog.findMany({
                    orderBy: { createdAt: 'desc' },
                    take: 50,
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                })
                : Promise.resolve([])
        ])

        // Serialize Date objects to ISO strings for Client Component
        const serializedRequests = requests.map(r => ({
            id: r.id,
            employeeName: r.employeeName,
            service: r.service,
            items: r.items,
            reason: r.reason,
            status: r.status,
            createdAt: r.createdAt.toISOString(),
            validatedBy: r.validatedBy?.name || null,
            validatedAt: r.validatedAt ? r.validatedAt.toISOString() : null
        }))

        const serializedStock = stock.map(s => ({
            id: s.id,
            category: s.category,
            label: s.label,
            minThreshold: s.minThreshold,
            price: s.price,
            stock: (s.stock as Record<string, number>) || {}
        }))

        const serializedAuditLogs = auditLogs.map(log => ({
            id: log.id,
            userName: log.user.name || "Inconnu",
            action: log.action,
            details: log.details,
            createdAt: log.createdAt.toISOString()
        }))

        return (
            <main className="min-h-screen bg-background">
                <ManagerDashboard
                    initialRequests={serializedRequests}
                    initialStock={serializedStock}
                    initialAuditLogs={serializedAuditLogs}
                    userRole={userRole}
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
