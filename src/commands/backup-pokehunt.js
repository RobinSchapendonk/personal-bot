const { join } = require('path');
const { backupPokehunt } = require(join(__dirname, '../utils/pokehunt.js'));


module.exports.run = async (client, message) => {
	if(!process.env.POKEHUNT_OWNERS.includes(message.author.id)) return;

	message.channel.send('Connecting to the server!');
	const res = await backupPokehunt();
	return message.channel.send(res);
};


exports.help = {
	name: 'backup-pokehunt',
	category: 'Pokehunt',
	description: 'Back PokeHunt up',
	usage: 'backup-pokehunt',
};