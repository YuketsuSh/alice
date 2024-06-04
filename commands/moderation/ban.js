const { SlashCommandBuilder } = require('discord.js');
const { pushToArrayDB } = require('../../utils/db');
const { logChannelId, moderationRoleId, allAccessRoleId } = require('../../config/config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban un utilisateur avec une raison spécifique.')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison du ban')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(moderationRoleId) && !interaction.member.roles.cache.has(allAccessRoleId)) {
            return interaction.reply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande.', ephemeral: true });
        }

        const member = interaction.options.getMember('utilisateur');
        const reason = interaction.options.getString('raison');

        if (!member) {
            return interaction.reply({ content: 'Utilisateur non trouvé', ephemeral: true });
        }

        try {
            await member.ban({ reason });
            const logMessage = `${member.user.tag} a été banni pour : ${reason}`;

            pushToArrayDB('moderation_logs', {
                action: 'ban',
                user: member.user.tag,
                userId: member.id,
                reason,
                timestamp: new Date().toISOString(),
            });

            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            if (logChannel) {
                logChannel.send(logMessage);
            }

            return interaction.reply({ content: logMessage });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'Erreur lors du ban de l\'utilisateur.', ephemeral: true });
        }
    },
};
