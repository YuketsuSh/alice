const { SlashCommandBuilder } = require('discord.js');
const { pushToArrayDB } = require('../../utils/db');
const { logChannelId, moderationRoleId, allAccessRoleId } = require('../../config/config.json');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute un utilisateur pour une durée déterminée.')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à mute')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('durée')
                .setDescription('La durée du mute')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('unité')
                .setDescription('L\'unité de temps (s = secondes, m = minutes, h = heures, d = jours)')
                .setRequired(true)
                .addChoices(
                    { name: 'secondes', value: 's' },
                    { name: 'minutes', value: 'm' },
                    { name: 'heures', value: 'h' },
                    { name: 'jours', value: 'd' }
                )),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(moderationRoleId) && !interaction.member.roles.cache.has(allAccessRoleId)) {
            return interaction.reply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande.', ephemeral: true });
        }

        const member = interaction.options.getMember('utilisateur');
        const duration = interaction.options.getInteger('durée');
        const unit = interaction.options.getString('unité');

        if (!member) {
            return interaction.reply({ content: 'Utilisateur non trouvé', ephemeral: true });
        }

        let durationMs;
        switch (unit) {
            case 's':
                durationMs = duration * 1000;
                break;
            case 'm':
                durationMs = duration * 60 * 1000;
                break;
            case 'h':
                durationMs = duration * 60 * 60 * 1000;
                break;
            case 'd':
                durationMs = duration * 24 * 60 * 60 * 1000;
                break;
            default:
                return interaction.reply({ content: 'Unité de temps invalide', ephemeral: true });
        }

        try {
            await member.timeout(durationMs, 'Mute command');
            const muteUntil = Date.now() + durationMs;
            const logMessage = `${member.user.tag} a été mute pour ${duration} ${unit}.`;

            pushToArrayDB('moderation_logs', {
                action: 'mute',
                user: member.user.tag,
                userId: member.id,
                guildId: interaction.guild.id,
                duration,
                unit,
                timestamp: new Date().toISOString(),
                muteUntil,
            });

            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            if (logChannel) {
                logChannel.send(logMessage);
            }

            return interaction.reply({ content: logMessage });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Erreur lors du mute de l\'utilisateur.', ephemeral: true });
        }
    },
};
