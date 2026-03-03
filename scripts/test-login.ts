import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@example.com'
    const password = 'REDACTED_PASSWORD'

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
