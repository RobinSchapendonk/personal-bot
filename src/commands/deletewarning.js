const { punishments } = require('../utils/databases.js');

module.exports.run = async (client, message, args) => {
	if(!message.member.hasPermission('MANAGE_MESSAGES')) return;

	const UUID = args[0];
	if (!UUID) return message.channel.send('That\'s an invalid ID!');

	const x = punishments.prepare('DELETE FROM warn WHERE uuid = ?').run([UUID]);
	if (x.changes < 1) return message.channel.send('That\'s an invalid ID!');
	else return message.channel.send('Deleted the warning!');
};


exports.help = {
	name: 'deletewarning',
	category: 'Moderation',
	description: 'Delete a warning',
	usage: 'deletewarning <ID>',
};