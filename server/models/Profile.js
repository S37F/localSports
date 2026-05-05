const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    preferredGames: {
      type: [String],
      default: [],
    },
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', null],
      default: null,
    },
    availability: {
      days: {
        type: [String],
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        default: [],
      },
      slots: {
        type: [String],
        enum: ['morning', 'afternoon', 'evening'],
        default: [],
      },
    },
    preferredLocations: {
      type: [String],
      enum: ['home', 'clubhouse', 'local_ground'],
      default: [],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
      area: {
        type: String,
        default: '',
      },
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio must be at most 500 characters'],
      default: '',
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere geospatial index for nearby searches
profileSchema.index({ location: '2dsphere' });

/**
 * Check if the profile has the minimum required fields complete
 */
profileSchema.methods.checkCompletion = function () {
  const complete =
    this.preferredGames.length > 0 &&
    this.skillLevel !== null &&
    this.availability.days.length > 0;
  this.isProfileComplete = complete;
  return complete;
};

profileSchema.set('toJSON', {
  transform: (doc, ret) => {
    // Never expose exact coordinates
    if (ret.location) {
      ret.location = { area: ret.location.area };
    }
    delete ret.__v;
    return ret;
  },
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
