const { join } = require('path');
const { restartPokehunt } = require(join(__dirname, '../utils/pokehunt.js'));


module.exports.run = async (client, message) => {
	if(!process.env.POKEHUNT_OWNERS.includes(message.author.id)) return;

	message.channel.send('Connecting to the server!');
	const res = await restartPokehunt();
	return message.channel.send(res);
};


exports.help = {
	name: 'restart-pokehunt',
	category: 'Pokehunt',
	description: 'Restart PokeHunt',
	usage: 'restart-pokehunt',
};