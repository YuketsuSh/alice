const { logChannelId } = require('../config/config.json');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const logChannel = member.guild.channels.cache.get(logChannelId);
        if (!logChannel) return;

        const logMessage = `Utilisateur rejoint : ${member.user.tag}`;
        logChannel.send(logMessage);
    },
};