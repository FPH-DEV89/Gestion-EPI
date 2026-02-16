# 🧠 Journal d'Apprentissage & Rétrospective - Session Chef

Ce document recense les erreurs rencontrées lors du développement et du déploiement, ainsi que les solutions apportées, afin d'améliorer les futurs cycles de développement de l'équipe autonome.

## 📅 Session du 16/02/2026

### 1. Conflit de Structure de Fichiers (`src/` vs `app/`)
- **Problème** : Le build Vercel échouait car un dossier `src/` (contenant une ancienne version du code) coexistait avec le dossier `app/` à la racine. Next.js privilégiait `src/`.
- **Solution** : Suppression du dossier `src/` et ajout de `src/` au `.gitignore` pour éviter toute réapparition accidentelle.
- **Leçon** : Toujours vérifier la structure racine du projet (`ls -R` ou `dir`) avant de commencer, surtout après des fusions git complexes.

### 2. Conflit Middleware (`middleware.ts` vs `proxy.ts`)
- **Problème** : Erreur de build "The 'middleware' file convention is deprecated. Please use 'proxy' instead". En réalité, le projet contenait à la fois un `middleware.ts` (NextAuth) et un `proxy.ts` (obsclète).
- **Solution** : Suppression définitive de `proxy.ts`.
- **Leçon** : Lors de la migration vers une nouvelle librairie (ici NextAuth v5), s'assurer de nettoyer les anciens fichiers de configuration qui pourraient entrer en conflit.

### 3. Variables d'Environnement Manquantes (`AUTH_SECRET`)
- **Problème** : Erreur 500 au login ("Problème lors de la configuration du serveur") sur Vercel.
- **Cause** : NextAuth v5 exige impérativement une variable `AUTH_SECRET` en production, ce qui n'est pas le cas en dev parfois.
- **Solution** : Génération d'une clé via `openssl rand -base64 32` et ajout dans les paramètres Vercel.
- **Leçon** : Toujours lister les variables d'environnement requises pour la production dans le plan de déploiement.

### 4. Rigueur TypeScript (`any` implicite)
- **Problème** : Échec du build avec "Parameter 'tx' implicitly has an 'any' type" dans une transaction Prisma.
- **Solution** : Typage explicite : `async (tx: Prisma.TransactionClient) => ...`.
- **Leçon** : Le build de production (CI/CD) est souvent plus strict que l'environnement local. Utiliser `npm run build` localement pour valider les types avant de pousser.

### 5. Directives React Server Components (`"use server"`)
- **Problème** : Suppression accidentelle de `"use server"` en haut de `actions.ts` lors d'un correctif. Résultat : Next.js traitait le fichier comme du code client et échouait sur les imports serveur (`next/headers`).
- **Solution** : Restauration de la directive.
- **Leçon** : Être extrêmement vigilant lors de l'édition de fichiers Server Actions. Vérifier systématiquement la présence de la directive en tête de fichier.

---

## 🚀 Actions Correctives pour l'Équipe
1. **Systématiser le `npm run build` local** avant tout push vers la branche `main`.
2. **Auditer les fichiers orphelins** régulièrement.
3. **Documenter les variables d'env** dans un `.env.example` à jour.
