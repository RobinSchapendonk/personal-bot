const { join } = require('path');
const { io } = require(join(__dirname, '../utils/dashboard.js'));
const { modmail } = require(join(__dirname, '../utils/databases.js'));

module.exports = async (client, message) => {
	if (message.channel.type !== 'dm') return;

	const exists = modmail.prepare('SELECT * FROM messages WHERE ID = ?').get([parseInt(message.id).toString(36)]);
	if (exists) {
		modmail.prepare('DELETE FROM messages WHERE ID = ?').run([parseInt(message.id).toString(36)]);
		return io.emit('deleteDM', { from: message.author.id, id: parseInt(message.id).toString(36) });
	}
};