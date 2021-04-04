const { readdirSync } = require('fs');
const { join } = require('path');
const ytdl = require('ytdl-core');


module.exports = async (client, oldState, newState) => {
	if (!process.env.OWNERS.includes(oldState.member.id)) return;
	if (!newState.channelID) return;

	const channel = await client.channels.fetch(newState.channelID);
	if (!channel || !channel.joinable) return;

	let serverQueue = client.queue.get(newState.member.guild.id);
	if (oldState.channelID !== newState.channelID) {
		await channel.join();
		if (serverQueue && serverQueue.connection) serverQueue.connection.removeAllListeners();
	}

	if (serverQueue) return;

	const files = readdirSync(join(__dirname, '../../music/'));
	const mp3Files = files.filter(f => f.split('.').pop() === 'mp3');
	if (mp3Files.length == 0) return;
	shuffleArray(mp3Files);

	mp3Files.forEach(async f => {
		serverQueue = client.queue.get(newState.member.guild.id);
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
				loop: true,
			};
			client.queue.set(newState.member.guild.id, queueConstruct);
			queueConstruct.songs.push(songObj);

			const play = async song => {
				const queue = client.queue.get(newState.member.guild.id);
				if (!song) {
					queue.voiceChannel.leave();
					return client.queue.delete(newState.member.guild.id);
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
				return client.queue.delete(newState.member.guild.id);
			}
		} else {
			serverQueue.songs.push(songObj);
		}
	});
};

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}