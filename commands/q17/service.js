const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { pushToArrayDB } = require('../../utils/db');
const { logChannelId, q17RoleId, allAccessRoleId } = require('../../config/config.json');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('service')
        .setDescription('Proposer ou rechercher des services.')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Le type de service (freelance, collaboration, etc.)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Une description du service')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('contact')
                .setDescription('Les informations de contact')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(q17RoleId) && !interaction.member.roles.cache.has(allAccessRoleId)) {
            return interaction.reply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande.', ephemeral: true });
        }

        const type = interaction.options.getString('type');
        const description = interaction.options.getString('description');
        const contact = interaction.options.getString('contact');

        const embed = new EmbedBuilder()
            .setTitle('Nouveau service proposé/recherché')
            .addFields(
                { name: 'Type', value: type, inline: true },
                { name: 'Description', value: description, inline: false },
                { name: 'Contact', value: contact, inline: false }
            )
            .setColor('#00FF00')
            .setTimestamp()
            .setFooter({ text: 'Proposé par ' + interaction.user.tag, iconURL: interaction.user.displayAvatarURL() });

        try {
            await interaction.channel.send({ embeds: [embed] });

            pushToArrayDB('q17_services', {
                type,
                description,
                contact,
                user: interaction.user.tag,
                timestamp: new Date().toISOString(),
            });

            return interaction.reply({ content: 'Service partagé avec succès.', ephemeral: true });
        } catch (error) {
            console.error('Erreur lors du partage du service :', error);
            return interaction.reply({ content: 'Erreur lors du partage du service.', ephemeral: true });
        }
    },
};
