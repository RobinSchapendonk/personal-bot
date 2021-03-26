const { MessageEmbed } = require('discord.js');
const { join } = require('path');
const ms = require('ms');
const { getUptime, restartPokehunt, checkOnlineStatus } = require(join(__dirname, '../utils/pokehunt.js'));

let amountOfShards = process.env.POKEHUNT_SHARDS;

module.exports = async (client) => {
	console.log(`${client.user.tag} has started!`);

	const channelID = process.env.POKEHUNT_CHANNEL_ID;
	const messageID = process.env.POKEHUNT_MESSAGE_ID;

	const channel = await client.channels.fetch(channelID);
	const message = await channel.messages.fetch(messageID);

	const embed = new MessageEmbed();
	embed.setFooter('Updated at');

	setInterval(async () => {
		embed.setTimestamp();

		const res = await getUptime();
		if (!res['0']) return restartPokehunt();

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

	setInterval(async () => {
		if(!await checkOnlineStatus()) {
			const now = Date.now();

			try {
				const user1 = await client.users.cache.get('193782837604909056');
				if (user1) user1.send(`${now} I would have tried to restart the bot now`);
			} catch (e) {
				return;
			}
			try {
				const user2 = await client.users.cache.get('425165710847770634');
				if (user2) user2.send(`${now} I would have tried to restart the bot now`);
			} catch (e) {
				return;
			}

			//return restartPokehunt();
		} 
			
	}, 1000);
};