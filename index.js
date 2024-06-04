const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token, logChannelId, giveawayChannelId } = require('./config/config.json');
const { readDB, writeDB } = require('./utils/db');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

client.commands = new Collection();
const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.data.name, command);
    }
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    checkMutes(client);
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    } else if (interaction.isButton()) {
        const db = readDB();
        const giveaway = db.giveaways.find(g => g.id === interaction.message.id);

        if (!giveaway) {
            return interaction.reply({ content: 'Giveaway introuvable.', ephemeral: true });
        }

        if (giveaway.participants.includes(interaction.user.id)) {
            return interaction.reply({ content: 'Vous participez déjà à ce giveaway.', ephemeral: true });
        }

        giveaway.participants.push(interaction.user.id);
        writeDB(db);

        return interaction.reply({ content: 'Vous participez maintenant au giveaway.', ephemeral: true });
    }
});

client.login(token);

function checkMutes(client) {
    setInterval(async () => {
        const db = readDB();
        const now = Date.now();
        const logChannel = client.channels.cache.get(logChannelId);

        if (!logChannel) {
            console.error(`Log channel not found with ID: ${logChannelId}`);
            return;
        }

        if (db.moderation_logs) {
            for (const log of db.moderation_logs) {
                if (log.action === 'mute' && log.muteUntil <= now) {
                    const guild = client.guilds.cache.get(log.guildId);
                    if (guild) {
                        const member = guild.members.cache.get(log.userId);
                        if (member) {
                            try {
                                await member.timeout(null);
                                logChannel.send(`${member.user.tag} a été démute automatiquement.`);
                                console.log(`Unmuted ${member.user.tag} and sent log message.`);
                            } catch (error) {
                                console.error(`Failed to unmute ${member.user.tag}:`, error);
                            }
                        } else {
                            console.error(`Member not found with ID: ${log.userId}`);
                        }
                    } else {
                        console.error(`Guild not found with ID: ${log.guildId}`);
                    }
                }
            }

            db.moderation_logs = db.moderation_logs.filter(log => log.action !== 'mute' || log.muteUntil > now);
            writeDB(db);
        }
    }, 60000);
}
