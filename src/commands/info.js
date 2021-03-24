const { join } = require('path');
const { createEmbed } = require(join(__dirname, '../utils/message.js'));

const embed = createEmbed('Info about me', 'This is the private bot of </RobinSch>#7994. There is no way you can invite this bot.', [], [], '0000FF');

module.exports.run = async (client, message) => {
	return message.channel.send(embed);
};

module.exports.help = {
	name: 'info',
	category: 'General',
	description: 'Get info about this bot',
	usage: 'info',
};