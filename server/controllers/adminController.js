const User = require('../models/User');
const Community = require('../models/Community');
const PlayRequest = require('../models/PlayRequest');
const Analytics = require('../models/Analytics');

/**
 * GET /api/admin/stats
 * Overview statistics for the dashboard
 */
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalCommunities = await Community.countDocuments();
    const verifiedCommunities = await Community.countDocuments({ isVerified: true });
    const totalRequests = await PlayRequest.countDocuments();
    const acceptedMatches = await PlayRequest.countDocuments({ status: 'accepted' });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Aggregate daily signups
    const dailySignups = await Analytics.aggregate([
      { $match: { event: 'user.registered', createdAt: { $gte: thirtyDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        users: { total: totalUsers, active: activeUsers },
        communities: { total: totalCommunities, verified: verifiedCommunities },
        requests: { total: totalRequests, completed: acceptedMatches },
        chartData: dailySignups // Array of { _id: 'YYYY-MM-DD', count: N }
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch admin stats', code: 500 });
  }
};

/**
 * GET /api/admin/users
 * List all users with basic info for the admin table
 */
const getUsers = async (req, res) => {
  try {
    // Basic pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find({}, '-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const count = await User.countDocuments();

    return res.status(200).json({
      success: true,
      count: users.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: users
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch users', code: 500 });
  }
};

/**
 * PUT /api/admin/users/:id/status
 * Toggle a user's active/banned status
 */
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found', code: 404 });
    
    if (user.role === 'admin' && user._id.toString() !== req.user.userId) {
       return res.status(403).json({ success: false, error: 'Cannot modify other admins', code: 403 });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({ 
      success: true, 
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      data: { id: user._id, isActive: user.isActive }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update user status', code: 500 });
  }
};

/**
 * GET /api/admin/communities
 * List communities for verification
 */
const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
      
    return res.status(200).json({ success: true, count: communities.length, data: communities });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch communities', code: 500 });
  }
};

/**
 * PUT /api/admin/communities/:id/verify
 * Toggle community verification status
 */
const toggleCommunityVerification = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ success: false, error: 'Community not found', code: 404 });

    community.isVerified = !community.isVerified;
    await community.save();

    return res.status(200).json({ 
      success: true, 
      message: `Community ${community.isVerified ? 'verified' : 'unverified'}`,
      data: { id: community._id, isVerified: community.isVerified }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to verify community', code: 500 });
  }
};

module.exports = {
  getStats,
  getUsers,
  toggleUserStatus,
  getCommunities,
  toggleCommunityVerification
};
