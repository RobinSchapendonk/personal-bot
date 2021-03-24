const {
	POKEHUNT_IP,
	POKEHUNT_SSH_PORT,
	POKEHUNT_SSH_KEY,
	POKEHUNT_SSH_USERNAME,
	POKEHUNT_SSH_PASSPHRASE,
	POKEHUNT_SSH_RESTART_COMMAND,
} = process.env;

const fetch = require('node-fetch');
const { Client: sshclient } = require('ssh2');

const connection = new sshclient();
connection.connect({
	host: POKEHUNT_IP,
	port: POKEHUNT_SSH_PORT,
	username: POKEHUNT_SSH_USERNAME,
	privateKey: require('fs').readFileSync(POKEHUNT_SSH_KEY),
	passphrase: POKEHUNT_SSH_PASSPHRASE,
});

let restarting = true;
connection.on('ready', () => {
	restarting = false;
});

const getUptime = async () => {
	return fetch(`http://${process.env.POKEHUNT_IP}:${process.env.POKEHUNT_PORT}/uptime`).then(res => {
		if (res.status !== 200) return {};
		else return res.json();
	}).catch(() => {
		return {};
	});
};

const restartPokehunt = async () => {
	return new Promise((resolve) => {
		if (restarting) return resolve('PokéHunt is already restarting!');
		restarting = true;

		connection.exec(POKEHUNT_SSH_RESTART_COMMAND, (err, stream) => {
			stream.on('close', () => {

				restarting = false;
				return resolve('PokéHunt has been restarted!');
			}).resume();
		});
	});
};

module.exports = {
	getUptime,
	restartPokehunt,
};