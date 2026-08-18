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
          category: 'CASQUE_SECURITE',
          label: 'Casques de sécurité',
          minThreshold: 5,
          stock: { 'TU': 20 }
        },
        {
          id: 'fake-protection-auditive',
          category: 'PROTECTION_AUDITIVE',
          label: 'Casque anti-bruit SNR 32dB',
          minThreshold: 6,
          stock: { 'TU': 11 }
        },
        {
          id: 'fake-lunettes',
          category: 'LUNETTES_PROTECTION',
          label: 'Lunettes de protection anti-rayures',
          minThreshold: 8,
          stock: { 'TU': 25 }
        },
        {
          id: 'fake-gilet',
          category: 'GILET_HAUTE_VISIBILITE',
          label: 'Gilet haute visibilité Fluo',
          minThreshold: 10,
          stock: { 'S': 12, 'M': 15, 'L': 20, 'XL': 10, 'XXL': 5 }
        },
        {
          id: 'fake-masque',
          category: 'MASQUE_FFP2',
          label: 'Masque de protection FFP2',
          minThreshold: 20,
          stock: { 'TU': 50 }
        },
        {
          id: 'fake-pantalon',
          category: 'PANTALON_DE_TRAVAIL',
          label: 'Pantalon de travail renforcé',
          minThreshold: 4,
          stock: { '38': 5, '40': 10, '42': 10, '44': 8, '46': 4 }
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
