import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const mapping: Record<string, string> = {
    "PRODUCTION": "REA",
    "MAINTENANCE": "TECHNIQUE",
    "LOGISTIQUE": "MAG",
    "QUALITE": "GDS",
    "ENCADREMENT": "ENCADREMENT",
    "DIRECTION": "ENCADREMENT"
}

async function main() {
    console.log("Aligning services...")
    const requests = await prisma.request.findMany()
    let count = 0

    for (const r of requests) {
        if (mapping[r.service]) {
            await prisma.request.update({
                where: { id: r.id },
                data: { service: mapping[r.service] }
            })
            count++
        }
    }

    console.log(`Successfully aligned ${count} requests to the new service names.`)
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
    })
