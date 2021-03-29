const {
	POKEHUNT_IP,
	POKEHUNT_UPTIME_URL,
	POKEHUNT_SSH_PORT,
	POKEHUNT_SSH_KEY,
	POKEHUNT_SSH_USERNAME,
	POKEHUNT_SSH_PASSPHRASE,
	POKEHUNT_SSH_RESTART_COMMAND,
	POKEHUNT_SSH_BACKUP_COMMAND,

	WEBHOOK_ID,
	WEBHOOK_TOKEN,
} = process.env;

const { exec } = require('child_process');
const { MessageEmbed, WebhookClient } = require('discord.js');
const fetch = require('node-fetch');
const { Client: sshclient } = require('ssh2');
// const scpclient = require('scp2');

const hook = new WebhookClient(WEBHOOK_ID, WEBHOOK_TOKEN);

let restarting = false;

const getUptime = async () => {
	return fetch(POKEHUNT_UPTIME_URL).then(res => {
		if (res.status !== 200) return {};
		else return res.json();
	}).catch(() => {
		return {};
	});
};

const checkOnlineStatus = async () => {
	const res = await getUptime();
	if (!res[0]) return false;
	else return true;
};

const restartPokehunt = async () => {
	// eslint-disable-next-line no-async-promise-executor
	return new Promise(async (resolve) => {
		if (restarting) return resolve('PokéHunt is already restarting!');
		restarting = true;

		const embed = new MessageEmbed();
		embed.setTimestamp();
		embed.setDescription('Restarting PokéHunt!');
		hook.send(embed);

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
					resolve('PokéHunt has been restarted!');

					const handle = setInterval(async () => {
						if(await checkOnlineStatus()) {
							restarting = false;
							clearInterval(handle);
							return connection.end();
						}
					}, 1000);
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
	return exec(`scp -r -i ${POKEHUNT_SSH_KEY} -P ${POKEHUNT_SSH_PORT} ${POKEHUNT_SSH_USERNAME}@${POKEHUNT_IP}:~/backup.zip ~/pokehunt-backup/`);
};

module.exports = {
	getUptime,
	restartPokehunt,
	backupPokehunt,
	checkOnlineStatus,
};