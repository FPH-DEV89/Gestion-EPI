---
description: Installation et configuration initiale du projet
---

// turbo-all

Ce workflow prépare l'environnement de développement local.

// turbo
1. Installer les dépendances npm
```powershell
npm install
```

2. Vérifier si le fichier .env existe, sinon copier .env.example
```powershell
if (!(Test-Path .env)) { 
    if (Test-Path .env.example) {
        Copy-Item .env.example .env 
    } else {
        New-Item .env -ItemType File
        Add-Content .env "DATABASE_URL=`"postgres://`""
    }
}
```
