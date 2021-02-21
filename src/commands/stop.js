module.exports.run = async (client, message) => {
	if (!process.env.OWNERS.includes(message.member.id)) return message.channel.send('This is only available for my owner!');

	const { channel } = message.member.voice;
	if (!channel) return message.channel.send('I\'m sorry but you need to be in a voice channel to play music!');

	const serverQueue = client.queue.get(message.guild.id);
	if (!serverQueue) return message.channel.send('There is nothing playing that I could stop for you.');

	serverQueue.songs = [];
	return serverQueue.connection.dispatcher.end('Stop command has been used!');
};


exports.help = {
	name: 'stop',
	category: 'Music',
	description: 'Stop the current playing queue',
	usage: 'stop',
};