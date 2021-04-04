const { readdirSync } = require('fs');
const { join } = require('path');
const ytdl = require('ytdl-core');

module.exports.run = async (client, message) => {
	if (!process.env.OWNERS.includes(message.member.id)) return message.channel.send('This is only available for my owner!');

	if (!message.member.voice) return message.channel.send('You need to be in a voice channel!');

	const channel = await client.channels.fetch(message.member.voice.channelID);
	if (!channel || !channel.joinable) return;

	let serverQueue = client.queue.get(message.member.guild.id);
	if (serverQueue && serverQueue.voiceChannel.id !== channel.id) {
		await channel.join();
		if (serverQueue && serverQueue.connection) serverQueue.connection.removeAllListeners();
	}

	const files = readdirSync(join(__dirname, '../../music/'));
	const mp3Files = files.filter(f => f.split('.').pop() === 'mp3');
	if (mp3Files.length == 0) return;
	shuffleArray(mp3Files);

	mp3Files.forEach(async f => {
		serverQueue = client.queue.get(message.member.guild.id);
		const path = join(__dirname, `../../music/${f}`);
		const file = path.split('/')[path.split('/').length - 1];
		const name = (file.split('.').splice(0, file.split('.').length - 1)).join('.');
		const songObj = {
			path,
			title: name,
		};

		if (!serverQueue) {
			const queueConstruct = {
				voiceChannel: channel,
				connection: null,
				songs: [],
				volume: 2,
				playing: true,
				loop: false,
			};
			client.queue.set(message.member.guild.id, queueConstruct);
			queueConstruct.songs.push(songObj);

			const play = async song => {
				const queue = client.queue.get(message.member.guild.id);
				if (!song) {
					queue.voiceChannel.leave();
					return client.queue.delete(message.member.guild.id);
				}

				if (song.url) {
					const dispatcher = queue.connection.play(ytdl(song.url))
						.on('finish', () => {
							queue.songs.shift();
							if (queue.loop) queue.songs.push(song);
							play(queue.songs[0]);
						})
						.on('error', error => console.error(error));
					dispatcher.setVolumeLogarithmic(queue.volume / 5);
				} else {
					const dispatcher = queue.connection.play(song.path)
						.on('finish', () => {
							queue.songs.shift();
							if (queue.loop) queue.songs.push(song);
							play(queue.songs[0]);
						})
						.on('error', error => console.error(error));
					dispatcher.setVolumeLogarithmic(queue.volume / 5);
				}
			};

			try {
				const connection = await channel.join();
				queueConstruct.connection = connection;
				play(queueConstruct.songs[0]);
			} catch (error) {
				await channel.leave();
				return client.queue.delete(message.member.guild.id);
			}
		} else {
			serverQueue.songs.push(songObj);
		}
	});
};


exports.help = {
	name: 'play',
	category: 'Music',
	description: 'Start the 24/7 music player',
	usage: 'play',
};

function shuffleArray(array) {
	for (let i = array.length - 1; i > 1; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}