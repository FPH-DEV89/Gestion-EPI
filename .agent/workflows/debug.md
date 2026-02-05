---
description: Diagnostic du système et de la base de données
---

// turbo-all

Ce workflow aide à identifier pourquoi l'application ne fonctionne pas comme prévu.

// turbo
1. Vérifier l'état des migrations Prisma
```powershell
npx prisma migrate status
```

2. Vérifier si les variables d'environnement critiques sont présentes
```powershell
if (Test-Path .env) { 
    $envContent = Get-Content .env
    if ($envContent -match "DATABASE_URL") { Write-Host "✅ DATABASE_URL est présente." } else { Write-Warning "❌ DATABASE_URL manquante !" }
} else { 
    Write-Error ".env est inexistant !" 
}
```

3. Vérifier si le port 3000 est déjà utilisé
```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
```
