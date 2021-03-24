const { join } = require('path');
const { punishments } = require(join(__dirname, '../utils/databases.js'));
const { getUUID } = require(join(__dirname, '../utils/functions.js'));
const { GetMemberFromArg } = require(join(__dirname, '../utils/message.js'));

module.exports.run = async (client, message, args) => {
	if(!message.member.hasPermission('MANAGE_MESSAGES')) return;
	GetMemberFromArg(args[0], message.guild.members).then(async member => {
		if(member.id == message.member.id) return message.channel.send('You can\'t warn yourself!');

		const reason = args.slice(1).join(' ') || 'No reason provided';
		if(reason.length > 512) return message.channel.send(`The reason can't be longer than 512 characters! (You have ${reason.length - 512} characters too much)`);

		const positionDifference = message.member.roles.highest.comparePositionTo(member.roles.highest);
		if(positionDifference <= 0) return message.channel.send('You can\'t warn members with equal or higher position!');

		const uuid = await getUUID(message.channel.id, message.id);

		try {
			await member.send(`You're warned for ${reason}!`);
		} catch (e) { return; }

		punishments.prepare('INSERT INTO warn (uuid, guild, member, moderator, reason, time) VALUES (?,?,?,?,?,?)').run([uuid, message.guild.id, member.id, message.author.id, reason, message.createdAt.getTime()]);

		const previous = punishments.prepare('SELECT count(uuid) FROM warn WHERE guild = ? AND member = ?').get([message.guild.id, member.id]);
		const amount = previous['count(uuid)'];

		return message.channel.send(`Warned ${member.displayName} for ${reason}! (He has been warned ${amount - 1} times before!)`);
	}).catch(invalidMemberError => {
		return message.channel.send(invalidMemberError);
	});
};


exports.help = {
	name: 'warn',
	category: 'Moderation',
	description: 'Warn a member',
	usage: 'warn <GuildMember> [Reason=No reason provided]',
};