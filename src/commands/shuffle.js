const { createEmbed } = require('../utils/message.js');

module.exports.run = async (client, message) => {
	if (!process.env.OWNERS.includes(message.member.id)) return message.channel.send('This is only available for my owner!');

	const serverQueue = client.queue.get(message.guild.id);
	if (!serverQueue) return message.channel.send('There is nothing playing.');

	shuffleArray(serverQueue.songs);

	const embed = createEmbed(null, '🔀 Shuffled the songs!', [], [], 'RANDOM');
	return message.channel.send(embed);
};


exports.help = {
	name: 'shuffle',
	category: 'Music',
	description: 'Shuffle the queue',
	usage: 'shuffle',
};

function shuffleArray(array) {
	for (let i = array.length - 1; i > 1; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}