# Leçons Apprises

*Ce fichier trace les erreurs rencontrées, leurs causes et les règles à suivre pour ne pas les reproduire.*

## Format
- **[Date]** | **Ce qui a mal tourné** | **Règle pour l'éviter**

---
- **[20/03/2026]** | **Ce qui a mal tourné** : Le chatbot retournait tout le stock au lieu d'un article spécifique. La cause profonde était que le Vercel AI SDK affiche les données d'appel d'outils (`m.parts`) instantanément sur le frontend, avant même que le LLM ne puisse filtrer le résultat. | **Règle pour l'éviter** : La validation stricte doit s'effectuer **dans l'exécution de l'outil backend**. Interdire les requêtes génériques par défaut (ex: exiger le paramètre `search: "ALL"`) et renvoyer un set vide en cas de requête invalide pour forcer le LLM à s'auto-corriger.
