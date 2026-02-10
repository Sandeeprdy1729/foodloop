const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE']
        }
    });

    io.on('connection', (socket) => {
        console.log('🔌 New client connected:', socket.id);

        // Join room based on user role and id
        socket.on('join', ({ userId, role }) => {
            const room = `${role}_${userId}`;
            socket.join(room);
            console.log(`👤 User ${userId} (${role}) joined room: ${room}`);
        });

        socket.on('disconnect', () => {
            console.log('🔌 Client disconnected:', socket.id);
        });
    });

    return io;
};

const sendNotification = (recipientId, role, event, data) => {
    if (io) {
        const room = `${role}_${recipientId}`;
        io.to(room).emit(event, data);
        console.log(`📡 Notification sent to room ${room}:`, event);
    } else {
        console.warn('⚠️ Socket.io not initialized');
    }
};

module.exports = { initSocket, sendNotification };
