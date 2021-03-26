const {
	POKEHUNT_IP,
	POKEHUNT_SSH_PORT,
	POKEHUNT_SSH_KEY,
	POKEHUNT_SSH_USERNAME,
	POKEHUNT_SSH_PASSPHRASE,
	POKEHUNT_SSH_RESTART_COMMAND,
	POKEHUNT_SSH_BACKUP_COMMAND,
} = process.env;

const { exec } = require('child_process');
const fetch = require('node-fetch');
const { Client: sshclient } = require('ssh2');
// const scpclient = require('scp2');

let restarting = false;

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

		const connection = new sshclient();
		connection.connect({
			host: POKEHUNT_IP,
			port: POKEHUNT_SSH_PORT,
			username: POKEHUNT_SSH_USERNAME,
			privateKey: require('fs').readFileSync(POKEHUNT_SSH_KEY),
			passphrase: POKEHUNT_SSH_PASSPHRASE,
		});

		connection.on('ready', () => {
			connection.exec(POKEHUNT_SSH_RESTART_COMMAND, (err, stream) => {
				stream.on('close', () => {
					restarting = false;
					resolve('PokéHunt has been restarted!');
					return connection.end();
				}).resume();
			});
		});
	});
};

const backupPokehunt = async () => {
	return new Promise((resolve) => {
		const connection = new sshclient();
		connection.connect({
			host: POKEHUNT_IP,
			port: POKEHUNT_SSH_PORT,
			username: POKEHUNT_SSH_USERNAME,
			privateKey: require('fs').readFileSync(POKEHUNT_SSH_KEY),
			passphrase: POKEHUNT_SSH_PASSPHRASE,
		});

		connection.on('ready', () => {
			connection.exec(POKEHUNT_SSH_BACKUP_COMMAND, (err, stream) => {
				stream.on('close', () => {
					resolve('Backup has been made!');
					downloadBackup();
					return connection.end();
				}).resume();
			});
		});
	});
};

const downloadBackup = async () => {
	// scpclient.scp({
	// 	host: POKEHUNT_IP,
	// 	port: POKEHUNT_SSH_PORT,
	// 	username: POKEHUNT_SSH_USERNAME,
	// 	privateKey: require('fs').readFileSync(POKEHUNT_SSH_KEY),
	// 	passphrase: POKEHUNT_SSH_PASSPHRASE,
	// 	path: '~/backups',
	// }, '~/pokehunt-backup', (err) => {
	// 	console.log(err);
	// });
	return exec(`scp -r -i ${POKEHUNT_SSH_KEY} -P ${POKEHUNT_SSH_PORT} ${POKEHUNT_SSH_USERNAME}@${POKEHUNT_IP}:~/backups/* ~/pokehunt-backup/`);
};

module.exports = {
	getUptime,
	restartPokehunt,
	backupPokehunt,
};