const { punishments } = require('../utils/databases.js');
const { createEmbed, GetMemberFromArg } = require('../utils/message.js');

module.exports.run = async (client, message, args) => {
	if(!message.member.hasPermission('MANAGE_MESSAGES')) return;
	GetMemberFromArg(args[0], message.guild.members).then(async member => {
		const amountBanned = punishments.prepare('SELECT count(uuid) FROM ban WHERE guild = ? AND member = ?').get([message.guild.id, member.id])['count(uuid)'];
		const amountKicked = punishments.prepare('SELECT count(uuid) FROM kick WHERE guild = ? AND member = ?').get([message.guild.id, member.id])['count(uuid)'];
		const amountWarned = punishments.prepare('SELECT count(uuid) FROM warn WHERE guild = ? AND member = ?').get([message.guild.id, member.id])['count(uuid)'];

		const embed = createEmbed(`Punishments of ${member.displayName}`, '', [['Bans', amountBanned, true], ['Kicks', amountKicked, true], ['Warns', amountWarned, true]], [], 'RANDOM');
		return message.channel.send(embed);
	}).catch(invalidMemberError => {
		return message.channel.send(invalidMemberError);
	});
};


exports.help = {
	name: 'punishments',
	category: 'Moderation',
	description: 'Check the punishments of a member',
	usage: 'punishments <GuildMember>',
};