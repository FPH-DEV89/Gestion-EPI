# Epi Manager - Plan d'Équipe (Team Plan)

> [!NOTE]
> Ce document est le gardien de la vision stratégique et de l'excellence technique du projet. Suivant les directives du Chef (Director of Engineering & Product).

## 🎯 Vision & Ambition (Chef's Directive)
L'objectif est de transformer Epi Manager d'un simple outil de gestion interne en un SaaS "World Class". L'interface doit être fluide, sécurisée (Zéro Faille), et l'expérience utilisateur doit être "State of the Art". Le retour d'expérience (`GLOBAL_RETROSPECTIVE.md`) est notre bible. Pas de régressions tolérées.

## 🛠️ Stack Technique
- **Framework** : Next.js 16.1.6
- **Styles** : Tailwind CSS 4
- **Base de données** : Prisma (avec Neon/PostgreSQL)
- **Authentification** : NextAuth v5 (Beta)
- **Tests** : Vitest

## 📋 Tâches par Expert (Assignées par le Chef)

### 💻 Expert Front-End & Design
- [ ] Suppression complète du mode sombre (`ThemeProvider`, `next-themes`, `tailwind.config.ts`).
- [ ] Injection systématique du lien "Manager" dans la barre de navigation.
- [ ] Maintien de l'esthétique "Premium" (Brand Blue / White).
- [ ] Transformation PWA (Configuration `serwist/next`, création du `manifest.ts`).
- [ ] Implémentation du Background Sync (Workbox) pour la persistance des actions hors ligne.
- [ ] Intégration côté client des Web Push Notifications.

### 🤖 Expert IA & Data
- [ ] Affinage du System Prompt du Chatbot pour forcer des réponses ultra-concises.
- [ ] Optimisation de l'outil `getStock` pour qu'il ne retourne que le stock demandé.
- [ ] Ajout d'une table `PushSubscription` dans le schéma Prisma pour la gestion des notifications.

### 👨‍💻 Chef (Head of Engineering)
- [x] Profil d'admin super-user créé (`florian.philibert@stef.com`).
- [x] Audit global complété.
- [ ] Revue globale du code avant les tests locaux exclusifs. Pas de déploiement en prod sans validation stricte.
- [x] Validation de l'ambition PWA avec le client (Offline Sync, Push validés).
- [ ] Génération de l'image de la PWA (Logo premium).

## 🚀 Roadmap V2.1
1.  **Phase 1 (Immédiate)** : Correctifs de Sécurité (Dashboard & Server Actions).
2.  **Phase 2** : Refonte de la logique de permission (Role-Based Access Control strict).
3.  **Phase 3** : Déploiement "Zero Downtime" sur Vercel.

---
*Dernière mise à jour : 27/02/2026 par le Chef*
