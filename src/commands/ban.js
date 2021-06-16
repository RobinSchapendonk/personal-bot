const { punishments } = require('../utils/databases.js');
const { getUUID } = require('../utils/functions.js');
const { GetMemberFromArg } = require('../utils/message.js');

module.exports.run = async (client, message, args) => {
	if(!message.member.hasPermission('BAN_MEMBERS')) return;
	GetMemberFromArg(args[0], message.guild.members).then(async member => {
		if(member.id == message.member.id) return message.channel.send('You can\'t ban yourself!');

		const reason = args.slice(1).join(' ') || 'No reason provided';
		if(reason.length > 512) return message.channel.send(`The reason can't be longer than 512 characters! (You have ${reason.length - 512} characters too much)`);

		const positionDifference = message.member.roles.highest.comparePositionTo(member.roles.highest);
		if(positionDifference <= 0) return message.channel.send('You can\'t ban members with equal or higher position!');

		if(!member.bannable) return message.channel.send('I have no permissions to ban this user!');

		const uuid = await getUUID(message.channel.id, message.id);

		try {
			await member.send(`You're banned for ${reason}!`);
		} catch (e) { return; }

		member.ban({ reason })
			.then(async () => {
				punishments.prepare('INSERT INTO ban (uuid, guild, member, moderator, reason, time) VALUES (?,?,?,?,?,?)').run([uuid, message.guild.id, member.id, message.author.id, reason, message.createdAt.getTime()]);

				const previous = punishments.prepare('SELECT count(uuid) FROM ban WHERE guild = ? AND member = ?').get([message.guild.id, member.id]);
				const amount = previous['count(uuid)'];

				return message.channel.send(`Banned ${member.displayName} for ${reason}! (He has been banned ${amount - 1} times before!)`);
			})
			.catch(async err => {
				return message.channel.send(`Oops, it seems like something went wrong!\n${err}`);
			});
	}).catch(invalidMemberError => {
		return message.channel.send(invalidMemberError);
	});
};


exports.help = {
	name: 'ban',
	category: 'Moderation',
	description: 'Ban a member',
	usage: 'ban <GuildMember> [Reason=No reason provided]',
};