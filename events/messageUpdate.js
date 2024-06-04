const { logChannelId } = require('../config/config.json');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage) {
        const logChannel = newMessage.guild.channels.cache.get(logChannelId);
        if (!logChannel) return;

        const logMessage = `Message modifié : ${oldMessage.content} -> ${newMessage.content}`;
        logChannel.send(logMessage);
    },
};