const mongoose = require('mongoose');

const openPlayPostSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    gameId: {
      type: String,
      required: true,
    },
    scheduledTime: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    maxParticipants: {
      type: Number,
      required: true,
      min: 2,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['open', 'closed', 'cancelled'],
      default: 'open',
    },
  },
  {
    timestamps: true,
  }
);

openPlayPostSchema.index({ communityId: 1, status: 1 });

const OpenPlayPost = mongoose.model('OpenPlayPost', openPlayPostSchema);

module.exports = OpenPlayPost;
