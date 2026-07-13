/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// Chargement de la liste des utilisateurs depuis un fichier externe
const fs = require('fs')
const path = require('path')

const usersFilePath = path.join(__dirname, 'users.json')
if (!fs.existsSync(usersFilePath)) {
  console.error('❌ Fichier scripts/users.json introuvable.')
  console.error('   Copiez scripts/users.example.json vers scripts/users.json et adaptez-le.')
  process.exit(1)
}
const usersToCreate = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'))

const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD || 'ChangeMe2026!'

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
