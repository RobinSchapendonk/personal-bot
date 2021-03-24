const { join } = require('path');
const { punishments } = require(join(__dirname, '../utils/databases.js'));
const { createEmbed, GetMemberFromArg } = require(join(__dirname, '../utils/message.js'));

module.exports.run = async (client, message, args) => {
	if(!message.member.hasPermission('MANAGE_MESSAGES')) return;
	GetMemberFromArg(args[0], message.guild.members).then(async member => {
		let warnings = punishments.prepare('SELECT * FROM warn WHERE guild = ? AND member = ?').all([message.guild.id, member.id]);

		const page = parseInt(args[1]) || 1;
		warnings = warnings.reverse();
		warnings = warnings.slice((page - 1) * 10, page * 10);

		if (warnings.length == 0) return message.channel.send('This page is empty!');

		const embed = createEmbed(`Warnings for ${member.displayName}`, '', [], [], 'red');

		await warnings.forEach(async warning => {
			let date = new Date(parseInt(warning.time));
			const offset = date.getTimezoneOffset();
			date = new Date(date.getTime() + (offset * 60 * 1000)).toISOString().split('T')[0];
			embed.addField(`At ${date} (ID=\`${warning.uuid}\`)`, warning.reason);
		});
		return message.channel.send(embed);

	}).catch(invalidMemberError => {
		return message.channel.send(invalidMemberError);
	});
};


exports.help = {
	name: 'warnings',
	category: 'Moderation',
	description: 'Check the warnings of a member',
	usage: 'warnings <GuildMember>',
};