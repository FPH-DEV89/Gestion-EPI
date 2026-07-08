# 👷 Guide d'Utilisation - Collaborateur STEF

Bienvenue dans le guide d'utilisation de l'application **EPI Manager** pour les collaborateurs. Ce document vous explique comment effectuer vos demandes d'Équipements de Protection Individuelle (EPI), suivre l'état de vos dotations et accuser réception de vos équipements.

---

## 📋 1. Effectuer une demande d'EPI

Pour demander un nouvel équipement (gilet haute visibilité, chaussures de sécurité, gants, etc.), suivez l'assistant étape par étape :

1. **Accéder à la Borne/Application** : Rendez-vous sur la page d'accueil de l'application.
2. **Lancer l'Assistant** : Cliquez sur le bouton de demande d'équipement.
3. **Sélectionner votre profil** : Choisissez votre nom dans la liste des collaborateurs.
4. **Choisir l'équipement** :
   - Sélectionnez la catégorie d'équipement (ex: Chaussures, Vêtements, Protection des mains).
   - Sélectionnez le modèle d'EPI souhaité.
5. **Préciser les détails** :
   - Choisissez votre **taille** ou **pointure**.
   - Indiquez le **motif** de la demande :
     - *Usure* : Votre équipement actuel est usé ou détérioré.
     - *Perte* : Vous avez égaré votre équipement.
     - *Nouvel Arrivant* : C'est votre premier équipement à ce poste.
6. **Valider** : Relisez le récapitulatif de votre demande et cliquez sur **Soumettre**.

> [!NOTE]
   > Une fois soumise, votre demande est immédiatement envoyée à votre manager pour validation. Si les notifications sont activées, votre manager recevra une alerte sur Microsoft Teams.

---

## 📶 2. Mode Hors-ligne Résilient (IndexedDB)

Si le réseau de l'entrepôt est instable ou complètement coupé, vous pouvez tout de même utiliser l'application sans interruption !

* **Détection automatique** : L'application détecte en temps réel la perte de connexion internet.
* **Mise en cache** : Les stocks disponibles restent visibles grâce à une copie de secours enregistrée localement dans votre navigateur.
* **Sauvegarde locale** : Lorsque vous validez votre demande sans réseau, elle est stockée en toute sécurité dans la base de données locale du navigateur (IndexedDB).
* **Écran bleu de succès** : Un écran bleu spécifique apparaît pour vous confirmer que votre demande a bien été enregistrée localement.
* **Synchronisation automatique** : Dès que votre appareil retrouve une connexion internet stable, vos demandes en attente sont automatiquement envoyées au serveur et soumises aux managers, sans aucune action de votre part.

---

## 📊 3. Consulter son Espace Collaborateur

Vous disposez d'un espace personnel pour suivre vos dotations actuelles et vos demandes passées :

1. Sur la page d'accueil, accédez à l'**Annuaire / Profils**.
2. Recherchez votre nom pour ouvrir votre tableau de bord collaborateur.
3. Vous y trouverez :
   - **Vos informations de profil** : Vos tailles préenregistrées (gilet, pantalon, pointure, gants, etc.).
   - **Vos demandes en cours** : L'état d'avancement (En attente, Approuvé, Rejeté).
   - **L'historique de vos dotations** : La liste de tous les équipements qui vous ont été remis avec la date exacte de distribution.

---

## ✍️ 4. Réceptionner et Signer son Équipement

Lorsque votre manager valide et vous remet physiquement votre équipement :

1. Le manager affichera sur son écran (tablette, mobile ou ordinateur) un **Pad de Signature Tactile**.
2. **Signer la remise** : Utilisez votre doigt (sur écran tactile) ou votre souris pour signer directement dans le cadre blanc dédié.
3. **Validation finale** : Cette signature électronique atteste que vous avez bien reçu l'équipement. Elle est conservée de manière sécurisée dans le journal de conformité de l'entreprise.

> [!IMPORTANT]
> En cas de remise en mode hors-ligne, votre signature est enregistrée localement sur la tablette ou le mobile du manager et sera transmise au serveur central dès le retour de la connexion réseau.
