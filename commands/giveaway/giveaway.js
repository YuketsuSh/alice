const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { pushToArrayDB, readDB, writeDB } = require('../../utils/db');
const { logChannelId, giveawayChannelId, giveawayRoleId, allAccessRoleId } = require('../../config/config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Gérer les giveaways du serveur.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Créer un nouveau giveaway.')
                .addStringOption(option =>
                    option.setName('objet')
                        .setDescription('L\'objet du giveaway')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('durée')
                        .setDescription('La durée du giveaway en minutes')
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('salon')
                        .setDescription('Le salon où le giveaway sera posté')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('Modifier un giveaway existant.')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('L\'ID du giveaway à modifier')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('nouvel_objet')
                        .setDescription('Le nouvel objet du giveaway')
                        .setRequired(false))
                .addIntegerOption(option =>
                    option.setName('nouvelle_durée')
                        .setDescription('La nouvelle durée du giveaway en minutes')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Supprimer un giveaway existant.')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('L\'ID du giveaway à supprimer')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Lister tous les giveaways disponibles.')),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has(giveawayRoleId) && !interaction.member.roles.cache.has(allAccessRoleId)) {
            return interaction.reply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande.', ephemeral: true });
        }

        const subcommand = interaction.options.getSubcommand();
        const giveawayChannel = interaction.guild.channels.cache.get(giveawayChannelId);
        if (!giveawayChannel) {
            return interaction.reply({ content: 'Le salon de giveaway est introuvable.', ephemeral: true });
        }

        const db = readDB();
        if (!db.giveaways) {
            db.giveaways = [];
        }

        if (subcommand === 'create') {
            const object = interaction.options.getString('objet');
            const duration = interaction.options.getInteger('durée');
            const channel = interaction.options.getChannel('salon');
            const embed = new EmbedBuilder()
                .setTitle('🎉 Giveaway 🎉')
                .setDescription(`Objet: **${object}**\nDurée: **${duration} minutes**`)
                .setColor('#00FF00')
                .setTimestamp()
                .setFooter({ text: `Giveaway par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            const button = new ButtonBuilder()
                .setCustomId('participer')
                .setLabel('Participer')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder().addComponents(button);

            try {
                const giveawayMessage = await channel.send({ embeds: [embed], components: [row] });
                const giveawayId = giveawayMessage.id;
                const endTime = Date.now() + duration * 60 * 1000;

                db.giveaways.push({
                    id: giveawayId,
                    object,
                    endTime,
                    participants: [],
                });
                writeDB(db);

                setTimeout(async () => {
                    const giveawayIndex = db.giveaways.findIndex(g => g.id === giveawayId);
                    if (giveawayIndex !== -1) {
                        const winner = db.giveaways[giveawayIndex].participants[Math.floor(Math.random() * db.giveaways[giveawayIndex].participants.length)];
                        const winnerMessage = winner ? `Félicitations à <@${winner}> pour avoir gagné **${object}**!` : 'Aucun participant n\'a été trouvé.';

                        const resultEmbed = new EmbedBuilder()
                            .setTitle('🎉 Giveaway terminé 🎉')
                            .setDescription(winnerMessage)
                            .setColor('#FF0000')
                            .setTimestamp();

                        await giveawayMessage.edit({ embeds: [resultEmbed], components: [] });

                        db.giveaways.splice(giveawayIndex, 1);
                        writeDB(db);
                    }
                }, duration * 60 * 1000);

                return interaction.reply({ content: 'Giveaway créé avec succès.', ephemeral: true });
            } catch (error) {
                console.error('Erreur lors de la création du giveaway :', error);
                return interaction.reply({ content: 'Erreur lors de la création du giveaway.', ephemeral: true });
            }
        } else if (subcommand === 'edit') {
            const id = interaction.options.getString('id');
            const newObject = interaction.options.getString('nouvel_objet');
            const newDuration = interaction.options.getInteger('nouvelle_durée');
            const giveaway = db.giveaways.find(g => g.id === id);

            if (!giveaway) {
                return interaction.reply({ content: 'Giveaway introuvable.', ephemeral: true });
            }

            if (newObject) {
                giveaway.object = newObject;
            }

            if (newDuration) {
                giveaway.endTime = Date.now() + newDuration * 60 * 1000;
            }

            writeDB(db);

            const giveawayMessage = await giveawayChannel.messages.fetch(id).catch(() => null);
            if (!giveawayMessage) {
                return interaction.reply({ content: 'Message de giveaway introuvable.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('🎉 Giveaway 🎉')
                .setDescription(`Objet: **${giveaway.object}**\nDurée: **${Math.round((giveaway.endTime - Date.now()) / 60000)} minutes**`)
                .setColor('#00FF00')
                .setTimestamp()
                .setFooter({ text: `Giveaway par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            try {
                await giveawayMessage.edit({ embeds: [embed] });
                return interaction.reply({ content: 'Giveaway modifié avec succès.', ephemeral: true });
            } catch (error) {
                console.error('Erreur lors de la modification du giveaway :', error);
                return interaction.reply({ content: 'Erreur lors de la modification du giveaway.', ephemeral: true });
            }
        } else if (subcommand === 'delete') {
            const id = interaction.options.getString('id');
            const giveawayIndex = db.giveaways.findIndex(g => g.id === id);

            if (giveawayIndex === -1) {
                return interaction.reply({ content: 'Giveaway introuvable.', ephemeral: true });
            }

            const giveawayMessage = await giveawayChannel.messages.fetch(id).catch(() => null);
            if (!giveawayMessage) {
                return interaction.reply({ content: 'Message de giveaway introuvable.', ephemeral: true });
            }

            try {
                await giveawayMessage.delete();

                db.giveaways.splice(giveawayIndex, 1);
                writeDB(db);

                return interaction.reply({ content: 'Giveaway supprimé avec succès.', ephemeral: true });
            } catch (error) {
                console.error('Erreur lors de la suppression du giveaway :', error);
                return interaction.reply({ content: 'Erreur lors de la suppression du giveaway.', ephemeral: true });
            }
        } else if (subcommand === 'list') {
            if (db.giveaways.length === 0) {
                return interaction.reply({ content: 'Aucun giveaway disponible.', ephemeral: true });
            }

            const listEmbed = new EmbedBuilder()
                .setTitle('Giveaways disponibles')
                .setColor('#00FF00')
                .setTimestamp();

            db.giveaways.forEach(giveaway => {
                listEmbed.addFields({ name: `ID: ${giveaway.id}`, value: `Objet: ${giveaway.object}\nDurée restante: ${Math.round((giveaway.endTime - Date.now()) / 60000)} minutes` });
            });

            return interaction.reply({ embeds: [listEmbed], ephemeral: true });
        }
    },
};
