# 🧠 Résumé Global du Projet : EPI Manager

Ce document sert de **base de connaissances ultra-légère** pour les assistants IA. Il permet de comprendre instantanément l'architecture, l'état actuel et les spécificités du projet afin d'économiser votre quota de tokens lors de l'ouverture de nouvelles discussions.

---

## 🛠️ 1. Pile Technique & Architecture

*   **Framework :** Next.js 16 (App Router, React 19)
*   **Langage :** TypeScript (mode strict activé)
*   **Base de Données :** PostgreSQL (hébergé sur Vercel DB) avec l'ORM **Prisma**
*   **Authentification :** NextAuth.js v5 (auth.ts)
*   **Design / Styles :** Tailwind CSS (V4), Lucide Icons, Recharts (visualisations graphiques)
*   **Tests / QA :** Playwright (E2E) & Vitest (Tests unitaires)

---

## 🚀 2. Fonctionnalités Majeures Implémentées

### 📲 A. Mode Hors-ligne Résilient (IndexedDB)
*   **Moteur local ([lib/offline-db.ts](file:///c:/Users/fphil/.gemini/antigravity/scratch/epi-manager/lib/offline-db.ts)) :** Stockage sécurisé des stocks en cache et file d'attente IndexedDB pour les soumissions hors-ligne.
*   **Composant client ([employee-wizard.tsx](file:///c:/Users/fphil/.gemini/antigravity/scratch/epi-manager/components/employee-wizard.tsx)) :** Détection automatique de la perte de réseau. Enregistre la demande localement en cas de panne réseau et affiche un écran bleu de succès dédié. Les requêtes en attente sont synchronisées automatiquement en arrière-plan dès le retour de la connexion.

### 🔔 B. Logistique, Alertes Critiques & Prédictions IA
*   **Cloche de Notification ([manager-dashboard.tsx](file:///c:/Users/fphil/.gemini/antigravity/scratch/epi-manager/components/manager-dashboard.tsx)) :** Cloche animée clignotante avec popover affichant les EPI sous le seuil d'alerte.
*   **STEF Insights ([statistics-dashboard.tsx](file:///c:/Users/fphil/.gemini/antigravity/scratch/epi-manager/components/statistics-dashboard.tsx)) :** Calcul dynamique de la vitesse d'attribution hebdomadaire (Burn Rate) par catégorie. Affiche le nombre exact de semaines d'autonomie restantes avant rupture de stock estimée.

### 📈 C. Module d'Audit Financier & Durabilité (Étape 5)
*   **Bascule Unités / Budget (€) ([statistics-dashboard.tsx](file:///c:/Users/fphil/.gemini/antigravity/scratch/epi-manager/components/statistics-dashboard.tsx)) :** Bouton à bascule pilule permettant d'alterner les graphiques par service en quantité ou en coût réel accumulé (`snapshottedPrice`).
*   **Répartition Budgétaire par Motif :** Regroupement par type de demande (Usure, Perte, Nouvel Arrivant) avec barre de progression multi-segments colorée pour repérer immédiatement l'impact des pertes d'EPI sur le budget global.
*   **Détecteur d'Anomalies de Durabilité :** Algorithme analysant les attributions et flaguant tout collaborateur demandant le même équipement plus de **2 fois en moins de 30 jours** (usures prématurées avec cycle moyen constaté).
*   **Export CSV Financier étendu :** Intègre désormais le prix unitaire bloqué, le motif de demande normalisé et le manager validateur.

### 👤 D. Personnalisation de l'Avatar Admin
*   **Initiales Dynamiques ([manager-dashboard.tsx](file:///c:/Users/fphil/.gemini/antigravity/scratch/epi-manager/components/manager-dashboard.tsx)) :** L'avatar en haut à droite affiche à présent de manière dynamique les initiales du gestionnaire connecté (ex: **FP** pour `florian.philibert@stef.com`) grâce à un parseur intelligent du nom ou de l'email NextAuth, avec tooltip de survol.

---

## 🧪 3. Configuration QA & Environnement Critiques

*   **Port Playwright (E2E) :** Impérativement configuré sur le **port 3005** dans `playwright.config.ts` (évite les conflits locaux avec d'autres serveurs sur le port 3000).
*   **Husky Git Hook ([.husky/pre-commit](file:///c:/Users/fphil/.gemini/antigravity/scratch/epi-manager/.husky/pre-commit)) :**
    *   Exécute automatiquement `npx tsc --noEmit` et `npx vitest run` à chaque tentative de commit.
    *   *Note :* L'analyse ESLint est configurée comme non bloquante pour préserver l'agilité de développement face à la base de code héritée.
