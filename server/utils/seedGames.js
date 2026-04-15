require('dotenv').config();
const mongoose = require('mongoose');
const Profile = require('../models/Profile');

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

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sportspartner';

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    // Note: In a real app we might store Games in DB
    // But since games are static right now, this seed is just a demonstration
    // of how we might add some mock users to test the nearby search
    console.log('Seed games script loaded... (Games are static currently)');
    
    // Create spatial index
    await Profile.collection.createIndex({ location: "2dsphere" });
    console.log('✅ Ensured 2dsphere index on Profile.location');
    
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
