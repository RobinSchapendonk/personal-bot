const { settings } = require('../utils/databases.js');

module.exports.run = async (client, message, args) => {
	const oldCooldown = settings.prepare('SELECT * FROM joinProtection WHERE guild = ?').get(message.guild.id);
	const newCooldown = args[0] || 'default';

	if (isNaN(newCooldown) && newCooldown !== 'default') return message.channel.send('Invalid input!');

	if (oldCooldown) {
		settings.prepare('UPDATE joinProtection SET cooldown = ? WHERE guild = ?').run([newCooldown, message.guild.id]);
	} else {
		settings.prepare('INSERT INTO joinProtection (guild, cooldown) VALUES (?,?)').run([message.guild.id, newCooldown]);
	}

	return message.channel.send(`Join protection is set to ${newCooldown == 'default' ? 'the default ' + Math.round(2500 / message.guild.memberCount) : newCooldown} seconds!`);
};

module.exports.help = {
	name: 'joinprotection',
	category: 'Protection',
	description: 'Enable mass join protection',
	usage: 'joinprotection [Cooldown=default]',
};