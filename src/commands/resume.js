const { createEmbed } = require('../utils/message.js');

module.exports.run = async (client, message) => {
	if (!process.env.OWNERS.includes(message.member.id)) return message.channel.send('This is only available for my owner!');

	const serverQueue = client.queue.get(message.guild.id);
	if (serverQueue && !serverQueue.playing) {
		serverQueue.playing = true;
		serverQueue.connection.dispatcher.resume();
		const embed = createEmbed(null, '▶ Resumed the music for you!', [], [], 'RANDOM');
		return message.channel.send(embed);
	} else {
		return message.channel.send('There is nothing playing.');
	}
};


exports.help = {
	name: 'resume',
	category: 'Music',
	description: 'Resume the current paused song',
	usage: 'resume',
};