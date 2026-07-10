/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const usersToCreate = [
  { email: 'user1@example.com', name: 'Typhaine Mialon', role: 'USER' },
  { email: 'user2@example.com', name: 'Jocelyne Zunino', role: 'USER' },
  { email: 'user3@example.com', name: 'Rémi Mercier (accent)', role: 'USER' },
  { email: 'user4@example.com', name: 'Remi Mercier', role: 'USER' },
  { email: 'user5@example.com', name: 'Pierre Sene', role: 'ADMIN' },
  { email: 'user6@example.com', name: 'Salim Aarab', role: 'USER' },
  { email: 'user7@example.com', name: 'Christophe Fourcade', role: 'ADMIN' },
  { email: 'user8@example.com', name: 'Adrien Faye', role: 'ADMIN' }
]

const DEFAULT_PASSWORD = 'REDACTED_PASSWORD'

async function main() {
  console.log('🚀 Création/Mise à jour des comptes utilisateurs avec Adrien Faye...')
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10)

  for (const u of usersToCreate) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        role: u.role,
        name: u.name,
        password: hashedPassword
      },
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        password: hashedPassword
      }
    })
    console.log(`✅ Compte synchronisé : ${user.email} (${user.role})`)
  }

  console.log(`\n🎉 Utilisateurs mis à jour !`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
