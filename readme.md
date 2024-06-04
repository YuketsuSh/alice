# Discord Bot "Alice"

Ce projet est un bot Discord développé avec `discord.js@v14.15.3` pour gérer un serveur communautaire de développeurs. Le bot inclut des fonctionnalités de modération, de sécurité, de gestion des annonces, de partage de ressources, de giveaways et bien plus.

## Prérequis

- Node.js v16.6.0 ou supérieur
- npm (Node Package Manager)
- Un bot Discord (vous pouvez en créer un sur le [Portail Développeur Discord](https://discord.com/developers/applications))

## Installation

1. Clonez ce dépôt sur votre machine locale :

```bash
git clone https://github.com/YuketsuSh/alice.git
```

2. Accédez au répertoire du projet :

```bash
cd alice
```

3. Installez les dépendances :

```bash
npm install
```

4. Créez un fichier `config.json` dans le répertoire `config` avec le contenu suivant :

```json
{
  "token": "YOUR_BOT_TOKEN",
  "clientId": "YOUR_BOT_ID",
  "guildId": "YOUR_GUILD_ID",
  "logChannelId": "CONFIG_DISCORD",
  "announceChannelId": "CONFIG_DISCORD",
  "giveawayChannelId": "CONFIG_DISCORD",
  "moderationRoleId": "CONFIG_DISCORD",
  "allAccessRoleId": "YOUR_ADMIN_ROLE",
  "giveawayRoleId": "CONFIG_DISCORD",
  "q17RoleId": "CONFIG_DISCORD"
}
```

Remplacez `YOUR_BOT_TOKEN` par le token de votre bot Discord et les autres valeurs par les IDs appropriés pour votre serveur.

## Lancement du bot

Pour lancer le bot, exécutez la commande suivante :

```bash
node index.js
```

## Commandes

### Modération

1. **Mute un utilisateur**
   ```
   /moderation mute utilisateur:<@user> durée:<int> temps:<s|m|h|d>
   ```
   Mute un utilisateur pour une durée spécifiée.

2. **Unmute un utilisateur**
   ```
   /unmute utilisateur:<@user>
   ```
   Unmute un utilisateur.

3. **Warn un utilisateur**
   ```
   /warn utilisateur:<@user> raison:<string>
   ```
   Avertit un utilisateur avec une raison spécifique. Si un utilisateur reçoit 3 avertissements, il sera mute pendant 10 minutes. S'il reçoit 5 avertissements, il sera banni.

4. **Reset les warns d'un utilisateur**
   ```
   /warnreset utilisateur:<@user>
   ```
   Réinitialise les avertissements d'un utilisateur.

5. **Expulser un utilisateur**
   ```
   /kick utilisateur:<@user> raison:<string>
   ```
   Expulse un utilisateur avec une raison spécifique.

### Annonces

1. **Créer une annonce**
   ```
   /announce create titre:<string> message:<string>
   ```
   Crée une nouvelle annonce.

2. **Modifier une annonce**
   ```
   /announce edit id:<string> nouveau_message:<string>
   ```
   Modifie une annonce existante.

3. **Supprimer une annonce**
   ```
   /announce delete id:<string>
   ```
   Supprime une annonce existante.

4. **Lister les annonces**
   ```
   /announce list
   ```
   Liste toutes les annonces disponibles.

### Giveaways

1. **Créer un giveaway**
   ```
   /giveaway create objet:<string> durée:<int> salon:<#channel>
   ```
   Crée un nouveau giveaway.

2. **Modifier un giveaway**
   ```
   /giveaway edit id:<string> nouvel_objet:<string> nouvelle_durée:<int>
   ```
   Modifie un giveaway existant.

3. **Supprimer un giveaway**
   ```
   /giveaway delete id:<string>
   ```
   Supprime un giveaway existant.

4. **Lister les giveaways**
   ```
   /giveaway list
   ```
   Liste tous les giveaways disponibles.

### Sécurité

1. **Scanner le serveur**
   ```
   /scan
   ```
   Scanne l'intégrité de l'infrastructure et affiche les résultats après 4 secondes.

2. **Verrouiller le serveur**
   ```
   /lockdown
   ```
   Verrouille le serveur en empêchant tous les membres d'envoyer des messages.

3. **Déverrouiller le serveur**
   ```
   /unlock
   ```
   Déverrouille le serveur en permettant à tous les membres d'envoyer des messages.

4. **Signaler un utilisateur**
   ```
   /report utilisateur:<@user> raison:<string>
   ```
   Signale un utilisateur suspect ou un comportement inapproprié.

5. **Lister les rapports d'un utilisateur**
   ```
   /listreports utilisateur:<@user>
   ```
   Liste tous les rapports pour un utilisateur spécifique.

6. **Supprimer un rapport**
   ```
   /deletereport reportid:<string>
   ```
   Supprime un rapport par son ID.

### Q17

1. **Partager une ressource**
   ```
   /q17 share type:<string> lien:<string> description:<string>
   ```
   Partage une ressource.

2. **Proposer ou rechercher des services**
   ```
   /q17 service type:<string> description:<string> contact:<string>
   ```
   Propose ou recherche des services.

### Configuration

1. **Configurer le salon de logs**
   ```
   /setup logchannel channel:<#channel>
   ```
   Configure le salon de logs.

2. **Configurer le salon des annonces**
   ```
   /setup announcechannel channel:<#channel>
   ```
   Configure le salon des annonces.

3. **Configurer le salon des giveaways**
   ```
   /setup giveawaychannel channel:<#channel>
   ```
   Configure le salon des giveaways.

4. **Configurer le rôle de modération**
   ```
   /setup moderationrole role:<@role>
   ```
   Configure le rôle de modération.

5. **Configurer le rôle d'accès complet**
   ```
   /setup allaccessrole role:<@role>
   ```
   Configure le rôle d'accès complet.

6. **Configurer le rôle des giveaways**
   ```
   /setup giveawayrole role:<@role>
   ```
   Configure le rôle des giveaways.

7. **Configurer le rôle de l'équipe Q17**
   ```
   /setup q17role role:<@role>
   ```
   Configure le rôle de l'équipe Q17.

8. **Voir les paramètres de configuration actuels**
   ```
   /setup info
   ```
   Affiche les paramètres de configuration actuels.
