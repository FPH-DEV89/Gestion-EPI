# EPI MANAGER 🛡️

Système de gestion de stock et de demandes d'Équipements de Protection Individuelle (EPI).

## 🚀 Fonctionnalités

- **Employés** : Assistant interactif pour demander des équipements (taille, type, raison).
- **Managers** : Dashboard sécurisé pour valider/refuser les demandes et gérer les stocks.
- **Sécurité** : Authentification via NextAuth (Zone Admin protégée).
- **Suivi** : Historique des demandes et état des stocks en temps réel.

## 🛠️ Stack Technique

- **Framework** : Next.js 15 (App Router)
- **Langage** : TypeScript
- **Style** : Tailwind CSS v4
- **Base de Données** : PostgreSQL (via Prisma)
- **Tests** : Vitest
- **CI/CD** : GitHub Actions

## 📦 Installation

1.  **Cloner le projet** :
    ```bash
    git clone https://github.com/Start-sys-hub/EPI-MANAGER.git
    cd epi-manager
    ```

2.  **Installer les dépendances** :
    ```bash
    npm install
    ```

3.  **Configurer l'environnement** :
    Créez un fichier `.env` à la racine :
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/epi_manager"
    AUTH_SECRET="votre_secret_super_securise"
    ```

4.  **Initialiser la Base de Données** :
    ```bash
    npx prisma migrate dev
    npm run seed # Pour ajouter les données de test
    ```

5.  **Lancer le serveur de développement** :
    ```bash
    npm run dev
    ```

## 🧪 Tests

Lancer les tests unitaires :
```bash
npm test
```

## 🔐 Accès Manager

## 🔐 Accès Manager

L'application utilise une authentification sécurisée via base de données (Table `User`).

### Compte Super Admin
- **Email** : `florian.philibert@stef.com`
- **Mot de passe** : `Zc4jmx1989@`

### Création d'un nouvel admin (Ligne de commande)
Si vous devez réinitialiser ou créer un admin :
```bash
node scripts/create-admin.js
```

## 📱 QR Code (Fonctionnalité Supprimée)
Le générateur de QR code intégré a été retiré (v0.2.0).
Pour générer le QR code d'accès à la borne, utilisez un outil externe comme [QR Code Monkey](https://www.qrcode-monkey.com/).

---

## 🤖 L'Équipe Autonome

Ce projet est maintenu par une équipe d'agents IA autonomes :
- **Chef** : Coordination
- **Expert Métier** : Logique de gestion
- **Design** : Interface Utilisateur
- **Front-End & Back-End** : Code
- **Security** : Authentification
- **QA** : Tests
- **DevOps** : CI/CD
