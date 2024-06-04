const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { readDB } = require('../../utils/db');

const {allAccessRoleId, moderationRoleId} = require('../../config/config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listreports')
        .setDescription('Lister les rapports d\'un utilisateur.')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur pour lequel lister les rapports')
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
        const reports = db.reports ? db.reports.filter(report => report.userId === member.id) : [];

        if (reports.length === 0) {
            return interaction.reply({ content: 'Aucun rapport trouvé pour cet utilisateur.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`Rapports pour ${member.user.tag}`)
            .setColor('#FF0000')
            .setTimestamp();

        reports.forEach(report => {
            embed.addFields(
                { name: 'ID du Rapport', value: report.id, inline: true },
                { name: 'Raison', value: report.reason, inline: true },
                { name: 'Date', value: report.timestamp, inline: true }
            );
        });

        return interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
