const express = require('express');
const { body } = require('express-validator');
const { 
  createRequest, 
  getMyRequests, 
  acceptRequest, 
  declineRequest, 
  cancelRequest, 
  getHistory 
} = require('../controllers/requestsController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Validation for sending a request
const requestValidation = [
  body('receiverId').notEmpty().withMessage('Receiver ID is required').isMongoId(),
  body('gameId').notEmpty().withMessage('Game ID is required'),
  body('proposedTime').notEmpty().withMessage('Proposed time is required').isISO8601(),
  body('location').notEmpty().withMessage('Location is required'),
  body('locationNote').optional().isString().isLength({ max: 200 }),
  body('message').optional().isString().isLength({ max: 500 }),
];

// Routes
router.post('/', verifyToken, requestValidation, createRequest);
router.get('/me', verifyToken, getMyRequests);
router.get('/history', verifyToken, getHistory);
router.put('/:id/accept', verifyToken, acceptRequest);
router.put('/:id/decline', verifyToken, declineRequest);
router.put('/:id/cancel', verifyToken, cancelRequest);

module.exports = router;
