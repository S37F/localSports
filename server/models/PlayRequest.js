const mongoose = require('mongoose');

const playRequestSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    gameId: {
      type: String, // Maps to the static GAMES array name
      required: true,
    },
    proposedTime: {
      type: Date,
      required: true,
    },
    location: {
      type: String, // 'home' | 'clubhouse' | 'local_ground' | custom text
      required: true,
    },
    locationNote: {
      type: String, // e.g., "B-wing clubhouse, 3rd floor"
      default: '',
      maxlength: 200,
    },
    message: {
      type: String,
      default: '',
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes to quickly find requests for a user
playRequestSchema.index({ senderId: 1, status: 1 });
playRequestSchema.index({ receiverId: 1, status: 1 });

const PlayRequest = mongoose.model('PlayRequest', playRequestSchema);

module.exports = PlayRequest;
