const { Server } = require('socket.io');
const statusUpdateService = require('./statusUpdateService');

let ioInstance = null;

function initWebsocket(server) {
	if (ioInstance) {
		return ioInstance;
	}

	ioInstance = new Server(server, {
		cors: {
			origin: '*',
			methods: ['GET', 'POST']
		}
	});

	ioInstance.on('connection', (socket) => {
		// Optional query-based auto-join on connect
		const { userId, containerId, scheduleId } = socket.handshake.query || {};
		if (userId) socket.join(`user:${userId}`);
		if (containerId) socket.join(`container:${containerId}`);
		if (scheduleId) socket.join(`schedule:${scheduleId}`);

		// Allow client to join/leave rooms dynamically
		socket.on('subscribe', (rooms) => {
			if (!rooms) return;
			const list = Array.isArray(rooms) ? rooms : [rooms];
			list.forEach((room) => socket.join(room));
		});

		socket.on('unsubscribe', (rooms) => {
			if (!rooms) return;
			const list = Array.isArray(rooms) ? rooms : [rooms];
			list.forEach((room) => socket.leave(room));
		});

		socket.on('disconnect', () => {
			// nothing special for now
		});
	});

	// Bridge statusUpdate events to WebSocket clients
	statusUpdateService.events.on('statusUpdate', (event) => {
		// Broadcast to all
		ioInstance.emit('statusUpdate', event);

		// Targeted rooms
		if (event.userId) ioInstance.to(`user:${event.userId}`).emit('statusUpdate', event);
		if (event.containerId) ioInstance.to(`container:${event.containerId}`).emit('statusUpdate', event);
		if (event.scheduleId) ioInstance.to(`schedule:${event.scheduleId}`).emit('statusUpdate', event);
	});

	console.log('WebSocket service initialized');
	return ioInstance;
}

function getIo() {
	return ioInstance;
}

module.exports = { initWebsocket, getIo };
