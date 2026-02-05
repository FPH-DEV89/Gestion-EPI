---
description: Build et déploiement de l'application
---

// turbo-all

Ce workflow prépare l'application pour la production.

// turbo
1. Construire l'application Next.js
```powershell
npm run build
```

2. Déployer sur Vercel (nécessite d'être connecté)
```powershell
npx vercel --prod
```
