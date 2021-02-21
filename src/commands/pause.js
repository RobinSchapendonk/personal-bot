const { createEmbed } = require('../utils/message.js');

module.exports.run = async (client, message) => {
	if (!process.env.OWNERS.includes(message.member.id)) return message.channel.send('This is only available for my owner!');

	const serverQueue = client.queue.get(message.guild.id);
	if (serverQueue && serverQueue.playing) {
		serverQueue.playing = false;
		serverQueue.connection.dispatcher.pause();
		const embed = createEmbed(null, '⏸ Paused the music for you!', [], [], 'RANDOM');
		return message.channel.send(embed);
	} else {
		return message.channel.send('There is nothing playing.');
	}
};


exports.help = {
	name: 'pause',
	category: 'Music',
	description: 'Pause the current playing song',
	usage: 'pause',
};