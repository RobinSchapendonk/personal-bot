const {
	PREFIX,
	SSH_IP,
	SSH_USERNAME,
	SSH_PASSWORD,
} = process.env;

const { join } = require('path');
const { settings, messages } = require(join(__dirname, '../utils/databases.js'));
const { log } = require(join(__dirname, '../utils/functions.js'));
const { clean } = require(join(__dirname, '../utils/message.js'));
const { Client: sshclient } = require('ssh2');

module.exports = async (client, message) => {
	if (message.author.bot || message.channel.type === 'dm') return;

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
					log('global', `delete msg from ${message.author.tag}!`, 'green');
				} catch (e) {
					log('global', `delete msg from ${message.author.tag}!`, 'red');
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
					log('user', `delete msg from ${message.author.tag}!`, 'green');
				} catch (e) {
					log('user', `delete msg from ${message.author.tag}!`, 'red');
				}
			}
			client.userMessages.set(message.author.id, message.createdAt);
		}

		messages.prepare('INSERT INTO messages (id, guild, channel, author, content, createdAt) VALUES (?,?,?,?,?,?)').run([message.id, message.guild.id, message.channel.id, message.author.id, message.content, message.createdAt.getTime()]);
	}

	if (!message.content.startsWith(PREFIX)) return;
	const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	if (command == 'eval' && process.env.OWNERS.includes(message.author.id)) {
		try {
			const code = args.join(' ');
			let evaled = eval(code);

			if (typeof evaled !== 'string') { evaled = require('util').inspect(evaled); }

			message.channel.send(clean(evaled), { code: 'xl' });
		} catch (err) {
			message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
		}
	}

	if (command == 'restart-pokehunt' && process.env.POKEHUNT.includes(message.author.id)) {
		const connection = new sshclient();
		connection.connect({
			host: SSH_IP,
			port: 22,
			username: SSH_USERNAME,
			password: SSH_PASSWORD,
		});
		connection.on('ready', () => {
			connection.exec('cd personal-bot && docker-compose restart', (err, stream) => {
				stream.on('close', () => {
					message.channel.send('Restarting!');
					return connection.end();
				}).resume();
			});
		});
	}

	const cmd = client.commands.get(command);
	if (cmd) cmd.run(client, message, args);
};