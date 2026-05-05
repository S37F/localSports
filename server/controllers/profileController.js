const { validationResult } = require('express-validator');
const Profile = require('../models/Profile');
const User = require('../models/User');

/**
 * GET /api/profile/me
 * Get the authenticated user's profile
 */
const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.userId }).populate('userId', 'name email phone avatarUrl');
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
        code: 404,
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    console.error('GetMyProfile error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
      code: 500,
    });
  }
};

/**
 * PUT /api/profile/me
 * Update the authenticated user's profile preferences
 */
const updateMyProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
      code: 400,
    });
  }

  const { preferredGames, skillLevel, availability, preferredLocations, location, bio } = req.body;

  try {
    let profile = await Profile.findOne({ userId: req.user.userId });
    
    if (!profile) {
      // Create if it doesn't exist (failsafe, auth should create it)
      profile = new Profile({ userId: req.user.userId });
    }

    // Update fields
    if (preferredGames !== undefined) profile.preferredGames = preferredGames;
    if (skillLevel !== undefined) profile.skillLevel = skillLevel;
    if (availability !== undefined) profile.availability = availability;
    if (preferredLocations !== undefined) profile.preferredLocations = preferredLocations;
    if (bio !== undefined) profile.bio = bio;
    
    // Handle location structure specifically
    if (location) {
      profile.location = {
        type: 'Point',
        coordinates: location.coordinates || profile.location.coordinates,
        area: location.area || profile.location.area,
      };
    }

    // Re-check completion status
    profile.checkCompletion();

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    });
  } catch (err) {
    console.error('UpdateMyProfile error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      code: 500,
    });
  }
};

/**
 * GET /api/profile/:userId
 * Get a public profile by user ID
 */
const getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId }).populate('userId', 'name avatarUrl role createdAt');
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
        code: 404,
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    console.error('GetProfileById error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
      code: 500,
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getProfileById
};
