const { MessageEmbed, MessageAttachment } = require('discord.js');

const createEmbed = (title = null, description = null, fields = [], attachments = [], color = 'RANDOM') => {
	const embed = new MessageEmbed();
	if (title) embed.setTitle(title);
	if (description) embed.setDescription(description);
	if (color) embed.setColor(color);
	fields.map(field => {
		embed.addField(field[0], field[1], field[2]);
	});
	if (attachments.length == 1) {
		const image = new MessageAttachment(attachments[0], 'file.png');
		attachments = attachments.slice(1, 0);
		embed.attachFiles([image]);
		embed.setImage('attachment://file.png');
	}
	embed.attachFiles(attachments);
	return embed;
};

const GetMemberFromArg = (argument, members) => {
	// eslint-disable-next-line no-async-promise-executor
	return new Promise(async (resolve, reject) => {
		const multiplefound = 'I found multiple members, be more precise!';
		if (!argument) return reject('You didn\'t provided an argument!');

		// Mentioned Member //
		if (argument.startsWith('<@') && argument.endsWith('>')) {
			let id = argument.slice(2, -1);
			if (id.startsWith('!')) id = id.slice(1);
			await members.fetch(id).then(member => {
				return resolve(member);
			}).catch(() => { return; });
		}

		// Member ID //
		await members.fetch(argument).then(member => {
			return resolve(member);
		}).catch(() => { return; });

		// Username //
		const usernames = members.cache.filter((member) => member.user.username === argument);
		if (usernames.size === 1) return resolve(usernames.first());
		else if (usernames.size > 1) return reject(multiplefound);

		// Nickname
		const nicknames = members.cache.filter((member) => member.nickname === argument);
		if (nicknames.size === 1) return resolve(nicknames.first());
		else if (nicknames.size > 1) return reject(multiplefound);

		// Username#Tag
		const usertags = members.cache.filter((member) => member.user.tag === argument);
		if (usertags.size === 1) return resolve(usertags.first());
		else if (usertags.size > 1) return reject(multiplefound);

		return reject('I didn\'t found any member!');
	});
};

const GetChannelFromArg = (argument, channels) => {
	// eslint-disable-next-line no-async-promise-executor
	return new Promise(async (resolve, reject) => {
		const multiplefound = 'I found multiple channels, be more precise!';
		if (!argument) return reject('You didn\'t provided an argument!');

		// Mentioned Channel //
		if (argument.startsWith('<#') && argument.endsWith('>')) {
			let id = argument.slice(2, -1);
			if (id.startsWith('!')) id = id.slice(1);
			const channel = channels.cache.get(id);
			if (channel) return resolve(channel);
		}

		// Channel ID //
		const channel = channels.cache.get(argument);
		if (channel) return resolve(channel);

		// Name //
		const names = channels.cache.filter((chanel) => chanel.name === argument);
		if (names.size === 1) return resolve(names.first());
		else if (names.size > 1) return reject(multiplefound);

		return reject('I didn\'t found any member!');
	});
};

const getProfilePic = (user) => {
	if (user.avatar == null) {
		return `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;
	} else {
		return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
	}
};

const clean = text => {
	if (typeof (text) === 'string') {
		return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
	} else {return text;}
};

module.exports = {
	createEmbed,
	GetMemberFromArg,
	GetChannelFromArg,
	getProfilePic,
	clean,
};