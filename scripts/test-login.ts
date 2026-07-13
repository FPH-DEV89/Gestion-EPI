import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // Identifiants lus depuis les variables d'environnement
    const email = process.env.TEST_EMAIL || 'admin@example.com'
    const password = process.env.TEST_PASSWORD || 'password'

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        console.log("User not found in DB")
        return
    }

    console.log("User found:", user.email, "Role:", user.role)
    const match = await bcrypt.compare(password, user.password)
    console.log("Password match:", match)
}

main().finally(() => prisma.$disconnect())
