/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    // Identifiants lus depuis les variables d'environnement
    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD
    const name = process.env.ADMIN_NAME || 'Administrateur'

    if (!email || !password) {
        console.error('❌ Variables requises : ADMIN_EMAIL et ADMIN_PASSWORD')
        console.error('Usage : ADMIN_EMAIL="email@example.com" ADMIN_PASSWORD="motdepasse" node scripts/create-admin.js')
        process.exit(1)
    }

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
