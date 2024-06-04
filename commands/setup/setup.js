const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const {configPath, allAccessRoleId} = './config/config.json';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Configurer les paramètres du bot.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('logchannel')
                .setDescription('Configurer le salon de logs.')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Le salon de logs')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('announcechannel')
                .setDescription('Configurer le salon des annonces.')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Le salon des annonces')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('giveawaychannel')
                .setDescription('Configurer le salon des giveaways.')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Le salon des giveaways')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('moderationrole')
                .setDescription('Configurer le rôle de modération.')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Le rôle de modération')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('allaccessrole')
                .setDescription('Configurer le rôle d\'accès complet.')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Le rôle d\'accès complet')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('giveawayrole')
                .setDescription('Configurer le rôle des giveaways.')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Le rôle des giveaways')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('q17role')
                .setDescription('Configurer le rôle de l\'équipe Q17.')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Le rôle de l\'équipe Q17')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Voir les paramètres de configuration actuels.')),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(allAccessRoleId)) {
            return interaction.reply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande.', ephemeral: true });
        }
        const subcommand = interaction.options.getSubcommand();
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

        if (subcommand === 'logchannel') {
            const channel = interaction.options.getChannel('channel');
            config.logChannelId = channel.id;
        } else if (subcommand === 'announcechannel') {
            const channel = interaction.options.getChannel('channel');
            config.announceChannelId = channel.id;
        } else if (subcommand === 'giveawaychannel') {
            const channel = interaction.options.getChannel('channel');
            config.giveawayChannelId = channel.id;
        } else if (subcommand === 'moderationrole') {
            const role = interaction.options.getRole('role');
            config.moderationRoleId = role.id;
        } else if (subcommand === 'allaccessrole') {
            const role = interaction.options.getRole('role');
            config.allAccessRoleId = role.id;
        } else if (subcommand === 'giveawayrole') {
            const role = interaction.options.getRole('role');
            config.giveawayRoleId = role.id;
        } else if (subcommand === 'q17role') {
            const role = interaction.options.getRole('role');
            config.q17RoleId = role.id;
        } else if (subcommand === 'info') {
            const embed = new EmbedBuilder()
                .setTitle('Paramètres de Configuration Actuels')
                .setColor('#0099ff')
                .addFields(
                    { name: 'Log Channel ID', value: config.logChannelId || 'Non configuré', inline: true },
                    { name: 'Announce Channel ID', value: config.announceChannelId || 'Non configuré', inline: true },
                    { name: 'Giveaway Channel ID', value: config.giveawayChannelId || 'Non configuré', inline: true },
                    { name: 'Moderation Role ID', value: config.moderationRoleId || 'Non configuré', inline: true },
                    { name: 'All Access Role ID', value: config.allAccessRoleId || 'Non configuré', inline: true },
                    { name: 'Giveaway Role ID', value: config.giveawayRoleId || 'Non configuré', inline: true },
                    { name: 'Q17 Role ID', value: config.q17RoleId || 'Non configuré', inline: true }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
        return interaction.reply({ content: `Configuration mise à jour pour ${subcommand}.`, ephemeral: true });
    },
};
