const bigInt = require('big-integer');
const chalk = require('chalk');

/**
 * Generate a UUID using a channelID and messageID
 * @param {string} channelID - The channel ID
 * @param {string} messageID - the message ID
 * @returns big-integer
 */
const getUUID = (channelID, messageID) => {
	return bigInt(channelID + '' + messageID).toString(36);
};

/**
 * Log a message
 * @param {string} type - What type of log
 * @param {string} message - The message to log
 * @param {string} color - What color to log in
 */
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