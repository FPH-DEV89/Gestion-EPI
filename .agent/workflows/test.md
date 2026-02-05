---
description: Vérification de la qualité du code (Linting et Types)
---

// turbo-all

Ce workflow s'assure que le code respecte les standards et qu'il n'y a pas d'erreurs de typage TypeScript.

// turbo
1. Exécuter le linter (ESLint)
```powershell
npm run lint
```

// turbo
2. Vérifier les types TypeScript (sans génération de fichiers)
```powershell
npx tsc --noEmit
```
