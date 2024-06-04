const { SlashCommandBuilder } = require('discord.js');
const { readDB, writeDB } = require('../../utils/db');
const { logChannelId, moderationRoleId, allAccessRoleId } = require('../../config/config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnreset')
        .setDescription('Réinitialiser les avertissements d\'un utilisateur.')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur dont les avertissements doivent être réinitialisés')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(moderationRoleId) && !interaction.member.roles.cache.has(allAccessRoleId)) {
            return interaction.reply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande.', ephemeral: true });
        }

        const member = interaction.options.getMember('utilisateur');

        if (!member) {
            return interaction.reply({ content: 'Utilisateur non trouvé', ephemeral: true });
        }

        const db = readDB();
        if (db.warnings && db.warnings[member.id]) {
            delete db.warnings[member.id];
            writeDB(db);

            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            if (logChannel) {
                logChannel.send(`Les avertissements de ${member.user.tag} ont été réinitialisés.`);
            }

            return interaction.reply({ content: `Les avertissements de ${member.user.tag} ont été réinitialisés.`, ephemeral: true });
        } else {
            return interaction.reply({ content: `${member.user.tag} n'a aucun avertissement.`, ephemeral: true });
        }
    },
};
