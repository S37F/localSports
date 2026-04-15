const express = require('express');
const { body } = require('express-validator');
const { 
  getNearbyCommunities, 
  createCommunity, 
  getCommunity, 
  joinCommunity, 
  getCommunityPosts, 
  createOpenPlayPost,
  joinOpenPlayPost
} = require('../controllers/communitiesController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Validations
const createCommunityValidation = [
  body('name').notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('description').optional().isString().isLength({ max: 500 }),
  body('area').notEmpty().withMessage('Area is required'),
  body('location.coordinates').isArray().isLength({ min: 2, max: 2 }),
];

const createPostValidation = [
  body('gameId').notEmpty(),
  body('scheduledTime').notEmpty().isISO8601(),
  body('location').notEmpty(),
  body('maxParticipants').isInt({ min: 2 }),
];

// Community Routes
router.get('/', getNearbyCommunities);
router.post('/', verifyToken, createCommunityValidation, createCommunity);
router.get('/:id', getCommunity);
router.post('/:id/join', verifyToken, joinCommunity);

// Post Routes inside Community
router.get('/:id/posts', getCommunityPosts);
router.post('/:id/posts', verifyToken, createPostValidation, createOpenPlayPost);

// Direct join post route (exported from communityController)
router.post('/posts/:id/join', verifyToken, joinOpenPlayPost);

module.exports = router;
