const { readdir } = require('fs');

/**
 * Load the commands
 * @param {Client} client - The client
 */
const loadCommands = (client) => {
	readdir('./src/commands/', (err, files) => {
		if (err) console.error(err);
		const jsFiles = files.filter(f => f.split('.').pop() === 'js');

		console.log(`Loading ${jsFiles.length} commands!`);

		jsFiles.forEach((f) => {
			const props = require(`../commands/${f}`);
			client.commands.set(props.help.name, props);
		});
	});
};

/**
 * Load the events
 * @param {Client} client - The client
 */
const loadEvents = (client) => {
	readdir('./src/events', (err, files) => {
		if (err) console.error(err);
		const jsFiles = files.filter(f => f.split('.').pop() === 'js');

		console.log(`Loading ${jsFiles.length} events!`);

		jsFiles.forEach((f) => {
			const eventName = f.split('.').slice(0, -1);
			const event = require(`../events/${f}`);
			client.on(eventName, event.bind(null, client));
		});
	});
};

module.exports = {
	loadCommands,
	loadEvents,
};