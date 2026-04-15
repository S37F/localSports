# CONTEXT.md — Local Sports & Indoor Games Partner Finder Platform

> This file provides the full engineering and product context for AI assistants, developers, and contributors working on this project.

---

## 🎯 What We're Building

A **web-based community platform** that allows individuals to discover and connect with nearby game partners for indoor and outdoor recreational activities.

Think of it as a **"Bumble for badminton"** — but community-first, neighborhood-scoped, and designed for all age groups.

---

## 🧑‍🤝‍🧑 Target Users

| Role | Description |
|------|-------------|
| **Player (Primary)** | Any individual who wants to find a local game partner |
| **Community Organizer** | Society president, clubhouse manager, or group coordinator |
| **Admin** | Platform moderator who manages users, reports, and categories |

> Note: The PRD refers to the primary user segment as **"Women"** — indicating this platform may be specifically targeted at enabling safe, convenient recreation for women in residential communities. Design and copy should reflect this context with safety-conscious features and inclusive language.

---

## 🗂️ Project Structure (Recommended)

```
/
├── client/                   # Frontend (React/Next.js)
│   ├── components/
│   │   ├── auth/             # Login, Register, OTP
│   │   ├── profile/          # User profile, edit, skill level
│   │   ├── search/           # Nearby players, filters
│   │   ├── requests/         # Play request cards, status
│   │   ├── community/        # Group pages, schedules
│   │   └── admin/            # Admin dashboard components
│   ├── pages/                # Next.js pages or React routes
│   └── styles/               # Tailwind or CSS modules
│
├── server/                   # Backend (Node.js + Express)
│   ├── routes/               # REST API routes
│   ├── controllers/          # Business logic
│   ├── models/               # DB schemas (Mongoose/Sequelize)
│   ├── middleware/            # Auth, error handling
│   └── utils/                # Helpers (geo, matchmaking)
│
├── .antigravity/             # AI assistant rules & context
│   └── rules.md
├── CONTEXT.md                # ← This file
├── overview.md               # Product overview
├── prompt.md                 # Phased build prompts
└── README.md
```

---

## 🧩 Core Domain Concepts

### Entities

| Entity | Key Fields |
|--------|-----------|
| `User` | id, name, email, phone, passwordHash, location (lat/lng, area), avatarUrl, createdAt |
| `Profile` | userId, preferredGames[], skillLevel (beginner/intermediate/advanced), availability (days[], timeSlots[]), preferredLocations[] |
| `Game` | id, name, type (indoor/outdoor), description, iconUrl |
| `PlayRequest` | id, senderId, receiverId, gameId, proposedTime, location, status (pending/accepted/declined/cancelled), message |
| `Community` | id, name, description, area, createdBy, members[], isVerified |
| `OpenPlayPost` | id, communityId, createdBy, gameId, slots, scheduledTime, location, participants[] |

### Status Flow for PlayRequest
```
PENDING → ACCEPTED → [session happens] → COMPLETED
       → DECLINED
       → CANCELLED (by sender before acceptance)
```

---

## 🗺️ API Surface (Phase 1)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/profile/:userId` | Get user profile |
| PUT | `/api/profile/:userId` | Update profile/preferences |
| GET | `/api/players/nearby` | Search players (query: game, lat, lng, radius) |
| POST | `/api/requests` | Send a play request |
| PUT | `/api/requests/:id` | Accept / Decline request |
| GET | `/api/requests/me` | Get my requests (sent + received) |
| GET | `/api/games` | List all game categories |
| GET | `/api/communities` | List nearby communities |
| POST | `/api/communities` | Create a community |
| POST | `/api/communities/:id/join` | Join a community |
| GET | `/api/admin/users` | Admin: list all users |
| GET | `/api/admin/reports` | Admin: view reports |

---

## 🗃️ Database Notes

- Use **geospatial indexing** on user location (MongoDB `2dsphere` index or PostGIS for PostgreSQL)
- PlayRequest updates should trigger **notification events** (email/in-app) — Phase 2
- Availability is stored as a JSON object: `{ days: ["Monday", "Wednesday"], slots: ["morning", "evening"] }`
- Games are seeded at launch; admin can add more via dashboard

---

## 🔐 Auth Strategy

- **JWT-based authentication** (access token + refresh token)
- Passwords hashed with **bcrypt**
- Role-based access: `user`, `organizer`, `admin`
- Future: OTP login via phone number (Phase 2)

---

## 🧭 Location Strategy

- Users provide their **area/locality** (text) and optionally grant GPS permission
- Backend stores `{ lat, lng, area: "Andheri West, Mumbai" }`
- Nearby search uses haversine formula or geospatial DB query within configurable radius (default: 5 km)
- Maps display: Use **Google Maps API** or **Leaflet.js** (open-source fallback)

---

## 📦 Phase Summary

| Phase | Focus |
|-------|-------|
| **Phase 1** | Auth + Profiles + Game Selection + Nearby Search |
| **Phase 2** | Play Requests + Match Flow + History |
| **Phase 3** | Community Features + Open Play Posts |
| **Phase 4** | Admin Dashboard + Moderation |
| **Phase 5** | Polish, KPI Tracking, Deployment |

---

## ⚠️ Known Constraints (Phase 1)

- No real-time chat or video calling
- No native mobile app (web only, but must be mobile responsive)
- No tournament bracket or scoring system
- Limited moderation — flag/report only, manual review
- Fixed development timeline — prioritize core match flow over extras
