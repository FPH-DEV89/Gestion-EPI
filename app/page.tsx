import { prisma } from "@/lib/prisma"
import EmployeeWizard, { StockItem } from "@/components/employee-wizard"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  try {
    const stockItems = await prisma.stockItem.findMany({
      orderBy: { label: 'asc' }
    })

    // Transform JSON to plain object for Client Component
    const serializedStock = stockItems.map(item => ({
      id: item.id,
      category: item.category,
      label: item.label,
      stock: (item.stock as Record<string, number>) || {}
    }))

    return (
      <main className="min-h-screen bg-slate-50">
        <EmployeeWizard stockItems={serializedStock} />
      </main>
    )
  } catch (error) {
    console.error("Database error:", error)

    // Fallback for development/offline mode
    if (process.env.NODE_ENV === 'development') {
      const fallbackStock: StockItem[] = [
        {
          id: 'fake-chaussures',
          category: 'CHAUSSURES',
          label: 'Chaussures de sécurité',
          minThreshold: 3,
          stock: { '38': 2, '39': 5, '40': 8, '41': 6, '42': 4, '43': 3, '44': 2, '45': 1, '46': 1 }
        },
        {
          id: 'fake-gants',
          category: 'GANTS',
          label: 'Gants de protection',
          minThreshold: 10,
          stock: { 'XS': 15, 'S': 25, 'M': 30, 'L': 20, 'XL': 10, 'XXL': 5 }
        },
        {
          id: 'fake-veste',
          category: 'VESTE',
          label: 'Vestes de travail',
          minThreshold: 5,
          stock: { 'S': 8, 'M': 12, 'L': 15, 'XL': 10, 'XXL': 6, '3XL': 3 }
        },
        {
          id: 'fake-casque',
          category: 'CASQUE',
          label: 'Casques de sécurité',
          minThreshold: 5,
          stock: { 'TU': 20 }
        }
      ]
      return (
        <main className="min-h-screen bg-slate-50">
          <EmployeeWizard stockItems={fallbackStock} />
          <div className="fixed bottom-24 right-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-xs shadow-lg z-50">
            Mode Déconnecté (DB inaccessible)
          </div>
        </main>
      )
    }

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
