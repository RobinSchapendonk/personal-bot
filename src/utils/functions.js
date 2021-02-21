const bigInt = require('big-integer');
const chalk = require('chalk');

const getUUID = (channelID, messageID) => {
	return bigInt(channelID + '' + messageID).toString(36);
};

const log = (type, message, color) => {
	type = (type + '          ').substr(0, 10);

	let colorFn = chalk[color];
	if (!color) colorFn = chalk['white'];

	console.log(colorFn(`${type} - `, message));
};

module.exports = {
	getUUID,
	log,
};