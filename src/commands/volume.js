const { createEmbed } = require('../utils/message.js');

module.exports.run = async (client, message, args) => {
	if (!process.env.OWNERS.includes(message.member.id)) return message.channel.send('This is only available for my owner!');

	const { channel } = message.member.voice;
	if (!channel) return message.channel.send('I\'m sorry but you need to be in a voice channel to play music!');

	const serverQueue = message.client.queue.get(message.guild.id);
	if (!serverQueue) return message.channel.send('There is nothing playing.');

	if (!args[0]) {
		const embed = createEmbed(null, `The current volume is: **${serverQueue.volume}**`, [], [], 'RANDOM');
		return message.channel.send(embed);
	}
	serverQueue.volume = args[0];
	serverQueue.connection.dispatcher.setVolumeLogarithmic(args[0] / 5);

	const embed = createEmbed(null, `I set the volume to: **${args[0]}**`, [], [], 'RANDOM');
	return message.channel.send(embed);
};


exports.help = {
	name: 'volume',
	category: 'Music',
	description: 'Set the volume to play',
	usage: 'volume <newVolume>',
};