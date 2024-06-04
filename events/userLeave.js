const { logChannelId } = require('../config/config.json');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        const logChannel = member.guild.channels.cache.get(logChannelId);
        if (!logChannel) return;

        const logMessage = `Utilisateur quitté : ${member.user.tag}`;
        logChannel.send(logMessage);
    },
};