# Leçons Apprises

*Ce fichier trace les erreurs rencontrées, leurs causes et les règles à suivre pour ne pas les reproduire.*

## Format
- **[Date]** | **Ce qui a mal tourné** | **Règle pour l'éviter**

---
- **[20/03/2026]** | **Ce qui a mal tourné** : Le chatbot retournait tout le stock au lieu d'un article spécifique. La cause profonde était que le Vercel AI SDK affiche les données d'appel d'outils (`m.parts`) instantanément sur le frontend, avant même que le LLM ne puisse filtrer le résultat. | **Règle pour l'éviter** : La validation stricte doit s'effectuer **dans l'exécution de l'outil backend**. Interdire les requêtes génériques par défaut (ex: exiger le paramètre `search: "ALL"`) et renvoyer un set vide en cas de requête invalide pour forcer le LLM à s'auto-corriger.
---
- **[25/03/2026]** | **Ce qui a été appris** : Pour une "présentation" ou un "challenge", le besoin peut varier du prototype interactif (Stitch) à l'image marketing (Image Gen). Clarifier l'usage final évite de sur-ingénierier. | **Règle pour l'éviter** : Toujours demander si "présentation" signifie "démonstration de flux" ou "visuel d'accroche".
---
- **[25/03/2026]** | **Ce qui a été appris** : L'intégration du branding (couleurs STEF) et du contexte métier (froid négatif/surgelé) transforme une image générique en un outil de communication puissant pour un challenge interne. | **Règle pour l'éviter** : Toujours demander s'il y a un branding d'entreprise ou un environnement métier spécifique à respecter pour les visuels de présentation.
---
---
- **[25/03/2026]** | **Ce qui a été appris** : Pour éviter les crashs des **Server Actions** Next.js en production PWA, il est crucial d'ajouter un filtre d'exclusion sur l'en-tête `Next-Action` dans l'écouteur `fetch` du Service Worker. | **Règle pour l'éviter** : Systématiquement ajouter cette exclusion dans `sw.ts` lors de l'utilisation de Serwist avec Next.js App Router.
---
- **[25/03/2026]** | **Ce qui a été appris** : Le build Next.js 15+ peut nécessiter le flag `--webpack` pour gérer correctement les Service Workers avec Serwist. De plus, les bibliothèques tierces comme Recharts 3.x peuvent introduire des incompatibilités de types JSX en production. | **Règle pour l'éviter** : En cas de crash mystérieux du build worker, vérifier l'aliasing des composants problématiques via `const ComponentAny: any = Component`.
