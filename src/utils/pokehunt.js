const fetch = require('node-fetch');

const getUptime = async () => {
	return fetch(`http://${process.env.POKEHUNT_IP}:${process.env.POKEHUNT_PORT}/uptime`).then(res => {
		if (res.status !== 200) return {};
		else return res.json();
	}).catch(() => {
		return {};
	});
};

module.exports = {
	getUptime,
};