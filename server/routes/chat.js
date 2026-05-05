const express = require('express');
const { getConversations, getOrCreateConversation, getMessages, sendMessageHTTP } = require('../controllers/chatController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

router.get('/conversations', getConversations);
router.post('/conversations', getOrCreateConversation);

router.get('/conversations/:id/messages', getMessages);

// Fallback HTTP route for messages
router.post('/messages', sendMessageHTTP);

module.exports = router;
