const { bot, mode, formatTime } = require('../lib/');

 bot({
	pattern: 'ping ?(.*)',
	fromMe: mode,
	desc: 'Bot response in second.',
	type: 'info'
}, async (message, match, client) => {
	var start = new Date().getTime();
	var msg = await message.reply('*Pinging...*');
	var end = new Date().getTime();
	var responseTime = end - start;
	await msg.edit(`*Pong!*\nLatency: ${responseTime}ms`);
});

bot({
	pattern: 'jid',
	fromMe: mode,
	desc: 'To get remoteJid',
	type: 'whatsapp'
}, async (message) => {
	await message.send(message.mention[0] ? message.mention[0] : message.quoted ? message.quoted.sender : message.chat)
});

bot({
	pattern: 'runtime',
	fromMe: mode,
	desc: 'Get bots runtime',
	type: 'info'
}, async (message, match, client) => {
	await message.reply(formatTime(process.uptime()));
})