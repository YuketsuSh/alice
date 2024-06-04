const { SlashCommandBuilder } = require('discord.js');

const {allAccessRoleId} = require('../../config/config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Déverrouiller le serveur.'),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(allAccessRoleId)) {
            return interaction.reply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande.', ephemeral: true });
        }

        const role = interaction.guild.roles.everyone;

        role.setPermissions(role.permissions.add('SEND_MESSAGES')).catch(console.error);

        return interaction.reply({ content: 'Le serveur a été déverrouillé.', ephemeral: true });
    },
};
