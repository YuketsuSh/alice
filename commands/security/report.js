const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const { pushToArrayDB, readDB, writeDB } = require('../../utils/db');
const { logChannelId } = require('../../config/config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Signaler un utilisateur suspect ou un comportement inapproprié.')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur suspect')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison du signalement')
                .setRequired(true)),
    async execute(interaction) {

        const member = interaction.options.getMember('utilisateur');
        const reason = interaction.options.getString('raison');

        if (!member) {
            return interaction.reply({ content: 'Utilisateur non trouvé', ephemeral: true });
        }

        const reportData = {
            id: uuidv4(),
            user: member.user.tag,
            userId: member.id,
            reason: reason,
            reportedBy: interaction.user.tag,
            timestamp: new Date().toISOString(),
        };

        pushToArrayDB('reports', reportData);

        const embed = new EmbedBuilder()
            .setTitle('Utilisateur Signalé')
            .setDescription(`**Utilisateur :** ${member.user.tag}\n**Raison :** ${reason}\n**ID du Rapport :** ${reportData.id}`)
            .setColor('#FF0000')
            .setTimestamp();

        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) {
            logChannel.send({ embeds: [embed] });
        }

        return interaction.reply({ content: 'Utilisateur signalé avec succès.', ephemeral: true });
    },
};
