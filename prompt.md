# prompt.md — Phased Build Prompts
# Local Sports & Indoor Games Partner Finder Platform

> Run these prompts **in order**, one phase at a time. Each phase builds on the previous. By the end of Phase 5, your system will be deployment-ready.

---

## 📋 Pre-Flight Checklist (Before Starting)

```
□ Node.js 18+ installed
□ MongoDB or PostgreSQL running locally
□ Git repository initialized
□ .env file created with placeholders (see Phase 1 prompt)
□ Read CONTEXT.md and .antigravity/rules.md
```

---

---

# 🟢 PHASE 1 — Project Bootstrap & Authentication

**Goal**: A running full-stack app with user registration, login, and JWT auth.

---

## Phase 1 — Step 1: Project Scaffolding

```
Set up a full-stack web application for a "Local Sports Partner Finder" platform.

Stack:
- Frontend: React.js with Tailwind CSS (use Vite for bundling)
- Backend: Node.js + Express.js
- Database: MongoDB with Mongoose

Create the following folder structure:
/client     → React app
/server     → Express app
/server/models
/server/routes
/server/controllers
/server/middleware
/server/utils

In the server root, create a `.env.example` file with:
PORT=5000
MONGO_URI=mongodb://localhost:27017/sportspartner
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CLIENT_URL=http://localhost:3000

Initialize package.json in both /client and /server with required dependencies.
Install: express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv, express-validator for server.
Install: react, react-router-dom, axios, tailwindcss for client.
```

---

## Phase 1 — Step 2: User Model & Auth API

```
In the /server directory of the sports partner finder app:

Create a Mongoose User model at /server/models/User.js with fields:
- name (String, required)
- email (String, required, unique, lowercase)
- phone (String, optional)
- passwordHash (String, required)
- role (enum: ['user', 'organizer', 'admin'], default: 'user')
- isActive (Boolean, default: true)
- createdAt (Date, default: Date.now)

Create a Mongoose Profile model at /server/models/Profile.js linked to User with:
- userId (ref: User)
- preferredGames (Array of game IDs or strings)
- skillLevel (enum: ['beginner', 'intermediate', 'advanced'])
- availability: { days: [String], slots: [String] }
- preferredLocations ([String])  // 'home', 'clubhouse', 'local_ground'
- location: { type: 'Point', coordinates: [Number], area: String }
  (with 2dsphere index)
- bio (String, optional)
- avatarUrl (String, optional)

Create /server/routes/auth.js with:
- POST /api/auth/register → validate input, hash password, create User + empty Profile, return JWT
- POST /api/auth/login → validate credentials, return access token + refresh token

Create /server/middleware/auth.js:
- verifyToken middleware that extracts and validates JWT from Authorization header
- attachRole middleware that checks user role

Use express-validator for all input validation.
Return consistent response format: { success, data, message } or { success, error, code }.
```

---

## Phase 1 — Step 3: Auth UI (Frontend)

```
In the /client React app for the sports partner finder:

Create a clean, mobile-responsive Auth flow with:

1. /register page — fields: Name, Email, Phone (optional), Password, Confirm Password
2. /login page — fields: Email, Password
3. Protected route wrapper component that redirects to /login if no token

Use Tailwind CSS for styling. Design should be:
- Clean and minimal
- Work well on 375px mobile width
- Show loading spinner during API calls
- Show error messages inline (not alerts)
- Show success toast on register → redirect to /login

Store JWT in memory (not localStorage) using React Context.
Create an AuthContext with: user, token, login(), logout(), isAuthenticated

Use axios for API calls. Set base URL from VITE_API_URL env variable.
```

---

## Phase 1 Checkpoint

```
□ Server starts without errors on PORT 5000
□ MongoDB connects successfully
□ POST /api/auth/register creates a user and returns a token
□ POST /api/auth/login returns a token for valid credentials
□ Invalid credentials return 401
□ Frontend register/login forms work
□ Protected routes redirect unauthenticated users to /login
```

---

---

# 🟡 PHASE 2 — User Profiles & Nearby Player Search

**Goal**: Users can set up their game preferences and discover other players nearby.

---

## Phase 2 — Step 1: Profile API

```
In the sports partner finder /server:

Create /server/routes/profile.js with:
- GET  /api/profile/:userId       → get profile (public view)
- PUT  /api/profile/me            → update own profile (auth required)
  - Body: { preferredGames, skillLevel, availability, preferredLocations, bio, location }
- GET  /api/profile/me            → get own full profile (auth required)

Create /server/routes/games.js with:
- GET /api/games → return list of supported games

Seed the database with initial game data at /server/utils/seedGames.js:
Games: Chess, Carrom, Cards (Rummy/Teen Patti), Badminton, Table Tennis, 
       Cricket, Carom Billiards, Scrabble, Ludo, Tambola

Create /server/controllers/profileController.js for all business logic.
Validate all inputs. Ensure users can only update their own profile.
```

---

## Phase 2 — Step 2: Nearby Players Search API

```
In the sports partner finder /server:

Create GET /api/players/nearby with query parameters:
- lat (Number) — user's latitude
- lng (Number) — user's longitude  
- radius (Number, default: 5000) — search radius in meters
- game (String, optional) — filter by game name
- skillLevel (String, optional) — filter by skill level
- page (Number, default: 1)
- limit (Number, default: 20)

Implementation:
- Use MongoDB $geoNear or $near with the 2dsphere index on Profile.location
- Join with User model to get names
- NEVER return exact coordinates in response — return area/locality only
- Return array of: { userId, name, avatarUrl, preferredGames, skillLevel, availability, area, distanceKm }
- Require auth to access this endpoint
```

---

## Phase 2 — Step 3: Profile Setup & Search UI

```
In the /client React app for the sports partner finder:

1. Create /setup-profile page (shown after first login if profile incomplete):
   - Multi-step form:
     Step 1: Select preferred games (grid of game cards with icons, multi-select)
     Step 2: Set skill level (beginner/intermediate/advanced) — one per game or overall
     Step 3: Set availability (days of week checkboxes + morning/afternoon/evening slots)
     Step 4: Choose playing locations (Home / Society Clubhouse / Local Ground)
     Step 5: Set area (text input + optional GPS button)
   - Progress indicator at top
   - Save to PUT /api/profile/me

2. Create /find-partners page:
   - Filters sidebar/drawer: Game type, Skill level, Availability
   - Player cards grid: Name, Avatar, Games, Skill level, Availability snippet, Area, "Send Request" button
   - Empty state: "No players found nearby — try expanding your search"
   - Loading skeletons while fetching
   - Pagination or infinite scroll

Use Tailwind CSS. Must be fully mobile responsive.
```

---

## Phase 2 Checkpoint

```
□ GET /api/games returns seeded game list
□ PUT /api/profile/me saves preferences correctly
□ GET /api/players/nearby returns players within radius
□ Geo filter works (players far away do not appear)
□ Game filter works
□ Profile setup flow completes and saves
□ Find Partners page shows player cards
□ Empty state shows when no players found
```

---

---

# 🟠 PHASE 3 — Play Requests & Match Flow

**Goal**: Users can send, receive, accept/decline play requests and view their match history.

---

## Phase 3 — Step 1: Play Request API

```
In the sports partner finder /server:

Create a PlayRequest model at /server/models/PlayRequest.js:
- senderId (ref: User, required)
- receiverId (ref: User, required)
- gameId (String, required)
- proposedTime (Date, required)
- location (String — 'home' | 'clubhouse' | 'local_ground' | custom)
- locationNote (String, optional — e.g., "B-wing clubhouse, 3rd floor")
- message (String, optional)
- status (enum: ['pending', 'accepted', 'declined', 'cancelled'], default: 'pending')
- createdAt (Date)
- updatedAt (Date)

Create /server/routes/requests.js:
- POST /api/requests                → send a play request (auth required)
  - Validate: cannot send request to self, no duplicate pending request
- GET  /api/requests/me             → get all my requests (sent + received), with status filter
- PUT  /api/requests/:id/accept     → receiver accepts (auth required, must be receiver)
- PUT  /api/requests/:id/decline    → receiver declines (auth required, must be receiver)
- PUT  /api/requests/:id/cancel     → sender cancels pending request (auth required, must be sender)
- GET  /api/requests/history        → completed/past matches for the authenticated user
```

---

## Phase 3 — Step 2: Requests UI

```
In the /client React app for the sports partner finder:

1. Add "Send Request" flow:
   - Clicking "Send Request" on a player card opens a modal/drawer
   - Modal fields: Select game (from sender's preferred games), Proposed date/time (date picker), Location (dropdown), Message (optional textarea)
   - Submit calls POST /api/requests
   - Show success confirmation

2. Create /requests page with two tabs:
   Tab 1 — "Received": incoming pending requests with Accept / Decline buttons
   Tab 2 — "Sent": outgoing requests with status badges (Pending / Accepted / Declined / Cancelled) and Cancel button for pending ones

3. Create /history page:
   - List of past completed matches
   - Shows: Partner name, game played, date, location
   - Empty state: "No matches yet — find a partner and start playing!"

4. Add notification badge on nav icon showing count of pending received requests

Use Tailwind CSS. Mobile responsive.
```

---

## Phase 3 Checkpoint

```
□ POST /api/requests creates a request correctly
□ Cannot send duplicate pending requests to same user
□ GET /api/requests/me returns correct sent/received
□ Accept/Decline only works for the receiver
□ Cancel only works for the sender
□ Status transitions work correctly
□ Requests UI tabs work
□ Send Request modal submits and shows confirmation
□ History page shows past matches
```

---

---

# 🔵 PHASE 4 — Community Features & Admin Dashboard

**Goal**: Organizers can create groups; admins can manage the platform.

---

## Phase 4 — Step 1: Community API

```
In the sports partner finder /server:

Create a Community model at /server/models/Community.js:
- name (String, required)
- description (String)
- area (String)
- location: { type: 'Point', coordinates: [Number] }
- createdBy (ref: User)
- members ([ref: User])
- isVerified (Boolean, default: false)
- createdAt (Date)

Create an OpenPlayPost model at /server/models/OpenPlayPost.js:
- communityId (ref: Community)
- createdBy (ref: User)
- gameId (String)
- scheduledTime (Date)
- location (String)
- maxParticipants (Number)
- participants ([ref: User])
- status (enum: ['open', 'closed', 'cancelled'])

Create /server/routes/communities.js:
- GET  /api/communities          → list nearby communities (geo filter)
- POST /api/communities          → create community (auth, role: organizer or user)
- POST /api/communities/:id/join → join a community (auth)
- GET  /api/communities/:id      → get community details + members
- POST /api/communities/:id/posts → create open play post (auth, must be member)
- GET  /api/communities/:id/posts → list open play posts
- POST /api/posts/:id/join       → join an open play session
```

---

## Phase 4 — Step 2: Admin Dashboard API

```
In the sports partner finder /server:

Create /server/routes/admin.js (all routes require role: 'admin'):
- GET  /api/admin/users              → paginated list of all users (with search by name/email)
- PUT  /api/admin/users/:id/status   → activate / deactivate user
- GET  /api/admin/communities        → list all communities with verification status
- PUT  /api/admin/communities/:id/verify → verify a community
- GET  /api/admin/stats              → platform stats:
    { totalUsers, activeUsers, totalRequests, successfulMatches, totalCommunities }
- GET  /api/admin/reports            → list of flagged/reported content (stub for Phase 1 moderation)
- GET  /api/admin/games              → list game categories
- POST /api/admin/games              → add a new game category
```

---

## Phase 4 — Step 3: Admin Dashboard UI

```
In the /client React app:

Create an /admin route group (only accessible if role === 'admin'):

1. /admin/dashboard — Stats overview cards:
   - Total Registered Users
   - Active Play Requests
   - Successful Matches
   - Total Communities
   Use recharts or Chart.js for a simple bar/line chart of signups over time.

2. /admin/users — Users table:
   - Columns: Name, Email, Role, Status, Joined Date, Actions (Activate/Deactivate)
   - Search bar by name or email
   - Pagination

3. /admin/communities — Communities table:
   - Columns: Name, Area, Members, Verified, Actions (Verify)

4. /admin/games — Game categories list with Add New Game form

Use a clean sidebar layout for admin. Mark admin nav links distinctly.
Mobile responsive but desktop-first for admin.
```

---

## Phase 4 Checkpoint

```
□ Community creation works
□ Join community works, member list updates
□ Open play post creates and users can join
□ Admin stats endpoint returns correct numbers
□ Admin can list and deactivate users
□ Admin can verify communities
□ Admin can add game categories
□ Admin dashboard UI renders stats and user table
□ Non-admin users cannot access /admin routes
```

---

---

# 🟣 PHASE 5 — Polish, KPI Tracking & Deployment

**Goal**: Production-ready, deployed, with monitoring and final UX polish.

---

## Phase 5 — Step 1: UX Polish

```
In the sports partner finder /client, do a full UX pass:

1. Add a landing/home page at / for unauthenticated users:
   - Hero section: "Find your perfect game partner nearby"
   - How it works: 3 steps (Register → Set preferences → Find & Play)
   - Supported games showcase (icons/cards)
   - CTA: "Get Started" → /register

2. Navigation:
   - Top nav with: Logo | Find Partners | My Requests | Communities | Profile | Logout
   - Mobile: hamburger menu or bottom tab bar (5 icons)
   - Notification badge on Requests icon

3. Profile page /profile:
   - Show avatar, name, preferred games, skill levels, availability
   - Edit button → opens inline edit or /setup-profile

4. Add toast notifications for all success/error actions
5. Add page transitions (fade-in)
6. Ensure all loading and empty states are implemented
7. Run Lighthouse audit — achieve Performance >80, Accessibility >90
```

---

## Phase 5 — Step 2: KPI Tracking

```
In the sports partner finder /server, add basic analytics tracking:

Create a /server/utils/analytics.js module that logs key events to a simple 
Analytics collection in MongoDB:

Events to track:
- user.registered
- user.login
- request.sent
- request.accepted
- request.declined
- community.created
- community.joined

Each event document: { event, userId, metadata, timestamp }

Update /api/admin/stats to read from this collection for:
- Daily active users (last 30 days)
- Match success rate (accepted / total sent)
- Repeat engagement rate (users with 2+ accepted matches)

Add a simple line chart to the admin dashboard for "Daily Signups (last 30 days)".
```

---

## Phase 5 — Step 3: Deployment

```
Prepare the sports partner finder for production deployment:

1. Server (/server):
   - Add production environment validation (throw if required env vars missing)
   - Add helmet.js for security headers
   - Add express-rate-limit for auth routes (10 req/min)
   - Add Morgan logging
   - Build step: no build needed for Express, just ensure start script works
   - Create /server/Dockerfile:
       FROM node:18-alpine
       WORKDIR /app
       COPY package*.json ./
       RUN npm ci --only=production
       COPY . .
       EXPOSE 5000
       CMD ["node", "index.js"]

2. Client (/client):
   - Set VITE_API_URL to production backend URL
   - Run `npm run build` → dist/ folder
   - Deploy dist/ to Vercel or Netlify
   - Configure _redirects file for SPA routing:
       /* /index.html 200

3. Database:
   - Set up MongoDB Atlas free tier cluster
   - Whitelist production server IP
   - Update MONGO_URI in production env

4. Environment:
   - Deploy backend to Railway, Render, or AWS EC2
   - Set all env vars in deployment platform

5. Post-deploy checklist:
   □ Register a new user
   □ Complete profile setup
   □ Search nearby players
   □ Send a play request
   □ Accept the request
   □ View match history
   □ Access admin dashboard
   □ Check Lighthouse score
```

---

## Phase 5 — Final Checklist

```
□ Landing page with CTA works for unauthenticated users
□ Full auth flow works in production
□ Profile setup saves correctly
□ Nearby player search returns results
□ Play request full flow works (send → accept → history)
□ Community create + join works
□ Admin dashboard shows correct stats
□ KPI events are being logged
□ Rate limiting is active on auth routes
□ Security headers present (check via https://securityheaders.com)
□ Mobile responsive on 375px (test on real device)
□ Lighthouse Performance >80, Accessibility >90
□ No .env secrets committed to git (.gitignore verified)
□ README.md written with setup instructions
□ PRD & CONTEXT.md up to date
□ Deployment URL confirmed working
```

---

---

## 🎉 System Complete

After completing all 5 phases your platform will have:

| Feature | Status |
|---------|--------|
| User Registration & Auth | ✅ |
| Game Preferences & Profiles | ✅ |
| Nearby Player Discovery | ✅ |
| Play Request & Match Flow | ✅ |
| Match History | ✅ |
| Community Groups & Open Play | ✅ |
| Admin Dashboard | ✅ |
| KPI / Analytics Tracking | ✅ |
| Deployed & Production-Ready | ✅ |

---

*Generated from PRD — Local Sports & Indoor Games Partner Finder Platform*
