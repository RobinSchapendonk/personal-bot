const {
	ENVIRONMENT,
} = process.env;

const { MessageEmbed } = require('discord.js');
const { join } = require('path');
const ms = require('ms');
const { modmail } = require(join(__dirname, '../utils/databases.js'));
const { io } = require(join(__dirname, '../utils/dashboard.js'));
const { getUptime, restartPokehunt, checkOnlineStatus } = require(join(__dirname, '../utils/pokehunt.js'));

let amountOfShards = process.env.POKEHUNT_SHARDS;

module.exports = async (client) => {
	console.log(`${client.user.tag} has started!`);

	io.on('connection', function(socket) {
		console.log(`${socket.id} connected!`);

		socket.on('sendDM', async ({ to, content }) => {
			try {
				const found = modmail.prepare('SELECT * FROM mails WHERE memberID = ? AND active = true').get([to]);
				if (!found) return;

				const user = await client.users.fetch(to);
				user.send(content).then(message => {
					modmail.prepare('INSERT INTO messages (mailID, ID, memberID, message, attachments, sentAt) VALUES (?,?,?,?,?,?)').run([found.ID, message.id, message.author.id, message.content, JSON.stringify([]), message.createdTimestamp]);
					modmail.prepare('UPDATE mails SET lastUpdate = ? WHERE ID = ?').run([message.createdTimestamp, found.ID]);
				});
			} catch (e) {
				return;
			}
		});
	});

	const channelID = process.env.POKEHUNT_CHANNEL_ID;
	const messageID = process.env.POKEHUNT_MESSAGE_ID;

	const channel = await client.channels.fetch(channelID);
	const message = await channel.messages.fetch(messageID);

	const embed = new MessageEmbed();
	embed.setFooter('Updated at');

	setInterval(async () => {
		embed.setTimestamp();

		const res = await getUptime();
		if (!res['0'] && ENVIRONMENT == 'PRODUCTION') return restartPokehunt();

		const uptimes = Object.values(res);
		if (uptimes.length > amountOfShards) amountOfShards = uptimes.length;

		let string = '';
		for (let i = 0; i < amountOfShards; i++) {
			string += `Shard ${i + 1}: ${ms(res[i] ? res[i] : 0, { long: true })}\n`;
			if (i == amountOfShards - 1) {
				embed.setDescription(string);
				message.edit('', embed);
			}
		}
	}, 1000 * 60);

	if (ENVIRONMENT == 'PRODUCTION') {
		setInterval(async () => {
			if(!await checkOnlineStatus()) {
				return restartPokehunt();
			}
		}, 1000);
	}
};