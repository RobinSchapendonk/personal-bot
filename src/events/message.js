const {
	CLIENT_PREFIX,
	OWNERS,
} = process.env;

const { join } = require('path');
const { io, getUnread } = require(join(__dirname, '../utils/dashboard.js'));
const { settings, modmail } = require(join(__dirname, '../utils/databases.js'));
// const { log } = require(join(__dirname, '../utils/functions.js'));
const { getProfilePic, clean } = require(join(__dirname, '../utils/message.js'));

module.exports = async (client, message) => {
	if (message.author.bot) return;

	if (message.channel.type == 'dm') {
		try {
			let found = modmail.prepare('SELECT * FROM mails WHERE memberID = ? AND active = true').get([message.author.id]);

			if (!found) {
				modmail.prepare('INSERT INTO mails (memberID, active) VALUES (?,true)').run([message.author.id]);
				found = modmail.prepare('SELECT * FROM mails WHERE memberID = ? AND active = true').get([message.author.id]);

				const avatar = getProfilePic(message.author);
				io.emit('createDM', ({ id: found.ID, tag: message.author.tag, avatar }));

				await message.author.send('[BOT] Your ticket has been created!');
			}

			const attachments = message.attachments.array();
			const files = [];
			attachments.map(attachment => files.push(attachment.url));

			modmail.prepare('INSERT INTO messages (mailID, ID, memberID, message, attachments, sentAt) VALUES (?,?,?,?,?,?)').run([found.ID, parseInt(message.id).toString(36), message.author.id, message.content, JSON.stringify(files), message.createdTimestamp]);
			modmail.prepare('UPDATE mails SET lastUpdate = ?, unread = true WHERE ID = ?').run([message.createdTimestamp, found.ID]);

			io.emit('receiveDM', ({ from: message.author.id, content: message.content, messageID: parseInt(message.id).toString(36), id: found.ID }));
			io.emit('unreadAmount', ({ amount: getUnread() }));

			return message.react('✅');
		} catch (e) {
			return;
		}
	} else {

		const messageProtection = settings.prepare('SELECT global, user FROM messageProtection WHERE guild = ?').get(message.guild.id);
		const disabled = settings.prepare('SELECT * FROM ignoreChannels WHERE guild = ? AND channel = ?').get([message.guild.id, message.channel.id]);
		if (!disabled) {
			if (messageProtection && messageProtection.global) {
				let cooldown = messageProtection.global;
				if (cooldown == 'default') cooldown = 0.1;
				else cooldown = parseInt(cooldown);

				const lastMessage = client.messages.get(message.channel.id) || 0;
				const duration = (message.createdAt.getTime() - new Date(lastMessage).getTime()) / 1000;

				if (duration < cooldown) {
					try {
						await message.delete();
						// log('global', `delete msg from ${message.author.tag}!`, 'green');
					} catch (e) {
						// log('global', `delete msg from ${message.author.tag}!`, 'red');
					}
				}
				client.messages.set(message.channel.id, message.createdAt);
			}

			if (messageProtection && messageProtection.user) {
				let cooldown = messageProtection.user;
				if (cooldown == 'default') cooldown = 0.5;
				else cooldown = parseInt(cooldown);

				const lastMessage = client.userMessages.get(message.author.id) || 0;
				const duration = (message.createdAt.getTime() - new Date(lastMessage).getTime()) / 1000;

				if (duration < cooldown) {
					try {
						await message.delete();
						// log('user', `delete msg from ${message.author.tag}!`, 'green');
					} catch (e) {
						// log('user', `delete msg from ${message.author.tag}!`, 'red');
					}
				}
				client.userMessages.set(message.author.id, message.createdAt);
			}
		}

		if (!message.content.startsWith(CLIENT_PREFIX)) return;
		const args = message.content.slice(CLIENT_PREFIX.length).trim().split(/ +/g);
		const command = args.shift().toLowerCase();

		if (command == 'eval' && OWNERS.includes(message.author.id)) {
			try {
				const code = args.join(' ');
				let evaled = eval(code);

				if (typeof evaled !== 'string') { evaled = require('util').inspect(evaled); }

				message.channel.send(clean(evaled), { code: 'xl' });
			} catch (err) {
				message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
			}
		}

		const cmd = client.commands.get(command);
		if (cmd) cmd.run(client, message, args);
	}
};