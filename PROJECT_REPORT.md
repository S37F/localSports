# LocalSports Project Report

## 1) Project Overview

`LocalSports` is a full-stack web application designed to help people discover and connect with nearby sports/game partners in local communities.
It supports user onboarding, profile setup, nearby partner discovery, play request management, communities, admin panels, and chat APIs/pages.

Repository: [S37F/localSports](https://github.com/S37F/localSports)

---

## 2) Business Goal

The product addresses a common problem: users want to play (badminton, chess, table tennis, etc.) but struggle to find local partners with matching skill, location, and availability.

### Core value delivered
- Faster local match discovery
- Better coordination through requests and messaging
- Community participation for recurring/open play
- Admin moderation and user/community management

---

## 3) Current Technical Architecture

### Frontend
- React + Vite + Tailwind CSS
- Routing with `react-router-dom`
- Axios API layer
- Auth context for session state
- Toast notifications
- Pages for auth, profile, discovery, requests, communities, chat, and admin

### Backend
- Node.js + Express
- MongoDB via Mongoose
- JWT auth + role authorization
- Route/controller pattern
- Rate limiting + helmet + morgan + CORS
- Chat endpoints plus Socket.IO support for long-running Node runtime

### Key backend route groups
- `/api/auth`
- `/api/profile`
- `/api/games`
- `/api/players`
- `/api/requests`
- `/api/communities`
- `/api/admin`
- `/api/chat`

---

## 4) Major Functional Modules

### A) Authentication & Authorization
- Register/login implemented
- Access + refresh token issuance
- Protected routes on frontend
- Role-based guards for admin pages

### B) Profile Management
- Step-based profile setup
- Games, skill level, availability, preferred location area
- Completion state tracking and gating flows

### C) Partner Discovery
- Nearby search endpoint with filters
- Geo query support via profile location

### D) Requests Workflow
- Create / receive / accept / decline / cancel request flows
- History and status tracking

### E) Communities
- Community list/details and participation model

### F) Admin
- Dashboard and management pages
- Admin-only APIs and UI guards

### G) Chat
- REST chat flows working in deployed model
- Socket.IO realtime works in long-running server runtime (not Vercel serverless)

---

## 5) Recent Engineering Work Completed

### Stability and UX improvements
- Added auth persistence with local storage rehydration
- Added `authReady` gating to prevent route flicker and invalid redirects
- Fixed admin route protection using `requireAdmin`
- Removed duplicate route definitions and dead imports
- Improved dashboard with actionable cards and live-ish counts
- Added landing redirect logic for authenticated users
- Fixed chat identity comparison issues (`ObjectId` vs string handling)
- Added `seed_mock.js` for local seed data

### Deployment-oriented refactor
- Split backend architecture for dual runtime:
  - `server/index.js` for local/long-running Node + Socket.IO
  - `server/api/index.js` for Vercel serverless entry
- Added Express app factory module and serverless Mongo connection reuse
- Added Vercel config for client and server
- Added deployment docs for same-repo dual-project setup
- Added defensive Mongo URI validation logic for Vercel context
- Removed duplicate Mongoose index warning source in `Profile`

---

## 6) Deployment Model (Current)

### Monorepo pattern with two Vercel projects
1. **Frontend project**
   - Root directory: `client`
   - Build output: `dist`
   - Env: `VITE_API_URL=https://<api-domain>/api`

2. **API project**
   - Root directory: `server`
   - Serverless function entry via `server/api/index.js`
   - Env includes `MONGO_URI`, JWT secrets, `CLIENT_URL`

---

## 7) Deployment Issues Encountered & Findings

### Observed failures
- `FUNCTION_INVOCATION_FAILED`
- `MongooseServerSelectionError ECONNREFUSED 127.0.0.1:27017`
- Vercel build analyzer requiring entrypoint visibility for Express
- Invalid export/runtime detection around entrypoint interpretation

### Root causes
- Missing/invalid cloud `MONGO_URI` (defaulting to localhost in cloud context)
- Entrypoint structure mismatch with Vercel scanning expectations
- Duplicate schema index warning on `Profile.userId` (non-fatal but noisy)

### Current status
- Code refactors are in place to support deployment model.
- Final production health depends on correct Vercel env setup and successful redeploy of latest commit.

---

## 8) Environment Variables Matrix

### API project (`server`)
- `MONGO_URI` (**required**)
- `JWT_SECRET` (**required**)
- `JWT_REFRESH_SECRET` (**required**)
- `CLIENT_URL` (**required for CORS browser calls**)
- Optional: `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`

### Frontend project (`client`)
- `VITE_API_URL` (**required in production**)

---

## 9) Risk Assessment

### Technical risks
- Vercel serverless does not support Socket.IO as a persistent realtime channel
- Incorrect CORS origins can block frontend-to-API calls
- Atlas network/database user misconfiguration can keep API unavailable

### Operational risks
- Env mismatch across preview/prod deployments
- Incomplete redeploy after env updates

---

## 10) Quality & Verification Status

### Verified during work
- Client production build succeeded locally
- Lint checks on edited files reported clean state
- Server module-level sanity checks completed

### Still required in cloud
- Confirm `/api/health` from latest deployment
- Confirm auth flow end-to-end on deployed frontend
- Confirm request and discovery APIs with real cloud DB data

---

## 11) Recommended Next Actions (Priority Order)

1. Ensure API Vercel project has valid `MONGO_URI` (Atlas), JWT secrets, `CLIENT_URL`.
2. Redeploy API from latest `main`.
3. Validate `GET /api/health`.
4. Set/update frontend `VITE_API_URL` to API domain + `/api`.
5. Redeploy frontend and test full user journey:
   - register/login
   - profile setup
   - find partners
   - send/receive requests
6. Decide chat strategy:
   - keep REST-only on Vercel, or
   - move API to long-running host for Socket.IO realtime.

---

## 12) Conclusion

The project is functionally mature and structurally solid for MVP-level usage.
Most current blockers are **deployment configuration**, not core business logic. With correct cloud env values and a clean redeploy, the application should run end-to-end in the chosen monorepo deployment model.
