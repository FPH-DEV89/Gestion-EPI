const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const email = 'florian.philibert@stef.com'
    const password = 'Zc4jmx1989@'
    const name = 'Florian Philibert'

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        const user = await prisma.user.upsert({
            where: { email: email },
            update: {
                password: hashedPassword,
                role: 'ADMIN',
                name: name
            },
            create: {
                email: email,
                password: hashedPassword,
                name: name,
                role: 'ADMIN'
            },
        })
        console.log(`✅ Super Admin created/updated: ${user.email}`)
    } catch (e) {
        console.error(e)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
