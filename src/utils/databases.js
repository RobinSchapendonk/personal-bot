const db = require('better-sqlite3');
const { join } = require('path');

const settings = db(join(__dirname, '/../../databases/settings.sqlite'));
const punishments = db(join(__dirname, '/../../databases/punishments.sqlite'));

settings.prepare('CREATE TABLE if not exists joinProtection (guild TEXT, cooldown TEXT)').run();
settings.prepare('CREATE TABLE if not exists messageProtection (guild TEXT, global TEXT, user TEXT)').run();
settings.prepare('CREATE TABLE if not exists ignoreChannels (guild TEXT, channel TEXT)').run();

punishments.prepare('CREATE TABLE if not exists ban (uuid TEXT, guild TEXT, member TEXT, moderator TEXT, reason TEXT, time TEXT)').run();
punishments.prepare('CREATE TABLE if not exists kick (uuid TEXT, guild TEXT, member TEXT, moderator TEXT, reason TEXT, time TEXT)').run();
punishments.prepare('CREATE TABLE if not exists warn (uuid TEXT, guild TEXT, member TEXT, moderator TEXT, reason TEXT, time TEXT)').run();

module.exports = {
	settings,
	punishments,
};