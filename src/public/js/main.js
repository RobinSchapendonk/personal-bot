/* eslint-disable */
const socket = io();
const unreadNav = document.getElementById('unread');

socket.on('unread', ({ from, unread }) => {
	unreadNav.innerHTML = `Mail (${unread})`;
	const badge = document.getElementById(`mail-${from}`);
	if (badge) badge.style = '';
});