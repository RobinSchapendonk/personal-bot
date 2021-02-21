const { createEmbed } = require('../utils/message.js');

module.exports.run = async (client, message) => {
	const serverQueue = client.queue.get(message.guild.id);
	if (!serverQueue) return message.channel.send('There is nothing playing.');

	const embed = createEmbed(null, `🎶 Now playing: **${serverQueue.songs[0].title}**`, [], [], 'RANDOM');
	return message.channel.send(embed);
};


exports.help = {
	name: 'np',
	category: 'Music',
	description: 'View the current playing song',
	usage: 'np',
};