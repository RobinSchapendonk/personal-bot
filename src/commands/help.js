const { MessageEmbed, Collection } = require('discord.js');

module.exports.run = async (client, message, args) => {
	if (!args[0]) {
		const fields = new Collection();
		await client.commands.forEach((command) => {
			const commands = fields.get(command.help.category);
			if (!commands) {fields.set(command.help.category, [command]);} else {
				commands.push(command);
				fields.set(command.help.category, commands);
			}
		});

		const embed = new MessageEmbed();
		embed.setTitle('Help');
		fields.map((commands, category) => {
			embed.addField(category, commands.map(command => { return `\`${command.help.name}\` `; }), true);
		});

		return message.channel.send(embed);
	} else {
		const commandInfo = client.commands.find(command => command.help.name.toLowerCase() == args[0].toLowerCase());
		if (!commandInfo) return message.channel.send('Enter a valid command');

		const embed = new MessageEmbed();
		embed.setTitle(`Info about ${commandInfo.help.name}`);
		embed.addField('Description :', commandInfo.help.description);
		embed.addField('Usage :', commandInfo.help.usage);

		return message.channel.send(embed);
	}
};

module.exports.help = {
	name: 'help',
	category: 'General',
	description: 'Get help',
	usage: 'help [Command]',
};