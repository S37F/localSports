const { validationResult } = require('express-validator');
const PlayRequest = require('../models/PlayRequest');
const Conversation = require('../models/Conversation');
const { logEvent } = require('../utils/analytics');

/**
 * POST /api/requests
 * Send a new play request
 */
const createRequest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array(), code: 400 });
  }

  const { receiverId, gameId, proposedTime, location, locationNote, message } = req.body;
  const senderId = req.user.userId;

  try {
    if (senderId === receiverId) {
      return res.status(400).json({ success: false, error: 'Cannot send a request to yourself', code: 400 });
    }

    // Check for an existing pending request between these two users
    const existingReq = await PlayRequest.findOne({
      senderId,
      receiverId,
      status: 'pending'
    });

    if (existingReq) {
      return res.status(409).json({ success: false, error: 'You already have a pending request with this user', code: 409 });
    }

    const playRequest = await PlayRequest.create({
      senderId,
      receiverId,
      gameId,
      proposedTime,
      location,
      locationNote,
      message,
    });

    await logEvent('request.sent', senderId, { receiverId, gameId });

    return res.status(201).json({
      success: true,
      message: 'Play request sent successfully',
      data: playRequest,
    });
  } catch (err) {
    console.error('CreateRequest err:', err);
    return res.status(500).json({ success: false, error: 'Failed to send request', code: 500 });
  }
};

/**
 * GET /api/requests/me
 * Get all requests involving the current user (sent or received)
 */
const getMyRequests = async (req, res) => {
  try {
    const { status, type } = req.query; // type: 'sent' | 'received'
    const userId = req.user.userId;

    const query = {};
    if (status) query.status = status;
    
    if (type === 'sent') {
      query.senderId = userId;
    } else if (type === 'received') {
      query.receiverId = userId;
    } else {
      query.$or = [{ senderId: userId }, { receiverId: userId }];
    }

    const requests = await PlayRequest.find(query)
      .populate('senderId', 'name avatarUrl isActive')
      .populate('receiverId', 'name avatarUrl isActive')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (err) {
    console.error('GetMyRequests err:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch requests', code: 500 });
  }
};

/**
 * PUT /api/requests/:id/accept
 * Receiver accepts a pending request
 */
const acceptRequest = async (req, res) => {
  try {
    const playRequest = await PlayRequest.findById(req.params.id);
    
    if (!playRequest) return res.status(404).json({ success: false, error: 'Request not found', code: 404 });
    if (playRequest.receiverId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized to accept this request', code: 403 });
    }
    if (playRequest.status !== 'pending') {
      return res.status(400).json({ success: false, error: `Request is already ${playRequest.status}`, code: 400 });
    }

    playRequest.status = 'accepted';
    await playRequest.save();

    // Auto-create a chat conversation between sender and receiver
    await Conversation.findOneAndUpdate(
      { participants: { $all: [playRequest.senderId, playRequest.receiverId], $size: 2 } },
      { 
        $setOnInsert: { participants: [playRequest.senderId, playRequest.receiverId] },
        playRequestId: playRequest._id 
      },
      { upsert: true, new: true }
    );

    await logEvent('request.accepted', req.user.userId, { requestId: playRequest._id, gameId: playRequest.gameId });

    return res.status(200).json({ success: true, message: 'Request accepted', data: playRequest });
  } catch (err) {
    console.error('AcceptRequest err:', err);
    return res.status(500).json({ success: false, error: 'Failed to accept request', code: 500 });
  }
};

/**
 * PUT /api/requests/:id/decline
 * Receiver declines a pending request
 */
const declineRequest = async (req, res) => {
  try {
    const playRequest = await PlayRequest.findById(req.params.id);
    
    if (!playRequest) return res.status(404).json({ success: false, error: 'Request not found', code: 404 });
    if (playRequest.receiverId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized', code: 403 });
    }
    if (playRequest.status !== 'pending') {
      return res.status(400).json({ success: false, error: `Request is already ${playRequest.status}`, code: 400 });
    }

    playRequest.status = 'declined';
    await playRequest.save();

    await logEvent('request.declined', req.user.userId, { requestId: playRequest._id });

    return res.status(200).json({ success: true, message: 'Request declined', data: playRequest });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to decline request', code: 500 });
  }
};

/**
 * PUT /api/requests/:id/cancel
 * Sender cancels their own pending request
 */
const cancelRequest = async (req, res) => {
  try {
    const playRequest = await PlayRequest.findById(req.params.id);
    
    if (!playRequest) return res.status(404).json({ success: false, error: 'Request not found', code: 404 });
    if (playRequest.senderId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized', code: 403 });
    }
    if (playRequest.status !== 'pending') {
      return res.status(400).json({ success: false, error: `Can only cancel pending requests`, code: 400 });
    }

    playRequest.status = 'cancelled';
    await playRequest.save();

    return res.status(200).json({ success: true, message: 'Request cancelled', data: playRequest });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to cancel request', code: 500 });
  }
};

/**
 * GET /api/requests/history
 * Get completed (accepted in the past) matches
 */
const getHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();

    const matches = await PlayRequest.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
      status: 'accepted',
      proposedTime: { $lt: now } // Only show naturally past matches
    })
    .populate('senderId', 'name avatarUrl')
    .populate('receiverId', 'name avatarUrl')
    .sort({ proposedTime: -1 });

    return res.status(200).json({ success: true, count: matches.length, data: matches });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch history', code: 500 });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  acceptRequest,
  declineRequest,
  cancelRequest,
  getHistory
};
