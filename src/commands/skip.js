module.exports.run = async (client, message) => {
	if (!process.env.OWNERS.includes(message.member.id)) return message.channel.send('This is only available for my owner!');

	const { channel } = message.member.voice;
	if (!channel) return message.channel.send('I\'m sorry but you need to be in a voice channel to play music!');

	const serverQueue = client.queue.get(message.guild.id);
	if (!serverQueue) return message.channel.send('There is nothing playing that I could skip for you.');

	serverQueue.connection.dispatcher.end('Skip command has been used!');
};


exports.help = {
	name: 'skip',
	category: 'Music',
	description: 'Skip the current playing song',
	usage: 'skip',
};