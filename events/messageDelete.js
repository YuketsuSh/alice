const { logChannelId } = require('../config/config.json');

module.exports = {
    name: 'messageDelete',
    async execute(message) {
        const logChannel = message.guild.channels.cache.get(logChannelId);
        if (!logChannel) return;

        const logMessage = message.partial
            ? `Message supprimé (partiellement chargé) : ${message.id}`
            : `Message supprimé : ${message.content}`;

        logChannel.send(logMessage);
    },
};