const { GetMemberFromArg } = require('../utils/message.js');

module.exports.run = async (client, message, args) => {
	if(!message.member.hasPermission('MANAGE_MESSAGES')) return;

	const amount = args[0];
	if (!amount || isNaN(parseInt(amount)) || parseInt(amount) < 1) return message.channel.send('That\'s an invalid amount!');

	let member = null;
	if (args[1]) member = await GetMemberFromArg(args[1], message.guild.members);

	const res = await bulkDelete(message.channel, parseInt(amount), member ? member.id : null);
	return message.channel.send(res);
};


exports.help = {
	name: 'purge',
	category: 'Moderation',
	description: 'Purge messages',
	usage: 'purge <Amount> [GuildMember=All]',
};

const bulkDelete = (channel, amount, memberID = null, before = null) => {
	const deleteAmount = amount < 100 ? amount : 100;
	const obj = { limit: deleteAmount };
	if (before) obj.before = before;

	return channel.messages.fetch(obj).then(messages => {
		if (messages.size == 0) return `I can't delete the first ${amount} messages!`;
		before = messages.last().id;
		if (memberID) messages = messages.filter(msg => msg.author.id == memberID);
		messages = messages.filter(msg => (new Date() - msg.createdAt) < ((1000 * 60 * 60 * 24 * 14) - (1000 * 60 * 30)));

		channel.bulkDelete(messages);
		amount -= messages.size;

		if (amount > 0) return bulkDelete(channel, amount, memberID, before);
		else return true;
	});
};