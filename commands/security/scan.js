const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('os');

const {allAccessRoleId} = require('../../config/config.json');
const {readDB} = require("../../utils/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('scan')
        .setDescription('Scanner l\'intégrité de l\'infrastructure.'),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(allAccessRoleId)) {
            return interaction.reply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande.', ephemeral: true });
        }

        const scanMessage = await interaction.reply({ content: 'Scanning de l\'intégrité de l\'infrastructure <a:loading:1247630806529216574>', fetchReply: true });

        setTimeout(async () => {
            const ping = interaction.client.ws.ping;
            const uptime = process.uptime();
            const db = readDB();

            const freeMemory = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
            const totalMemory = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
            const cpuModel = os.cpus()[0].model;
            const cpuSpeed = os.cpus()[0].speed;
            const cpuCores = os.cpus().length;
            const systemUptime = (os.uptime() / 60 / 60).toFixed(2);

            const embed = new EmbedBuilder()
                .setTitle('Résultat du Scan')
                .addFields(
                    { name: 'Ping', value: `${ping}ms`, inline: true },
                    { name: 'Uptime du bot', value: `${Math.floor(uptime / 60)} minutes`, inline: true },
                    { name: 'Mémoire libre', value: `${freeMemory} Go`, inline: true },
                    { name: 'Mémoire totale', value: `${totalMemory} Go`, inline: true },
                    { name: 'Modèle du CPU', value: `${cpuModel}`, inline: true },
                    { name: 'Vitesse du CPU', value: `${cpuSpeed} MHz`, inline: true },
                    { name: 'Cœurs du CPU', value: `${cpuCores}`, inline: true },
                    { name: 'Uptime du système', value: `${systemUptime} heures`, inline: true },
                    { name: 'Statut de la base de données', value: db ? 'Connecté' : 'Déconnecté', inline: true }
                )
                .setColor('#00FF00')
                .setTimestamp();

            await scanMessage.edit({ content: '', embeds: [embed] });
        }, 2000);
    },
};