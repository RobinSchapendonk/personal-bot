const { join } = require('path');
const { modmail } = require(join(__dirname, '../utils/databases.js'));
const { io, getUnread } = require(join(__dirname, '../utils/dashboard.js'));

module.exports = async (client) => {
	console.log(`${client.user.tag} has started!`);

	io.on('connection', function(socket) {
		// console.log(`${socket.id} connected!`);

		socket.on('sendDM', async ({ to, content, sentAt }) => {
			try {
				const found = modmail.prepare('SELECT * FROM mails WHERE memberID = ? AND active = true').get([to]);
				if (!found) return;

				const user = await client.users.fetch(to);
				user.send(content).then(message => {
					socket.emit('confirmedSendDM', ({ to, content, sentAt, id: parseInt(message.id).toString(36) }));

					modmail.prepare('INSERT INTO messages (mailID, ID, memberID, message, attachments, sentAt) VALUES (?,?,?,?,?,?)').run([found.ID, parseInt(message.id).toString(36), message.author.id, message.content, JSON.stringify([]), message.createdTimestamp]);
				});
			} catch (e) {
				return;
			}
		});


		socket.on('closeDM', async ({ id }) => {
			const found = modmail.prepare('SELECT * FROM mails WHERE ID = ? AND active = true').get([id]);
			if (!found) return;

			try {
				const user = await client.users.fetch(found.memberID);
				user.send('[BOT] Your ticket has been archived!');

				modmail.prepare('UPDATE mails SET active = false WHERE ID = ?').run([id]);
				io.emit('unread', ({ unread: getUnread() }));
				return socket.emit('closeDM', ({ id }));
			} catch (e) {
				return;
			}
		});
	});
};