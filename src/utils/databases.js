const db = require('better-sqlite3');
const { join } = require('path');

const settings = db(join(__dirname, '/../../databases/settings.sqlite'));
const punishments = db(join(__dirname, '/../../databases/punishments.sqlite'));
const modmail = db(join(__dirname, '/../../databases/modmail.sqlite'));

settings.prepare('CREATE TABLE if not exists joinProtection (guild TEXT, cooldown TEXT)').run();
settings.prepare('CREATE TABLE if not exists messageProtection (guild TEXT, global TEXT, user TEXT)').run();
settings.prepare('CREATE TABLE if not exists ignoreChannels (guild TEXT, channel TEXT)').run();

punishments.prepare('CREATE TABLE if not exists ban (uuid TEXT, guild TEXT, member TEXT, moderator TEXT, reason TEXT, time TEXT)').run();
punishments.prepare('CREATE TABLE if not exists kick (uuid TEXT, guild TEXT, member TEXT, moderator TEXT, reason TEXT, time TEXT)').run();
punishments.prepare('CREATE TABLE if not exists warn (uuid TEXT, guild TEXT, member TEXT, moderator TEXT, reason TEXT, time TEXT)').run();

modmail.prepare('CREATE TABLE if not exists mails (ID INTEGER PRIMARY KEY autoincrement, memberID TEXT, active BOOLEAN, lastUpdate TEXT, unread TEXT)').run();
modmail.prepare('CREATE TABLE if not exists messages (mailID INTEGER, ID TEXT PRIMARY KEY, memberID TEXT, message TEXT, attachments TEXT, sentAt TEXT)').run();

module.exports = {
	settings,
	punishments,
	modmail,
};