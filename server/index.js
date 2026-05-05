require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const { buildApp, getCorsOrigins } = require('./app');
const { MONGO_URI } = require('./db');

const app = buildApp();
const server = http.createServer(app);

const corsOrigins = getCorsOrigins();
const corsOriginOption =
  corsOrigins.length === 0 ? true : corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins;

const io = new Server(server, {
  cors: {
    origin: corsOriginOption,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their personal room`);
  });

  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  socket.on('sendMessage', async (data) => {
    io.to(data.conversationId).emit('newMessage', data);

    if (data.receiverId) {
      io.to(data.receiverId).emit('notification', {
        type: 'NEW_MESSAGE',
        conversationId: data.conversationId,
        senderId: data.senderId,
        text: data.text,
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = { app, server, io };
