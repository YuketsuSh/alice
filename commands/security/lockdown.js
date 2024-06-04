const { SlashCommandBuilder } = require('discord.js');

const allAccessRoleId = require('../../config/config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lockdown')
        .setDescription('Verrouiller le serveur en cas d\'urgence.'),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(allAccessRoleId)) {
            return interaction.reply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande.', ephemeral: true });
        }

        const role = interaction.guild.roles.everyone;

        role.setPermissions(role.permissions.remove('SEND_MESSAGES')).catch(console.error);

        return interaction.reply({ content: 'Le serveur est maintenant en mode lockdown.', ephemeral: true });
    },
};