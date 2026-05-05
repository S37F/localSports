const express = require('express');
const { 
  getStats, 
  getUsers, 
  toggleUserStatus, 
  getCommunities, 
  toggleCommunityVerification 
} = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// All routes in here require standard JWT + 'admin' role
router.use(verifyToken);
router.use(requireRole(['admin']));

// Stats
router.get('/stats', getStats);

// Users
router.get('/users', getUsers);
router.put('/users/:id/status', toggleUserStatus);

// Communities
router.get('/communities', getCommunities);
router.put('/communities/:id/verify', toggleCommunityVerification);

module.exports = router;
