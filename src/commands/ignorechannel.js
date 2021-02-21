const { join } = require('path');
const { settings } = require(join(__dirname, '../utils/databases.js'));
const { GetChannelFromArg } = require(join(__dirname, '../utils/message.js'));

module.exports.run = async (client, message, args) => {
	if(!message.member.hasPermission('MANAGE_MESSAGES')) return;
	GetChannelFromArg(args[0] || message.channel.id, message.guild.channels).then(async channel => {
		const oldDisabled = settings.prepare('SELECT * FROM ignoreChannels WHERE guild = ? AND channel = ?').get([message.guild.id, channel.id]);

		if (oldDisabled) {
			settings.prepare('DELETE FROM ignoreChannels WHERE guild = ? AND channel = ?').run([message.guild.id, channel.id]);
		} else {
			settings.prepare('INSERT INTO ignoreChannels (guild, channel) VALUES (?,?)').run([message.guild.id, channel.id]);
		}

		return message.channel.send(`${channel} is ${oldDisabled ? 'enabled' : 'disabled'}!`);
	}).catch(invalidChannelError => {
		console.log(invalidChannelError);
		return message.channel.send(invalidChannelError);
	});
};


exports.help = {
	name: 'ignorechannel',
	category: 'Protection',
	description: 'Ignore a channel',
	usage: 'ignorechannel <Channel>',
};