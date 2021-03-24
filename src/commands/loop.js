const { createEmbed } = require('../utils/message.js');

module.exports.run = async (client, message) => {
	if (!process.env.OWNERS.includes(message.member.id)) return message.channel.send('This is only available for my owner!');

	const serverQueue = client.queue.get(message.guild.id);
	if (!serverQueue) return message.channel.send('There is nothing playing.');

	if (serverQueue.loop) {
		serverQueue.loop = false;
		const embed = createEmbed(null, '🔂 Unlooped the queue!', [], [], 'RANDOM');
		return message.channel.send(embed);
	} else {
		serverQueue.loop = true;
		const embed = createEmbed(null, '🔁 Looped the queue!', [], [], 'RANDOM');
		return message.channel.send(embed);
	}
};


exports.help = {
	name: 'loop',
	category: 'Music',
	description: '(un)loop the queue',
	usage: 'loop',
};