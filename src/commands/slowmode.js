module.exports.run = async (client, message, args) => {
	if(!message.member.hasPermission('MANAGE_MESSAGES')) return;

	const amount = args[0];
	if (!amount || isNaN(amount)) return message.channel.send('Invalid amount to set slowmode!');

	const reason = args.slice(1).join(' ');
	message.channel.setRateLimitPerUser(Math.round(amount), reason);

	return message.channel.send('Slowmode set!');
};


exports.help = {
	name: 'slowmode',
	category: 'Moderation',
	description: 'Set slowmode',
	usage: 'slowmode <Amount> [reason]',
};