// deploy-commands.js
const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config/config.json');
const fs = require('fs');
const path = require('path');

// Load commands
const commands = [];
const commandFolders = fs.readdirSync('./commands');

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        if (command.data) {
            commands.push(command.data.toJSON());
        }
    }
}

const dbPath = path.join(__dirname, './database.json');
if (fs.existsSync(dbPath)) {
    const db = JSON.parse(fs.readFileSync(dbPath));
    const announceCommand = commands.find(cmd => cmd.name === 'announce');

    if (announceCommand && db.announcements) {
        const editOption = announceCommand.options.find(opt => opt.name === 'edit').options.find(opt => opt.name === 'id');
        const deleteOption = announceCommand.options.find(opt => opt.name === 'delete').options.find(opt => opt.name === 'id');

        db.announcements.forEach(announcement => {
            const choice = { name: announcement.title, value: announcement.id };
            editOption.choices.push(choice);
            deleteOption.choices.push(choice);
        });
    }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
