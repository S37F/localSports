# LocalSports

LocalSports is a full-stack web application for finding nearby indoor and outdoor sports partners in local communities.

It helps users:
- Register and create profiles
- Set game preferences, skill level, and availability
- Discover nearby players
- Send and manage play requests
- Participate in communities
- Use role-based admin views

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB
- Auth: JWT + bcrypt
- Realtime: Socket.IO

## Repository Structure

- client: React app (UI, routes, pages, context, API client)
- server: Express API (routes, controllers, models, middleware, utilities)
- seed_mock.js: local seed helper for test users
- test.js: local test helper
- CONTEXT.md: product and engineering context
- overview.md: functional and product overview
- prompt.md: phased implementation prompts
- rules.md: coding and architecture rules

## Core Features

- Authentication
  - Register and login
  - JWT-based protected APIs
- Player Profile
  - Preferred games
  - Skill level and availability
  - Preferred playing locations and area
- Partner Discovery
  - Nearby player search with filters
- Play Requests
  - Send, receive, accept, decline, cancel
  - History tracking
- Communities
  - Community listing and details
  - Open play participation model
- Admin
  - Admin dashboard pages and management routes

## Local Development (No Cloud)

This project can run completely locally.

### Prerequisites

- Node.js 18+
- npm
- MongoDB Community Server running on your machine

### 1) Start MongoDB

Use MongoDB as a Windows service, or run it manually. Default connection used by backend:

mongodb://localhost:27017/sportspartner

### 2) Configure backend environment

Create server/.env with:

PORT=5000
MONGO_URI=mongodb://localhost:27017/sportspartner
JWT_SECRET=replace_with_a_strong_secret
JWT_REFRESH_SECRET=replace_with_a_second_strong_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173

### 3) Install dependencies

In one terminal:

cd server
npm install

In another terminal:

cd client
npm install

### 4) Run the app

Backend:

cd server
npm run dev

Frontend:

cd client
npm run dev

Open the app at:

http://localhost:5173

Health check:

http://localhost:5000/api/health

## Optional: Local Seed Data

After backend is running, you can seed test players:

node seed_mock.js

This script registers mock users and updates profile data through the API.

## Docker Option (MongoDB only)

If you prefer MongoDB via Docker:

docker run -d --name localsports-mongo -p 27017:27017 -e MONGO_INITDB_DATABASE=sportspartner -v localsports_mongo_data:/data/db mongo:7

Keep backend MONGO_URI as:

mongodb://localhost:27017/sportspartner

Important: do not run both Docker MongoDB and Windows MongoDB service at the same time on port 27017.

## Security Notes

- Never commit real secrets in .env
- Use different JWT secrets for development and production
- Restrict CORS and Socket.IO origins in production

## Scripts

### Client

- npm run dev: start Vite dev server
- npm run build: production build
- npm run preview: preview production build

### Server

- npm run dev: start backend with nodemon
- npm start: start backend with node

## API Overview

Main route groups:

- /api/auth
- /api/profile
- /api/games
- /api/players
- /api/requests
- /api/communities
- /api/admin
- /api/chat

## Status

Current codebase includes major flows for auth, profile, discovery, requests, communities, admin, and chat APIs/pages. Additional polish, tests, and deployment hardening can be added iteratively.
