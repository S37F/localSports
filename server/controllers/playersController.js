const Profile = require('../models/Profile');

/**
 * GET /api/players/nearby
 * Find players within a certain radius, filtered by optional game and skillLevel
 */
const getNearbyPlayers = async (req, res) => {
  try {
    const { 
      lat, 
      lng, 
      radius = 5000, // 5km default
      game, 
      skillLevel, 
      page = 1, 
      limit = 20 
    } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and Longitude are required',
        code: 400
      });
    }

    const maxDistance = parseInt(radius, 10);
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    // Build query
    const query = {
      // Exclude the current user from search results
      userId: { $ne: req.user.userId },
      // Must have completed profile to be discovered
      isProfileComplete: true,
      
      // Geospatial match
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parsedLng, parsedLat] // Note: GeoJSON stores [longitude, latitude]
          },
          $maxDistance: maxDistance
        }
      }
    };

    // Optional filters
    if (game) {
      query.preferredGames = { $in: [game] };
    }
    
    if (skillLevel) {
      query.skillLevel = skillLevel;
    }

    // Pagination
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // Execute query
    const players = await Profile.find(query)
      .populate('userId', 'name avatarUrl isActive') // Only get necessary user fields
      .skip(skip)
      .limit(parseInt(limit, 10));

    // Filter out inactive users natively in mongoose or after populate
    const activePlayers = players.filter(p => p.userId && p.userId.isActive !== false);

    return res.status(200).json({
      success: true,
      count: activePlayers.length,
      page: parseInt(page, 10),
      // We rely on the Profile model's `toJSON` to strip exact coordinates
      data: activePlayers
    });

  } catch (err) {
    console.error('getNearbyPlayers error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to find nearby players',
      code: 500
    });
  }
};

module.exports = {
  getNearbyPlayers
};
