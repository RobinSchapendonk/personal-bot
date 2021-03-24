const { createEmbed } = require('../utils/message.js');

module.exports.run = async (client, message, args) => {
	const serverQueue = client.queue.get(message.guild.id);
	if (!serverQueue) return message.channel.send('There is nothing playing.');

	const page = parseInt(args[1]) || 1;
	const songs = serverQueue.songs.slice(((page - 1) * 10), ((page) * 10));

	if (!songs) return message.channel.send('This page is empty!');

	const embed = createEmbed(null, `__**Song queue:**__\n${songs.map(song => `**-** ${song.title}`).join('\n')}\nShowing ${songs.length} of ${serverQueue.songs.length} songs`, [], [], 'RANDOM');
	return message.channel.send(embed);
};


exports.help = {
	name: 'queue',
	category: 'Music',
	description: 'View the current queue',
	usage: 'queue [page]',
};