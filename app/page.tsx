import { prisma } from "@/lib/prisma"
import EmployeeWizard from "@/components/employee-wizard"

export default async function HomePage() {
  const stockItems = await prisma.stockItem.findMany()

  // Transform JSON to plain object for Client Component
  const serializedStock = stockItems.map(item => ({
    ...item,
    stock: item.stock as Record<string, number>
  }))

  return (
    <main className="min-h-screen bg-background p-4 md:p-10">
      <EmployeeWizard stockItems={serializedStock} />
    </main>
  )
}
