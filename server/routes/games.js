const express = require('express');
const router = express.Router();

// Static list of supported games
const GAMES = [
  { id: '1', name: 'Badminton', type: 'indoor', icon: '🏸' },
  { id: '2', name: 'Chess', type: 'indoor', icon: '♟️' },
  { id: '3', name: 'Carrom', type: 'indoor', icon: '🎯' },
  { id: '4', name: 'Table Tennis', type: 'indoor', icon: '🏓' },
  { id: '5', name: 'Cards', type: 'indoor', icon: '🃏' },
  { id: '6', name: 'Ludo', type: 'indoor', icon: '🎲' },
  { id: '7', name: 'Cricket', type: 'outdoor', icon: '🏏' },
  { id: '8', name: 'Billiards', type: 'indoor', icon: '🎱' },
];

/**
 * GET /api/games
 * Return list of supported games
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: GAMES
  });
});

module.exports = router;
