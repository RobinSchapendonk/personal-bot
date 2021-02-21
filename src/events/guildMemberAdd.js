const { join } = require('path');
const { settings } = require(join(__dirname, '../utils/databases.js'));
const { log } = require(join(__dirname, '../utils/functions.js'));

module.exports = async (client, member) => {
	const data = settings.prepare('SELECT cooldown FROM joinProtection WHERE guild = ?').get(member.guild.id);
	if (!data || !data.cooldown) return;

	let cooldown = data.cooldown;
	if (cooldown == 'default') cooldown = Math.round(2500 / member.guild.memberCount);
	else cooldown = parseInt(cooldown);

	const lastJoin = client.joins.get(member.guild.id) || 0;
	const duration = (member.joinedAt.getTime() - new Date(lastJoin).getTime()) / 1000;

	if (duration < cooldown) {
		if (member.kickable) {
			try {
				await member.send(`A cooldown is active in this server, please join again over ${cooldown} seconds!`);
			} catch (e) { return; }
			member.kick('Member joined too soon!');
			log('join', `kick ${member.user.tag}`, 'green');
		} else {
			log('join', `kick ${member.user.tag}`, 'red');
		}
	}

	client.joins.set(member.guild.id, member.joinedAt);

	console.log(`${member.displayName}, just joined ${member.guild.name}`);
};