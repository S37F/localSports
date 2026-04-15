const express = require('express');
const { body } = require('express-validator');
const { getMyProfile, updateMyProfile, getProfileById } = require('../controllers/profileController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Validation for profile updates
const updateProfileValidation = [
  body('preferredGames').optional().isArray(),
  body('skillLevel').optional().isIn(['beginner', 'intermediate', 'advanced', null]),
  body('availability.days').optional().isArray(),
  body('availability.slots').optional().isArray(),
  body('preferredLocations').optional().isArray(),
  body('location.coordinates').optional().isArray().isLength({ min: 2, max: 2 }),
  body('location.area').optional().isString(),
  body('bio').optional().isString().isLength({ max: 500 }),
];

// Routes
router.get('/me', verifyToken, getMyProfile);
router.put('/me', verifyToken, updateProfileValidation, updateMyProfile);
router.get('/:userId', verifyToken, getProfileById);

module.exports = router;
