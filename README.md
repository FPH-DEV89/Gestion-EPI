# EPI MANAGER 🛡️

Système de gestion de stock et de demandes d'Équipements de Protection Individuelle (EPI) pour les centres logistiques STEF.

## 🚀 Fonctionnalités Majeures

*   **Mode Hors-ligne Résilient (IndexedDB)** : Cache local complet des stocks et file d'attente IndexedDB pour soumettre des demandes d'EPI même en cas de rupture réseau dans l'entrepôt, avec synchronisation en arrière-plan automatique.
*   **Signature Électronique Tactile** : Pad de dessin tactile (Canvas HTML5) intégré pour faire signer physiquement les collaborateurs lors de la remise de leur équipement, avec synchronisation hors-ligne.
*   **Tableau de Bord & Alertes Critiques** : Cloche de notification animée clignotante signalant les articles sous leur seuil d'alerte.
*   **STEF Insights (Prévisions IA)** : Analyse dynamique de la vitesse d'attribution hebdomadaire (*Burn Rate*) et prévision en temps réel des semaines d'autonomie restantes par type d'EPI.
*   **Audit Financier & Durabilité** :
    *   Bascule dynamique quantité / coût financier réel (`snapshottedPrice`).
    *   Répartition des dépenses par motif (Usure, Perte, Nouvel Arrivant) avec progression multi-segments.
    *   Détecteur d'anomalies de durabilité (usures prématurées : plus de 2 demandes du même type d'EPI en moins de 30 jours).
*   **Gestion des Collaborateurs** : Profils de tailles/pointures personnalisés et historique individuel des attributions.
*   **Journaux d'Audit (Compliance)** : Traçabilité immuable des actions sensibles (modifications de stocks, validations, connexions).
*   **Notifications Teams** : Alertes instantanées envoyées par webhook sur Microsoft Teams lors d'une nouvelle demande.

---

## 📖 Documentation Utilisateur

Pour en savoir plus sur l'utilisation et l'administration quotidienne de l'application, consultez les guides dédiés :

*   [👷 Guide d'Utilisation - Collaborateur](file:///c:/Users/fphil/.gemini/antigravity/scratch/epi-manager/docs/guide-collaborateur.md) : Comment soumettre une demande, utiliser le mode hors-ligne et signer la réception de vos EPI.
*   [👔 Guide d'Utilisation - Manager & Administrateur](file:///c:/Users/fphil/.gemini/antigravity/scratch/epi-manager/docs/guide-manager.md) : Comment valider les demandes, suivre les stocks, consulter STEF Insights, analyser le budget et suivre les logs d'audit.
*   [🛡️ Tutoriel d'Intégration Keycloak](file:///c:/Users/fphil/.gemini/antigravity/scratch/epi-manager/docs/keycloak-integration-tutorial.md) : Guide de configuration pour connecter NextAuth.js v5 avec le serveur Keycloak.

---

## 🛠️ Stack Technique

*   **Framework** : Next.js 16 (App Router, React 19)
*   **Langage** : TypeScript (mode strict)
*   **Style** : Tailwind CSS v4
*   **Base de Données** : PostgreSQL (Vercel DB) avec Prisma ORM
*   **Sécurité** : NextAuth.js v5 + Keycloak (OIDC) / Local database accounts
*   **Tests** : Vitest (Unitaires) & Playwright (E2E, configuré sur le port `3005`)
*   **CI/CD** : GitHub Actions

---

## 📦 Installation et Lancement Local

### 1. Cloner le projet
```bash
git clone https://github.com/Start-sys-hub/EPI-MANAGER.git
cd epi-manager
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer l'environnement
Créez un fichier `.env` à la racine de votre projet en vous basant sur `.env.local` et `.env.vercel` :
```env
DATABASE_URL="postgresql://user:password@localhost:5432/epi_manager"
AUTH_SECRET="votre_secret_super_securise_32_caracteres"

# Optionnel : Notifications Microsoft Teams
TEAMS_WEBHOOK_URL="https://your-tenant.webhook.office.com/..."
```

### 4. Initialiser la base de données
```bash
npx prisma migrate dev
npm run seed # Ajoute les données initiales de test et de démo
```

### 5. Lancer le serveur de développement
```bash
npm run dev
```
L'application est accessible sur [http://localhost:3000](http://localhost:3000).

---

## 🧪 Tests

### Tests Unitaires (Vitest)
```bash
npm test
```

### Tests E2E (Playwright)
```bash
npx playwright test
```
*Note : Playwright tourne sur le port `3005` pour éviter les conflits avec le serveur de dev standard.*

---

## 🔐 Accès Administrateur par défaut

L'authentification s'effectue via la base de données locale (ou Keycloak si configuré).

### Compte Super Administrateur de Test
*   **Email** : `admin@example.com`
*   **Mot de passe** : `REDACTED_PASSWORD`

### Création manuelle d'un administrateur
Pour ajouter un compte administrateur local en base de données :
```bash
node scripts/create-admin.js
```

---

## 🤖 L'Équipe Autonome

Ce projet est développé et maintenu par une équipe d'agents IA autonomes :
*   **Chef** : Coordination
*   **Expert Métier** : Logique de gestion
*   **Design** : Interface Utilisateur
*   **Front-End & Back-End** : Code
*   **Security** : Authentification et habilitations
*   **QA** : Tests unitaires et E2E
*   **DevOps** : Pipelines CI/CD
