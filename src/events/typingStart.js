const { join } = require('path');
const { io } = require(join(__dirname, '../utils/dashboard.js'));

module.exports = async (client, channel, user) => {
	if (channel.type !== 'dm') return;
	io.emit('typingStart', ({ id: user.id }));

	const interval = setInterval(() => {
		if (!user.typingIn(channel)) {
			io.emit('typingStop', ({ id: user.id }));
			return clearInterval(interval);
		}
	}, 500);
};