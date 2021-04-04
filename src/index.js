require('dotenv').config();
const {
	CLIENT_TOKEN,
} = process.env;
const { Client, Collection } = require('discord.js');
const { loadCommands, loadEvents } = require('./utils/register');

const client = new Client({ partials: ['CHANNEL'] });
client.commands = new Collection();
client.queue = new Collection();
client.joins = new Collection();
client.messages = new Collection();
client.userMessages = new Collection();

(async () => {
	await loadCommands(client);
	await loadEvents(client);
	await client.login(CLIENT_TOKEN);
})();

module.exports = { client };