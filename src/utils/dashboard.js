const {
	CLIENT_ID,
	CLIENT_SECRET,
	OWNERS,

	PORT,
	BASE_URL,
} = process.env;

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-discord');
const { join } = require('path');

const { modmail } = require(join(__dirname, '../utils/databases.js'));
const { getProfilePic } = require(join(__dirname, '../utils/message.js'));
const { client } = require(join(__dirname, '../index.js'));

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const CheckAuth = (req, res, next) => {
	if(req.isAuthenticated()) return next();
	else return res.redirect('/login');
};

const getUnread = () => {
	const mails = modmail.prepare('SELECT COUNT(*) FROM mails WHERE unread = true AND active = true').get();
	return mails['COUNT(*)'];
};

passport.serializeUser((user, done) => {
	done(null, user);
});
passport.deserializeUser((obj, done) => {
	done(null, obj);
});

passport.use(
	new Strategy({
		clientID: CLIENT_ID,
		clientSecret: CLIENT_SECRET,
		callbackURL: `${BASE_URL}/callback`,
		scope: ['identify'],
		prompt: 'none',
	},
	function(accessToken, refreshToken, profile, done) {
		process.nextTick(function() {
			return done(null, profile);
		});
	},
	),
);

app.use(express.static(join(__dirname, '../public')));
app.use(session({ secret: 'panel', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.set('views', join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.get('/login', passport.authenticate('discord', { scope: ['identify'], prompt: 'none' }));
app.get('/callback', passport.authenticate('discord', { failureRedirect: '/login', successRedirect: '/panel' }));
app.get('/logout', CheckAuth, async function(req, res) {
	await req.logout();
	return res.redirect('/');
});
app.get('/panel', CheckAuth, (req, res) => {
	if(!OWNERS.includes(req.user.id)) return res.redirect('/logout');

	const unread = getUnread();

	return res.render('panel.ejs', {
		unread,
		username: req.user.username,
	});
});
app.get('/mail', CheckAuth, async (req, res) => {
	if(!OWNERS.includes(req.user.id)) return res.redirect('/logout');

	const unread = getUnread();

	const mails = modmail.prepare('SELECT * FROM mails WHERE active = true ORDER BY lastUpdate DESC').all();
	if (mails.length == 0) {
		return res.render('mail/mail.ejs', {
			unread,
			mails: [],
		});
	}

	const results = [];

	for(let i = 0; i < mails.length; i++) {
		const mail = mails[i];

		try {
			const user = await client.users.fetch(mail.memberID);
			const avatar = user.avatar.startsWith('http') ? user.avatar : await getProfilePic(user);
			mail.tag = user.tag;
			mail.avatar = avatar;
		} catch (e) {
			return;
		}
		results.push(mail);

		if (i == mails.length - 1) {
			return res.render('mail/mail.ejs', {
				unread,
				mails: results,
			});
		}
	}
});
app.get('/mail/:ID', CheckAuth, async (req, res) => {
	if(!OWNERS.includes(req.user.id)) return res.redirect('/logout');

	const mail = modmail.prepare('SELECT * FROM mails WHERE ID = ?').get([req.params.ID]);
	const messages = modmail.prepare('SELECT * FROM messages WHERE mailID = ? ORDER BY sentAt DESC').all([req.params.ID]);

	modmail.prepare('UPDATE mails SET unread = false WHERE ID = ?').run([req.params.ID]);

	const unread = getUnread();

	let user = null;
	try {
		user = await client.users.fetch(mail.memberID);
		if (!user.avatar.startsWith('http')) user.avatar = await getProfilePic(user);
	} catch (e) {
		return;
	}

	return res.render('mail/messages.ejs', {
		messages,
		user,
		avatar: client.user.avatar && client.user.avatar.startsWith('http') ? client.user.avatar : await getProfilePic(client.user),
		unread,
	});
});

app.get('/', (req, res) => {
	return res.sendFile(join(__dirname, '../views/personal/index.html'));
});
app.get('/about', (req, res) => {
	return res.sendFile(join(__dirname, '../views/personal/about.html'));
});
app.get('/projects', (req, res) => {
	return res.sendFile(join(__dirname, '../views/personal/projects.html'));
});

http.listen(PORT, () => {
	return console.log(`listening on ${BASE_URL}`);
});

module.exports = { io, getUnread };