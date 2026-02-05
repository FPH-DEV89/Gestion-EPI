---
description: Synchronisation de la base de données avec Prisma
---

// turbo-all

Ce workflow génère le client Prisma, applique les migrations et insère les données de test.

// turbo
1. Générer le client Prisma
```powershell
npx prisma generate
```

// turbo
2. Pousser le schéma vers la base de données
```powershell
npx prisma db push
```

// turbo
3. Exécuter le script de seeding
```powershell
npx prisma db seed
```
