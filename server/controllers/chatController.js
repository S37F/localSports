const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

/**
 * GET /api/chat/conversations
 * Fetch all conversations for the current user
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'name avatarUrl')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, count: conversations.length, data: conversations });
  } catch (err) {
    console.error('getConversations err:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch conversations', code: 500 });
  }
};

/**
 * POST /api/chat/conversations
 * Creates a conversation or returns an existing one between two users
 */
const getOrCreateConversation = async (req, res) => {
  try {
    const { receiverId, playRequestId } = req.body;
    const senderId = req.user.userId;

    if (!receiverId) return res.status(400).json({ success: false, error: 'Receiver ID required', code: 400 });

    // Try finding existing exact match
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId], $size: 2 }
    }).populate('participants', 'name avatarUrl');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        playRequestId: playRequestId || null
      });
      // Populate right after creation
      conversation = await Conversation.findById(conversation._id).populate('participants', 'name avatarUrl');
    }

    return res.status(200).json({ success: true, data: conversation });
  } catch (err) {
    console.error('createConversation err:', err);
    return res.status(500).json({ success: false, error: 'Failed to find/create conversation', code: 500 });
  }
};

/**
 * GET /api/chat/conversations/:id/messages
 * Fetch messages for a specific conversation
 */
const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Optional: add pagination query vars
    const { limit = 50, skip = 0 } = req.query;

    const conversation = await Conversation.findById(id);
    if (!conversation) return res.status(404).json({ success: false, error: 'Conversation not found', code: 404 });

    // Verify user is in this conversation
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ success: false, error: 'Cannot view this conversation', code: 403 });
    }

    const messages = await Message.find({ conversationId: id })
      .populate('senderId', 'name avatarUrl')
      .sort({ createdAt: 1 }) // Chronological order
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    // Mark messages as read by this user
    await Message.updateMany(
      { conversationId: id, senderId: { $ne: userId }, 'readBy.user': { $ne: userId } },
      { $push: { readBy: { user: userId } } }
    );

    return res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (err) {
    console.error('getMessages err:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch messages', code: 500 });
  }
};

/**
 * Optional HTTP fallback for sending a message if Socket.io is unreliable
 * POST /api/chat/messages
 */
const sendMessageHTTP = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const senderId = req.user.userId;

    if (!text || !conversationId) return res.status(400).json({ success: false, error: 'Missing text or conversationId', code: 400 });

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(senderId)) {
      return res.status(403).json({ success: false, error: 'Invalid conversation', code: 403 });
    }

    const message = await Message.create({
      conversationId,
      senderId,
      text,
      readBy: [{ user: senderId }]
    });

    conversation.lastMessage = message._id;
    conversation.updatedAt = Date.now();
    await conversation.save();

    // Populate sender for return
    const populatedMessage = await Message.findById(message._id).populate('senderId', 'name avatarUrl');

    return res.status(201).json({ success: true, data: populatedMessage });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to send message', code: 500 });
  }
};

module.exports = {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessageHTTP
};
