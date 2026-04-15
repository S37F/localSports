const { validationResult } = require('express-validator');
const Community = require('../models/Community');
const OpenPlayPost = require('../models/OpenPlayPost');
const { logEvent } = require('../utils/analytics');

/**
 * GET /api/communities
 * List nearby communities using geo filter
 */
const getNearbyCommunities = async (req, res) => {
  try {
    const { lat, lng, radius = 10000, page = 1, limit = 20 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, error: 'Latitude and Longitude required', code: 400 });
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const communities = await Community.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius, 10),
        },
      },
    })
      .populate('createdBy', 'name avatarUrl')
      .skip(skip)
      .limit(parseInt(limit, 10));

    return res.status(200).json({ success: true, count: communities.length, data: communities });
  } catch (err) {
    console.error('getNearbyCommunities err:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch communities', code: 500 });
  }
};

/**
 * POST /api/communities
 * Create a new community
 */
const createCommunity = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array(), code: 400 });

  try {
    const { name, description, area, location } = req.body;
    
    // Check if user is organizer or allow users to create basic ones
    // Rules say 'role: organizer or user'

    const community = await Community.create({
      name,
      description,
      area,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
      },
      createdBy: req.user.userId,
      members: [req.user.userId], // Creator is automatically a member
    });

    await logEvent('community.created', req.user.userId, { communityId: community._id, area });

    return res.status(201).json({ success: true, message: 'Community created', data: community });
  } catch (err) {
    console.error('createCommunity err:', err);
    return res.status(500).json({ success: false, error: 'Failed to create community', code: 500 });
  }
};

/**
 * GET /api/communities/:id
 * Get community details
 */
const getCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('members', 'name avatarUrl isActive');
      
    if (!community) return res.status(404).json({ success: false, error: 'Community not found', code: 404 });

    return res.status(200).json({ success: true, data: community });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch community', code: 500 });
  }
};

/**
 * POST /api/communities/:id/join
 * Join a community
 */
const joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ success: false, error: 'Community not found', code: 404 });

    if (community.members.includes(req.user.userId)) {
      return res.status(400).json({ success: false, error: 'Already a member', code: 400 });
    }

    community.members.push(req.user.userId);
    await community.save();

    await logEvent('community.joined', req.user.userId, { communityId: community._id });

    return res.status(200).json({ success: true, message: 'Joined community successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to join community', code: 500 });
  }
};

/**
 * GET /api/communities/:id/posts
 * List open play posts for a community
 */
const getCommunityPosts = async (req, res) => {
  try {
    const posts = await OpenPlayPost.find({ communityId: req.params.id })
      .populate('createdBy', 'name avatarUrl')
      .populate('participants', 'name avatarUrl')
      .sort({ scheduledTime: 1 });

    return res.status(200).json({ success: true, count: posts.length, data: posts });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch posts', code: 500 });
  }
};

/**
 * POST /api/communities/:id/posts
 * Create an open play post within a community
 */
const createOpenPlayPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array(), code: 400 });

  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ success: false, error: 'Community not found', code: 404 });

    // Check if user is a member
    if (!community.members.includes(req.user.userId)) {
      return res.status(403).json({ success: false, error: 'You must be a member to create a post', code: 403 });
    }

    const { gameId, scheduledTime, location, maxParticipants } = req.body;

    const post = await OpenPlayPost.create({
      communityId: req.params.id,
      createdBy: req.user.userId,
      gameId,
      scheduledTime,
      location,
      maxParticipants,
      participants: [req.user.userId], // Creator is the first participant
    });

    return res.status(201).json({ success: true, message: 'Post created', data: post });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to create post', code: 500 });
  }
};

/**
 * POST /api/posts/:id/join
 * Join an open play session
 */
const joinOpenPlayPost = async (req, res) => {
  try {
    const post = await OpenPlayPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found', code: 404 });

    if (post.status !== 'open') {
      return res.status(400).json({ success: false, error: 'This session is no longer open', code: 400 });
    }

    if (post.participants.includes(req.user.userId)) {
      return res.status(400).json({ success: false, error: 'Already joined', code: 400 });
    }

    if (post.participants.length >= post.maxParticipants) {
      return res.status(400).json({ success: false, error: 'Session is full', code: 400 });
    }

    const DefaultCommunityCheck = await Community.findById(post.communityId);
    if(DefaultCommunityCheck && !DefaultCommunityCheck.members.includes(req.user.userId)) {
        return res.status(403).json({ success: false, error: 'You must be a member of the community to join this session', code: 403 });
    }

    post.participants.push(req.user.userId);
    
    // Auto-close if full
    if (post.participants.length === post.maxParticipants) {
      post.status = 'closed';
    }

    await post.save();

    return res.status(200).json({ success: true, message: 'Joined session successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to join session', code: 500 });
  }
};

module.exports = {
  getNearbyCommunities,
  createCommunity,
  getCommunity,
  joinCommunity,
  getCommunityPosts,
  createOpenPlayPost,
  joinOpenPlayPost,
};
