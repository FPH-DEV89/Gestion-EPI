import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'florian.philibert@stef.com'
    const password = 'Zc4jmx1989@'

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
