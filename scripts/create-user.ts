const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2]
    const password = process.argv[3] || 'Password123!'
    const role = process.argv[4] || 'USER' // ADMIN or USER
    const name = process.argv[5] || 'Test User'

    if (!email) {
        console.error('Usage: npx ts-node scripts/create-user.ts <email> [password] [role] [name]')
        process.exit(1)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
                name,
            },
        })
        console.log(`✅ Utilisateur créé : ${user.email} (${user.role}) - Mot de passe : ${password}`)
    } catch (e) {
        if (e.code === 'P2002') {
            console.error('❌ Cet email existe déjà.')
        } else {
            console.error(e)
        }
    } finally {
        await prisma.$disconnect()
    }
}

main()
