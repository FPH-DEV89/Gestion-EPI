# 👔 Guide d'Utilisation - Manager & Administrateur STEF

Ce guide est destiné aux managers et administrateurs d'**EPI Manager**. Il présente l'ensemble des fonctionnalités du tableau de bord d'administration et les instructions de configuration et d'exploitation du système.

---

## 🔐 1. Authentification & Profil Administrateur

### Accès au Tableau de Bord
Le tableau de bord d'administration est accessible via l'URL `/admin` (ou `/statistics`). L'accès est hautement sécurisé et s'effectue :
- Soit via les comptes locaux configurés en base de données.
- Soit via la plateforme d'identité d'entreprise **Keycloak** (OIDC).

### Personnalisation de l'Avatar
Une fois connecté, le système identifie automatiquement le gestionnaire grâce à son email ou nom NextAuth :
- L'avatar situé en haut à droite du tableau de bord affiche vos **initiales dynamiques** (par exemple, **FP** pour `admin@example.com`).
- Un survol avec le curseur (tooltip) permet d'afficher votre nom complet ou votre email actuellement connecté.

---

## 📥 2. Gestion et Validation des Demandes

Les demandes d'EPI formulées par les collaborateurs s'affichent en temps réel dans votre boîte de réception de demandes.

### Processus d'Approbation / Rejet :
1. **Consulter la Demande** : Dans l'onglet principal, examinez le nom du collaborateur, l'équipement demandé, la taille, et le motif formulé (Usure, Perte, Nouvel Arrivant).
2. **Prendre une décision** :
   - **Rejeter** : Cliquez sur le bouton de rejet. La demande passe à l'état *Refusé*.
   - **Approuver & Remettre** : Cliquez sur le bouton de validation. Une fenêtre modale apparaît.
3. **Signature de Remise** :
   - Demandez au collaborateur de signer directement sur le **Pad de Signature Tactile** intégré à la modale (avec son doigt sur tablette/mobile ou à la souris sur ordinateur).
   - Cliquez sur **Confirmer la remise**.
   - Le stock de l'équipement concerné est automatiquement décrémenté et la signature est enregistrée.

> [!TIP]
> **Fonctionnement Hors-ligne** : Si vous effectuez des validations en zone blanche (sans réseau), les signatures et les validations sont conservées localement dans le navigateur et seront automatiquement synchronisées avec le serveur central dès le retour d'une connexion internet.

---

## 📦 3. Gestion des Stocks, Alertes et Seuils Critiques

L'application facilite le suivi des stocks physiques afin d'éviter toute rupture sur le terrain.

### Suivi et Ajustement des Quantités :
- Vous pouvez ajouter ou retirer des équipements manuellement et éditer les seuils d'alerte de chaque article depuis l'interface de gestion de stock.
- Chaque mouvement manuel est consigné dans les journaux d'audit de sécurité pour assurer la conformité.

### Cloche de Notification Clignotante :
- Si un ou plusieurs équipements passent sous leur **seuil d'alerte critique** prédéfini, l'icône de cloche en haut du dashboard s'anime et clignote en rouge pour attirer votre attention.
- Un clic sur la cloche ouvre un volet (popover) listant instantanément les EPI en rupture imminente pour vous permettre de lancer un réapprovisionnement.

---

## 📊 4. STEF Insights : Statistiques & Prévisions IA

L'onglet **Statistiques** intègre le module de Business Intelligence **STEF Insights** pour anticiper les besoins logistiques.

- **Vitesse d'Attribution Hebdomadaire (Burn Rate)** : Calcule dynamiquement le nombre moyen d'équipements distribués par semaine pour chaque catégorie.
- **Semaines d'Autonomie Restantes** : Un algorithme prédictif croise le stock actuel avec le Burn Rate pour vous indiquer précisément le nombre de semaines d'autonomie restantes avant rupture de stock estimée.

---

## 📈 5. Module d'Audit Financier & Durabilité

Ce module permet d'analyser l'impact budgétaire et écologique des attributions d'EPI.

### Bascule Unités / Budget (€)
Un bouton interrupteur ("pill toggle") vous permet d'alterner l'affichage de tous les graphiques analytiques :
- **Mode Quantité** : Affiche le volume brut d'équipements attribués.
- **Mode Budget (€)** : Traduit les distributions en coût réel accumulé (basé sur le prix unitaire de l'EPI figé au moment de la remise - `snapshottedPrice`).

### Analyse par Motif & Pertes
Un graphique à barres multi-segments coloré détaille les dépenses selon le motif de la demande (Usure, Perte, Nouvel Arrivant) :
- Permet d'isoler rapidement la part du budget consommée par la perte d'équipements par rapport à l'usure normale.

### Détecteur d'Anomalies de Durabilité
L'application intègre un algorithme d'analyse comportementale de durabilité :
- Il identifie et signale (flag) automatiquement dans une section dédiée tout collaborateur ayant demandé le **même équipement plus de 2 fois en moins de 30 jours**.
- Cela vous permet de détecter les usures anormalement rapides ou les abus, et d'ajuster l'accompagnement ou la qualité des fournitures.

### Export CSV Financier
Vous pouvez exporter l'intégralité des données d'attribution au format CSV pour des retraitements externes (Excel/ERP). Cet export comprend désormais :
- Le prix unitaire bloqué au moment de la remise.
- Le motif normalisé de la demande.
- L'identité du manager ayant validé la dotation.

---

## 👥 6. Gestion des Collaborateurs et Profils de Tailles

Dans l'onglet **Collaborateurs**, vous avez accès à l'annuaire complet de l'entreprise :
- **Fiche Collaborateur** : Permet de renseigner et de modifier à l'avance les mensurations d'un employé (pointure, taille de pantalon, taille de gilet, taille de gants).
- **Historique Nominatif** : Affiche la liste chronologique de toutes les dotations passées de cet employé spécifique pour faciliter les renouvellements.

---

## 📋 7. Journaux d'Audit & Conformité (Compliance)

Toutes les actions d'administration critiques sont journalisées de manière immuable dans l'onglet **Logs d'Audit** :
- Connexions de managers, validations de demandes, modifications manuelles de stocks et synchronisations hors-ligne.
- Ce journal fournit une traçabilité totale pour les audits internes ou les exigences réglementaires.

---

## 🔔 8. Notifications Microsoft Teams

Pour être informé en temps réel des nouvelles demandes d'EPI déposées par vos équipes :
1. Créez un connecteur de type **Webhook Entrant (Incoming Webhook)** sur le canal Microsoft Teams de votre choix.
2. Configurez la variable d'environnement du serveur :
   ```env
   TEAMS_WEBHOOK_URL="https://your-tenant.webhook.office.com/webhookb2/..."
   ```
3. L'application transmettra automatiquement une carte de notification interactive détaillée pour chaque nouvelle demande soumise en ligne.
