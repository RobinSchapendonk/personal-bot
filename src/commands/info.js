const { createEmbed } = require('../utils/message.js');

const embed = createEmbed('Info about me', 'This is the personal bot of </RobinSch>#7994, it includes my site, my modmail, anti-raid, moderation and music. You can self host this bot using [this](https://github.com/RobinSchapendonk/personal-bot) link!', [], [], '0000FF');

module.exports.run = async (client, message) => {
	return message.channel.send(embed);
};

module.exports.help = {
	name: 'info',
	category: 'General',
	description: 'Get info about this bot',
	usage: 'info',
};