const { join } = require('path');
const { messages } = require(join(__dirname, '../utils/databases.js'));
const { createEmbed } = require(join(__dirname, '../utils/message.js'));

module.exports.run = async (client, message, args) => {
	const type = args[1] ? args[1] : 'guild';
	if (!['guild', 'channel'].includes(type)) return message.channel.send('Invalid type specified!');

	let leaderboard = messages.prepare(`SELECT count(*) AS count,author FROM messages WHERE ${type} = ? GROUP BY author ORDER BY count DESC`).all([type == 'guild' ? message.guild.id : message.channel.id]);

	const page = parseInt(args[1]) || 1;
	leaderboard = leaderboard.slice((page - 1) * 10, page * 10);

	if (leaderboard.length == 0) return message.channel.send('This page is empty!');

	const embed = createEmbed(`Leaderboard for ${type == 'guild' ? message.guild.name : message.channel.name}`, '', [], [], 'red');
	for(let i = 0; i < leaderboard.length; i++) {
		const data = leaderboard[i];
		message.guild.members.fetch(data.author).then(member => {
			embed.addField(`**${((page - 1) * 10) + i + 1}.** ${member.displayName}`, data.count);
			if (i == leaderboard.length - 1) return message.channel.send(embed);
		}).catch(() => {
			embed.addField(data.author, data.count);
			if (i == leaderboard.length - 1) return message.channel.send(embed);
		});
	}
};


exports.help = {
	name: 'leaderboard',
	category: 'Leveling',
	description: 'Check the leaderboard',
	usage: 'leaderboard [page] [guild|channel=guild]',
};