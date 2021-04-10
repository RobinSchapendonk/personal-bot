const { join } = require('path');
const databases = require(join(__dirname, '../utils/databases.js'));
const settings = databases.settings;

module.exports.run = async (client, message, args) => {
	const oldCooldown = settings.prepare('SELECT * FROM messageProtection WHERE guild = ?').get(message.guild.id);
	const global = args[0] || 'default';
	const user = args[1] || 'default';

	if (isNaN(global) && global !== 'default') return message.channel.send('Invalid input!');
	if (isNaN(user) && user !== 'default') return message.channel.send('Invalid input!');

	if (oldCooldown) {
		settings.prepare('UPDATE messageProtection SET global = ?, user = ? WHERE guild = ?').run([global, user, message.guild.id]);
	} else {
		settings.prepare('INSERT INTO messageProtection (guild, global, user) VALUES (?,?,?)').run([message.guild.id, global, user]);
	}

	return message.channel.send(`Global message protection is set to ${global == 'default' ? 'the default 0.1' : global} seconds!\nUser message protection is set to ${user == 'default' ? 'the default 0.5' : user} seconds!`);
};

module.exports.help = {
	name: 'messageprotection',
	category: 'Protection',
	description: 'Enable mass spam protection',
	usage: 'messageprotection [Global cooldown=Default] [User cooldown=Default]',
};