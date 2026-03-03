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

### 🛡️ Expert Sécurité & Back-End
- [ ] **Correction de Faille Critique (Dashboard)** : Retirer `const isAuthorized = !!userRole;` (forcé à true) dans `manager-dashboard.tsx`. L'autorisation doit être stricte (`userRole === "ADMIN"`).
- [ ] **Sécurisation des Server Actions** : Verrouiller `validateRequest`, `rejectRequest`, et `updateStock` dans `app/actions.ts` pour qu'elles valident explicitement que `session.user.role === "ADMIN"`.
- [ ] **Audit DB** : Ajouter des index sur `AuditLog(userId, createdAt)` pour garantir la performance à l'échelle.

### 💻 Front-End & Design
- [ ] Maintien de l'esthétique "Premium" (Terracotta/Sage).
- [ ] Garantir que les Skeletons (mentionnés dans la rétrospective) sont implémentés partout où des requêtes de données sont faites. Zéro "Layout Shift" autorisé.

### 👨‍💻 Chef (Head of Engineering)
- [x] Profil d'admin super-user créé (`florian.philibert@stef.com`).
- [x] Audit global complété.
- [ ] Supervision de l'exécution des correctifs de sécurité ci-dessus.

## 🚀 Roadmap V2.1
1.  **Phase 1 (Immédiate)** : Correctifs de Sécurité (Dashboard & Server Actions).
2.  **Phase 2** : Refonte de la logique de permission (Role-Based Access Control strict).
3.  **Phase 3** : Déploiement "Zero Downtime" sur Vercel.

---
*Dernière mise à jour : 27/02/2026 par le Chef*
