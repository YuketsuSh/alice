const { SlashCommandBuilder } = require('discord.js');
const { readDB, writeDB } = require('../../utils/db');

const {allAccessRoleId, moderationRoleId} = require('../../config/config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deletereport')
        .setDescription('Supprimer un rapport par ID.')
        .addStringOption(option =>
            option.setName('reportid')
                .setDescription('L\'ID du rapport à supprimer')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(moderationRoleId) && !interaction.member.roles.cache.has(allAccessRoleId)) {
            return interaction.reply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande.', ephemeral: true });
        }

        const reportId = interaction.options.getString('reportid');
        const db = readDB();

        if (!db.reports) {
            return interaction.reply({ content: 'Aucun rapport trouvé.', ephemeral: true });
        }

        const reportIndex = db.reports.findIndex(report => report.id === reportId);
        if (reportIndex === -1) {
            return interaction.reply({ content: 'Rapport non trouvé.', ephemeral: true });
        }

        db.reports.splice(reportIndex, 1);
        writeDB(db);

        return interaction.reply({ content: 'Rapport supprimé avec succès.', ephemeral: true });
    },
};
