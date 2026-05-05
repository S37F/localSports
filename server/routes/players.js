const express = require('express');
const { getNearbyPlayers } = require('../controllers/playersController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/nearby', verifyToken, getNearbyPlayers);

module.exports = router;
