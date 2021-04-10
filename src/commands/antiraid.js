const { join } = require('path');
const databases = require(join(__dirname, '../utils/databases.js'));
const settings = databases.settings;

module.exports.run = async (client, message) => {
	const messageProtection = settings.prepare('SELECT * FROM messageProtection WHERE guild = ?').get(message.guild.id);
	const joinProtection = settings.prepare('SELECT * FROM joinProtection WHERE guild = ?').get(message.guild.id);

	return message.channel.send(`guild messageProtection: ${messageProtection ? messageProtection.global : 'disabled'}\nuser messageProtection: ${messageProtection ? messageProtection.user : 'disabled'}\njoinProtection: ${joinProtection ? joinProtection.cooldown : 'disabled'}`);
};

module.exports.help = {
	name: 'antiraid',
	category: 'Protection',
	description: 'Check if all anti raid is enabled',
	usage: 'antiraid',
};