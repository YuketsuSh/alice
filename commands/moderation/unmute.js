const { SlashCommandBuilder } = require('discord.js');
const { pushToArrayDB, readDB, writeDB } = require('../../utils/db');
const { logChannelId, moderationRoleId, allAccessRoleId} = require('../../config/config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute un utilisateur.')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à unmute')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(moderationRoleId) && !interaction.member.roles.cache.has(allAccessRoleId)) {
            return interaction.reply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande.', ephemeral: true });
        }

        const member = interaction.options.getMember('utilisateur');

        if (!member) {
            return interaction.reply({ content: 'Utilisateur non trouvé', ephemeral: true });
        }

        try {
            await member.timeout(null);
            const logMessage = `${member.user.tag} a été unmute.`;

            const db = readDB();
            if (db.moderation_logs) {
                db.moderation_logs = db.moderation_logs.filter(log => !(log.action === 'mute' && log.userId === member.id));
                writeDB(db);
            }

            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            if (logChannel) {
                logChannel.send(logMessage);
            }

            return interaction.reply({ content: logMessage });
        } catch (error) {
            console.error(`Erreur lors du unmute de l'utilisateur :`, error);
            return interaction.reply({ content: 'Erreur lors du unmute de l\'utilisateur.', ephemeral: true });
        }
    },
};
