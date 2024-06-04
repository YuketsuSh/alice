const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { pushToArrayDB } = require('../../utils/db');
const { logChannelId, q17RoleId, allAccessRoleId } = require('../../config/config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('share')
        .setDescription('Partager une ressource.')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Le type de ressource (article, tutoriel, outil, etc.)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('lien')
                .setDescription('Le lien de la ressource')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Une description de la ressource')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(q17RoleId) && !interaction.member.roles.cache.has(allAccessRoleId)) {
            return interaction.reply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande.', ephemeral: true });
        }

        const type = interaction.options.getString('type');
        const link = interaction.options.getString('lien');
        const description = interaction.options.getString('description');

        const embed = new EmbedBuilder()
            .setTitle('Nouvelle ressource partagée')
            .addFields(
                { name: 'Type', value: type, inline: true },
                { name: 'Lien', value: link, inline: true },
                { name: 'Description', value: description, inline: false }
            )
            .setColor('#00FF00')
            .setTimestamp()
            .setFooter({ text: 'Partagé par ' + interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

        try {
            await interaction.channel.send({ embeds: [embed] });

            pushToArrayDB('q17_shares', {
                type,
                link,
                description,
                user: interaction.user.tag,
                timestamp: new Date().toISOString(),
            });

            return interaction.reply({ content: 'Ressource partagée avec succès.', ephemeral: true });
        } catch (error) {
            console.error('Erreur lors du partage de la ressource :', error);
            return interaction.reply({ content: 'Erreur lors du partage de la ressource.', ephemeral: true });
        }
    },
};
