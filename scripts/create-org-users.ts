import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const usersToCreate = [
  { email: 'user1@example.com', name: 'Typhaine Mialon', role: 'ADMIN' },
  { email: 'user2@example.com', name: 'Jocelyne Zunino', role: 'ADMIN' },
  { email: 'user3@example.com', name: 'Rémi Mercier (accent)', role: 'ADMIN' },
  { email: 'user4@example.com', name: 'Remi Mercier', role: 'ADMIN' },
  { email: 'user5@example.com', name: 'Pierre Sene', role: 'ADMIN' },
  { email: 'user6@example.com', name: 'Salim Aarab', role: 'USER' },
  { email: 'user7@example.com', name: 'Christophe Fourcade', role: 'ADMIN' }
]

const DEFAULT_PASSWORD = 'REDACTED_PASSWORD'

async function main() {
  console.log('🚀 Création/Mise à jour des comptes utilisateurs...')
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10)

  for (const u of usersToCreate) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        role: u.role,
        name: u.name,
        // Only update password if we want to reset it (or keep it sync)
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

  console.log(`\n🎉 Tous les comptes ont été créés/mis à jour avec le mot de passe temporaire : ${DEFAULT_PASSWORD}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
