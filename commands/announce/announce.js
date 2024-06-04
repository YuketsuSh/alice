// commands/announce/announce.js
const { SlashCommandBuilder, EmbedBuilder, CommandInteractionOptionResolver } = require('discord.js');
const { pushToArrayDB, readDB, writeDB } = require('../../utils/db');
const { logChannelId, announceChannelId } = require('../../config/config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Gérer les annonces du serveur.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Créer une nouvelle annonce.')
                .addStringOption(option =>
                    option.setName('titre')
                        .setDescription('Le titre de l\'annonce')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('Le message de l\'annonce')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('Modifier une annonce existante.')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('L\'ID de l\'annonce à modifier')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('nouveau_message')
                        .setDescription('Le nouveau message de l\'annonce')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Supprimer une annonce existante.')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('L\'ID de l\'annonce à supprimer')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Lister toutes les annonces disponibles.')),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const announceChannel = interaction.guild.channels.cache.get(announceChannelId);
        if (!announceChannel) {
            return interaction.reply({ content: 'Le salon d\'annonce est introuvable.', ephemeral: true });
        }

        const db = readDB();
        if (!db.announcements) {
            db.announcements = [];
        }

        if (subcommand === 'create') {
            const title = interaction.options.getString('titre');
            const message = interaction.options.getString('message');
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(message)
                .setColor('#0099ff')
                .setTimestamp()
                .setFooter({ text: 'Annonce par ' + interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setThumbnail('https://example.com/thumbnail.png'); // Remplacez par l'URL de votre choix

            try {
                const announceMessage = await announceChannel.send({ embeds: [embed] });
                const announceId = announceMessage.id;

                // Ajouter l'annonce à la base de données
                db.announcements.push({
                    id: announceId,
                    title,
                    message,
                });
                writeDB(db);

                return interaction.reply({ content: 'Annonce créée avec succès.', ephemeral: true });
            } catch (error) {
                console.error('Erreur lors de la création de l\'annonce :', error);
                return interaction.reply({ content: 'Erreur lors de la création de l\'annonce.', ephemeral: true });
            }
        } else if (subcommand === 'edit') {
            const id = interaction.options.getString('id');
            const newMessage = interaction.options.getString('nouveau_message');
            const announcement = db.announcements.find(a => a.id === id);

            if (!announcement) {
                return interaction.reply({ content: 'Annonce introuvable.', ephemeral: true });
            }

            const announceMessage = await announceChannel.messages.fetch(id).catch(() => null);
            if (!announceMessage) {
                return interaction.reply({ content: 'Message d\'annonce introuvable.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle(announcement.title)
                .setDescription(newMessage)
                .setColor('#0099ff')
                .setTimestamp()
                .setFooter({ text: 'Annonce par ' + interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .setThumbnail('https://example.com/thumbnail.png'); // Remplacez par l'URL de votre choix

            try {
                await announceMessage.edit({ embeds: [embed] });

                // Mettre à jour l'annonce dans la base de données
                announcement.message = newMessage;
                writeDB(db);

                return interaction.reply({ content: 'Annonce modifiée avec succès.', ephemeral: true });
            } catch (error) {
                console.error('Erreur lors de la modification de l\'annonce :', error);
                return interaction.reply({ content: 'Erreur lors de la modification de l\'annonce.', ephemeral: true });
            }
        } else if (subcommand === 'delete') {
            const id = interaction.options.getString('id');
            const announcementIndex = db.announcements.findIndex(a => a.id === id);

            if (announcementIndex === -1) {
                return interaction.reply({ content: 'Annonce introuvable.', ephemeral: true });
            }

            const announceMessage = await announceChannel.messages.fetch(id).catch(() => null);
            if (!announceMessage) {
                return interaction.reply({ content: 'Message d\'annonce introuvable.', ephemeral: true });
            }

            try {
                await announceMessage.delete();

                // Supprimer l'annonce de la base de données
                db.announcements.splice(announcementIndex, 1);
                writeDB(db);

                return interaction.reply({ content: 'Annonce supprimée avec succès.', ephemeral: true });
            } catch (error) {
                console.error('Erreur lors de la suppression de l\'annonce :', error);
                return interaction.reply({ content: 'Erreur lors de la suppression de l\'annonce.', ephemeral: true });
            }
        } else if (subcommand === 'list') {
            if (db.announcements.length === 0) {
                return interaction.reply({ content: 'Aucune annonce disponible.', ephemeral: true });
            }

            const listEmbed = new EmbedBuilder()
                .setTitle('Annonces disponibles')
                .setColor('#0099ff')
                .setTimestamp();

            db.announcements.forEach(announcement => {
                listEmbed.addFields({ name: `ID: ${announcement.id}`, value: announcement.title });
            });

            return interaction.reply({ embeds: [listEmbed], ephemeral: true });
        }
    },
};
