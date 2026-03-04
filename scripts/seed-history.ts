import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("Seeding hypothetical history data...")

    // Clear existing requested history (Optional: uncomment if you want a clean slate)
    // await prisma.requestItem.deleteMany()
    // await prisma.request.deleteMany()
    // await prisma.auditLog.deleteMany()

    // 1. Fetch available stock items to use as reference
    const stockItems = await prisma.stockItem.findMany()
    if (stockItems.length === 0) {
        console.log("No stock items found. Please add inventory first.")
        return
    }

    // 2. Fetch all users (especially the admin for validation)
    const users = await prisma.user.findMany()
    const adminUser = users.find(u => u.role === "ADMIN")

    if (!adminUser) {
        console.log("No ADMIN user found. Run create-user.ts first.")
        return
    }

    // Dummy employee info
    const employees = [
        { name: "Alice Durant", service: "MAG" },
        { name: "Jean Dupont", service: "TECHNIQUE" },
        { name: "Marie Martin", service: "REA" },
        { name: "Luc Petit", service: "RECEP" },
        { name: "Sophie Leroy", service: "GDS" },
        { name: "Pierre Dubois", service: "EXPE" },
        { name: "Julie Moreau", service: "LAD" },
    ]

    const sizes = ["S", "M", "L", "XL", "42", "43", "44"]

    // Generate dates over the past 30 days
    const today = new Date()

    const NUM_REQUESTS = 45

    let successCount = 0

    for (let i = 0; i < NUM_REQUESTS; i++) {
        const employee = employees[Math.floor(Math.random() * employees.length)]
        const stockItem = stockItems[Math.floor(Math.random() * stockItems.length)]
        const size = sizes[Math.floor(Math.random() * sizes.length)]

        // Random date within the last 30 days
        const pastDate = new Date(today)
        pastDate.setDate(today.getDate() - Math.floor(Math.random() * 30))

        // Status is mostly "Ordered" (validated) for history
        const statusRandom = Math.random()
        const status = statusRandom > 0.8 ? "Rejected" : "Ordered"

        try {
            // Create Request
            const request = await prisma.request.create({
                data: {
                    employeeName: employee.name,
                    service: employee.service,
                    reason: "Renouvellement périodique via script de démo",
                    status: status,
                    validatedById: status === "Ordered" ? adminUser.id : null,
                    validatedAt: status === "Ordered" ? pastDate : null,
                    createdAt: pastDate,
                    updatedAt: pastDate
                }
            })

            // Create RequestItem (with the price frozen)
            await prisma.requestItem.create({
                data: {
                    requestId: request.id,
                    category: stockItem.label,
                    size: size,
                    quantity: 1,
                    snapshottedPrice: stockItem.price // Crucial for stats
                }
            })

            // Add Audit Log
            await prisma.auditLog.create({
                data: {
                    userId: adminUser.id,
                    action: status === "Ordered" ? "VALIDATE_REQUEST" : "REJECT_REQUEST",
                    details: {
                        requestId: request.id,
                        employeeName: employee.name
                    },
                    createdAt: pastDate
                }
            })
            successCount++
        } catch (error) {
            console.error(`Error adding request ${i}:`, error)
        }
    }

    console.log(`Successfully completed! Added ${successCount} dummy requests to the history.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
