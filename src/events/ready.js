const { MessageEmbed } = require('discord.js');
const { join } = require('path');
const ms = require('ms');
const { getUptime } = require(join(__dirname, '../utils/pokehunt.js'));

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
		const length = Object.values(res);
		if (length > amountOfShards) amountOfShards = length;

		let string = '';
		for (let i = 0; i < amountOfShards; i++) {
			string += `Shard ${i + 1}: ${ms(res[i] ? res[i] : 0)}\n`;
			if (i == amountOfShards - 1) {
				embed.setDescription(string);
				message.edit('', embed);
			}
		}
	}, 1000);
};