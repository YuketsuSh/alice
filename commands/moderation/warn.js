const { SlashCommandBuilder } = require('discord.js');
const { pushToArrayDB, readDB, writeDB } = require('../../utils/db');
const { logChannelId, moderationRoleId, allAccessRoleId } = require('../../config/config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Avertir un utilisateur avec une raison spécifique.')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à avertir')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison de l\'avertissement')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(moderationRoleId) && !interaction.member.roles.cache.has(allAccessRoleId)) {
            return interaction.reply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande.', ephemeral: true });
        }

        const member = interaction.options.getMember('utilisateur');
        const reason = interaction.options.getString('raison');

        if (!member) {
            return interaction.reply({ content: 'Utilisateur non trouvé', ephemeral: true });
        }

        const db = readDB();
        if (!db.warnings) {
            db.warnings = {};
        }

        if (!db.warnings[member.id]) {
            db.warnings[member.id] = [];
        }
        db.warnings[member.id].push({
            reason,
            timestamp: new Date().toISOString(),
        });

        const warnCount = db.warnings[member.id].length;

        writeDB(db);

        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) {
            logChannel.send(`${member.user.tag} a été averti pour : ${reason}. Avertissements totaux : ${warnCount}`);
        }

        try {
            if (warnCount > 4) {
                await member.ban({ reason: 'Trop d\'avertissements' });
                pushToArrayDB('moderation_logs', {
                    action: 'ban',
                    user: member.user.tag,
                    userId: member.id,
                    reason: 'Trop d\'avertissements',
                    timestamp: new Date().toISOString(),
                });
                logChannel.send(`${member.user.tag} a été banni pour avoir reçu plus de 4 avertissements.`);
            } else if (warnCount > 2) {
                const muteDurationMs = 10 * 60 * 1000;
                await member.timeout(muteDurationMs, 'Trop d\'avertissements');
                pushToArrayDB('moderation_logs', {
                    action: 'mute',
                    user: member.user.tag,
                    userId: member.id,
                    duration: 10,
                    unit: 'm',
                    reason: 'Trop d\'avertissements',
                    timestamp: new Date().toISOString(),
                    muteUntil: Date.now() + muteDurationMs,
                });
                logChannel.send(`${member.user.tag} a été mute pour 10 minutes pour avoir reçu plus de 2 avertissements.`);
            }
        } catch (error) {
            console.error(`Erreur lors de l'application de la sanction :`, error);
        }

        return interaction.reply({ content: `${member.user.tag} a été averti pour : ${reason}. Avertissements totaux : ${warnCount}`, ephemeral: true });
    },
};
