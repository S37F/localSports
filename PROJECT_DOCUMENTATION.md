# LocalSports — Comprehensive Project Documentation

## 1. Tech stack

### Frontend (`client/package.json`)

| Technology | Version |
|------------|---------|
| **React** | ^18.3.1 |
| **react-dom** | ^18.3.1 |
| **Vite** | ^5.2.8 |
| **react-router-dom** | ^6.22.3 |
| **axios** | ^1.6.8 |
| **react-hot-toast** | ^2.6.0 |
| **recharts** | ^2.12.3 |
| **socket.io-client** | ^4.7.5 |
| **Tailwind CSS** | ^3.4.3 |
| **PostCSS** | ^8.4.38 |
| **Autoprefixer** | ^10.4.19 |
| **@vitejs/plugin-react** | ^4.3.0 |
| **@types/react** / **@types/react-dom** | ^18.3.1 |

### Backend (`server/package.json`)

| Technology | Version |
|------------|---------|
| **Node.js** | >=18 (`engines`) |
| **Express** | ^4.18.3 |
| **Mongoose** | ^8.3.1 |
| **jsonwebtoken** | ^9.0.2 |
| **bcryptjs** | ^2.4.3 |
| **cors** | ^2.8.5 |
| **helmet** | ^7.1.0 |
| **morgan** | ^1.10.0 |
| **express-rate-limit** | ^7.2.0 |
| **express-validator** | ^7.0.1 |
| **dotenv** | ^16.4.5 |
| **socket.io** | ^4.7.5 |
| **serverless-http** | ^3.2.0 |
| **nodemon** | ^3.1.0 (dev) |

### Database

- **MongoDB** (connection via `MONGO_URI` / default `mongodb://localhost:27017/sportspartner` in `server/db.js`).

### DevOps / deployment

- **Vercel**: `server/vercel.json` rewrites to serverless handler `server/api/index.js`; `client/vercel.json` SPA rewrites + Vite build (`dist`).
- **Docker**: `server/Dockerfile` — Node 18 Alpine, `npm ci --only=production`, `CMD ["node","index.js"]`.
- **Scripts**: `seed_mock.js` (HTTP seeding against API); `server/utils/seedGames.js` (ensures `2dsphere` index; games remain static in API).

### Testing

- **No automated test framework** is present in repo (no `jest`, `vitest`, `pytest`, or `*test*` files under the project root).

---

## 2. Backend concepts & key methods

Concepts are inferred from actual code (not generic templates).

### REST API + layered routing

- **What it is**: HTTP resources grouped under `/api/*` with Express routers delegating to controllers.
- **Why here**: Exposes auth, profiles, discovery, requests, communities, admin, chat.
- **How**: `buildApp()` in `server/lib/expressApp.js` mounts routers; each `server/routes/*.js` wires HTTP verbs to `server/controllers/*Controller.js`.
- **Where**: `server/lib/expressApp.js` (`buildApp`), `server/routes/*.js`.

### JWT (access + refresh generation; access used for APIs)

- **What it is**: Signed tokens carrying identity claims.
- **Why here**: Stateless auth for protected routes and Socket.IO-aligned client origins.
- **How**: `generateTokens` in `authController.js` signs `{ userId, role }` with `JWT_SECRET` / `JWT_REFRESH_SECRET`; middleware reads `Authorization: Bearer <access>` and `jwt.verify`.
- **Where**: `server/controllers/authController.js` (`generateTokens`, `login`, `register`), `server/middleware/auth.js` (`verifyToken`).

### bcrypt password hashing

- **What it is**: Slow hash for storing passwords securely.
- **Why here**: `register` hashes with `bcrypt.genSalt(12)`; login uses `user.comparePassword`.
- **Where**: `server/controllers/authController.js`, `server/models/User.js` (`comparePassword`, `passwordHash`).

### Role-based access control (RBAC)

- **What it is**: Restricting routes based on `role` in the token / user.
- **Why here**: Admin dashboard APIs require `admin`.
- **How**: After `verifyToken`, `requireRole(['admin'])` checks `req.user.role`.
- **Where**: `server/middleware/auth.js` (`requireRole`), `server/routes/admin.js`.

### CORS

- **What it is**: Cross-origin resource sharing policy for browsers.
- **Why here**: React dev server (e.g. `5173`) calls API; production may list multiple origins.
- **How**: `CLIENT_URL` split by commas → `origin` option + `credentials: true` on Express and Socket.IO.
- **Where**: `server/lib/expressApp.js` (`getCorsOrigins`, `cors`), `server/index.js` (Socket.IO `cors`).

### Rate limiting

- **What it is**: Throttling requests per IP (and trust proxy aware).
- **Why here**: Reduces brute force and abuse on `/api` and tighter limits on `/api/auth`.
- **How**: `apiLimiter` (100 / 15 min) on `/api`; `authLimiter` (20 / 15 min) on `/api/auth` in `expressApp.js`; `routes/auth.js` adds per-route limiter (10 / min) on register/login with JSON body.
- **Where**: `server/lib/expressApp.js`, `server/routes/auth.js`.

### Helmet

- **What it is**: Sets security-related HTTP headers.
- **Why here**: Default hardening for Express responses.
- **How**: `app.use(helmet())` inside `buildApp`.
- **Where**: `server/lib/expressApp.js`.

### Request logging

- **What it is**: HTTP access-style logs.
- **Why here**: Dev visibility (`morgan('dev')`).
- **Where**: `server/lib/expressApp.js`.

### Input validation (`express-validator`)

- **What it is**: Declarative validation on `body`/params.
- **Why here**: Register/login/profile/requests/community POST bodies sanitized and constrained.
- **How**: Validator arrays chained before handlers; controllers call `validationResult(req)`.
- **Where**: `server/routes/auth.js`, `profile.js`, `requests.js`, `communities.js`.

### Geospatial queries (MongoDB `2dsphere`)

- **What it is**: Location-based `$near` queries on GeoJSON points.
- **Why here**: Nearby players and nearby communities.
- **How**: `Profile` / `Community` schemas index `location: '2dsphere'`; `getNearbyPlayers` / `getNearbyCommunities` use `$near` + `$geometry`.
- **Where**: `server/models/Profile.js`, `Community.js`; `playersController.js`, `communitiesController.js`.

### Pagination & filtering

- **What it is**: `skip`/`limit` from query strings.
- **Why here**: Player search, communities list, messages, admin users.
- **Where**: `getNearbyPlayers`, `getNearbyCommunities`, `getMessages` (`chatController.js`), `getUsers` (`adminController.js`).

### Analytics event logging

- **What it is**: Persists domain events to an `Analytics` collection.
- **Why here**: Admin chart of signups (`user.registered`) and audit-style actions (requests, communities).
- **How**: `logEvent(eventName, userId, metadata)` → `Analytics.create`; failures are logged, not thrown.
- **Where**: `server/utils/analytics.js`, `server/models/Analytics.js`, used from `authController.js`, `requestsController.js`, `communitiesController.js`.

### Serverless adapter (Vercel)

- **What it is**: Wraps Express app as a single Lambda-style handler.
- **Why here**: Deploy API without long-running Node process on Vercel.
- **How**: `connectMongo()` then `serverless(expressApp)`; bootstrap cached in `handlerPromise`.
- **Where**: `server/api/index.js`, `serverless-http`.

### Singleton / cached Express app

- **What it is**: Reuses one Express instance across serverless warm invocations (when applicable).
- **Why here**: Avoid rebuilding middleware stack repeatedly.
- **How**: `cachedApp` in `buildApp`.
- **Where**: `server/lib/expressApp.js`.

### Trust proxy

- **What it is**: Express setting so `req.ip` respects `X-Forwarded-*` behind proxies.
- **Why here**: Correct client IP for rate limiting on Vercel/CDN (`app.set('trust proxy', 1)`).
- **Where**: `server/lib/expressApp.js`.

### WebSockets (Socket.IO)

- **What it is**: Real-time bidirectional events over WebSocket (with fallback transport in client library).
- **Why here**: Chat UX: broadcast `newMessage` to conversation room + `notification` to receiver.
- **How**: HTTP server wraps Express in `index.js`; `io.on('connection')` handles `join`, `joinConversation`, `sendMessage`; client connects with `io(socketURL)` in `ChatWindowPage.jsx`.
- **Where**: `server/index.js`; `client/src/pages/ChatWindowPage.jsx`.

### Dual persistence for chat

- **What it is**: Socket for push + REST for durability.
- **Why here**: README notes Vercel has no Socket.IO; HTTP `POST /api/chat/messages` persists regardless.
- **How**: Client emits Socket then posts `sendMessageHTTP`.
- **Where**: `server/controllers/chatController.js` (`sendMessageHTTP`), `ChatWindowPage.jsx`.

### Middleware pipeline & 404 handling

- **What it is**: Ordered stack ending with fallback 404 then error handler.
- **Why here**: JSON 404 vs uncaught exceptions.
- **How**: Anonymous 404 middleware; `errorHandler` last.
- **Where**: `server/lib/expressApp.js`.

### Environment-driven configuration

- **What it is**: Secrets and URLs via `process.env`.
- **Why here**: JWT secrets, Mongo URI, CORS origins, TTL for tokens; Vercel requires `MONGO_URI`.
- **Where**: `server/.env.example`, `server/db.js` (`getMongoUri`), `expressApp.js`, `authController.js`.

---

## 3. API inventory

Base path prefix: **`/api`**. Responses generally follow `{ success, data?, error?, code?, message?, details? }` (validators add `details` arrays on 400).

### Health

| Method | Route | Description | Auth | Request body | Response (typical) |
|--------|-------|-------------|------|--------------|---------------------|
| GET | `/health` | Liveness check | No | — | `{ success: true, message }` |

### Auth (`auth.js` → `authController.js`)

| Method | Route | Description | Auth | Request body | Response (typical) |
|--------|-------|-------------|------|--------------|---------------------|
| POST | `/auth/register` | Register user + empty profile | No | `name`, `email`, `password`, `confirmPassword`, `phone?` | 201 `{ success, message, data: { user, accessToken, refreshToken, isProfileComplete } }` |
| POST | `/auth/login` | Login | No | `email`, `password` | 200 `{ success, data: { user, accessToken, refreshToken, isProfileComplete } }` |
| GET | `/auth/me` | Current user from token | Bearer JWT | — | 200 `{ success, data: { user } }` |

### Profile (`profile.js` → `profileController.js`)

| Method | Route | Description | Auth | Request body | Response (typical) |
|--------|-------|-------------|------|--------------|---------------------|
| GET | `/profile/me` | Own profile | Bearer | — | `{ success, data: profile }` |
| PUT | `/profile/me` | Update preferences / location | Bearer | Optional: `preferredGames`, `skillLevel`, `availability`, `preferredLocations`, `location`, `bio` | `{ success, message, data: profile }` |
| GET | `/profile/:userId` | Public profile by user id | Bearer | — | `{ success, data: profile }` |

### Games (`games.js`)

| Method | Route | Description | Auth | Request body | Response (typical) |
|--------|-------|-------------|------|--------------|---------------------|
| GET | `/games` | Static catalog of games | No | — | `{ success, true, data: GAMES[] }` |

### Players (`players.js` → `playersController.js`)

| Method | Route | Description | Auth | Request body | Response (typical) |
|--------|-------|-------------|------|--------------|---------------------|
| GET | `/players/nearby` | Geo search for discoverable profiles | Bearer | Query: `lat`, `lng`, `radius?`, `game?`, `skillLevel?`, `page?`, `limit?` | `{ success, count, page, data }` |

### Play requests (`requests.js` → `requestsController.js`)

| Method | Route | Description | Auth | Request body | Response (typical) |
|--------|-------|-------------|------|--------------|---------------------|
| POST | `/requests` | Create play request | Bearer | `receiverId`, `gameId`, `proposedTime` (ISO8601), `location`, `locationNote?`, `message?` | 201 `{ success, message, data: playRequest }` |
| GET | `/requests/me` | Sent/received requests | Bearer | Query: `status?`, `type?` (`sent` \| `received`) | `{ success, count, data }` |
| GET | `/requests/history` | Past accepted matches (`proposedTime` < now) | Bearer | — | `{ success, count, data }` |
| PUT | `/requests/:id/accept` | Accept pending (receiver only) | Bearer | — | `{ success, message, data }` |
| PUT | `/requests/:id/decline` | Decline (receiver only) | Bearer | — | `{ success, message, data }` |
| PUT | `/requests/:id/cancel` | Cancel pending (sender only) | Bearer | — | `{ success, message, data }` |

### Communities (`communities.js` → `communitiesController.js`)

| Method | Route | Description | Auth | Request body | Response (typical) |
|--------|-------|-------------|------|--------------|---------------------|
| GET | `/communities` | Nearby communities | No | Query: `lat`, `lng`, `radius?`, `page?`, `limit?` | `{ success, count, data }` |
| POST | `/communities` | Create community | Bearer | `name`, `description?`, `area`, `location.coordinates` | 201 `{ success, message, data }` |
| GET | `/communities/:id` | Community detail | No | — | `{ success, data }` |
| POST | `/communities/:id/join` | Join as member | Bearer | — | `{ success, message }` |
| GET | `/communities/:id/posts` | List open-play posts | No | — | `{ success, count, data }` |
| POST | `/communities/:id/posts` | Create open-play post (member) | Bearer | `gameId`, `scheduledTime`, `location`, `maxParticipants` | 201 `{ success, message, data }` |
| POST | `/communities/posts/:id/join` | Join a post's session | Bearer | — | `{ success, message }` |

### Admin (`admin.js` → `adminController.js`)

All require **Bearer JWT** and **`role: admin`**.

| Method | Route | Description | Auth | Request body | Response (typical) |
|--------|-------|-------------|------|--------------|---------------------|
| GET | `/admin/stats` | Dashboard aggregates + signup chart | Admin | — | `{ success, data: { users, communities, requests, chartData } }` |
| GET | `/admin/users` | Paginated users | Admin | Query: `page?`, `limit?` | `{ success, count, total, totalPages, currentPage, data }` |
| PUT | `/admin/users/:id/status` | Toggle `isActive` | Admin | — | `{ success, message, data }` |
| GET | `/admin/communities` | All communities | Admin | — | `{ success, count, data }` |
| PUT | `/admin/communities/:id/verify` | Toggle `isVerified` | Admin | — | `{ success, message, data }` |

### Chat (`chat.js` → `chatController.js`)

All routes use **`router.use(verifyToken)`** — every method below needs **Bearer JWT**.

| Method | Route | Description | Auth | Request body | Response (typical) |
|--------|-------|-------------|------|--------------|---------------------|
| GET | `/chat/conversations` | User's conversations | Bearer | — | `{ success, count, data }` |
| POST | `/chat/conversations` | Get or create 1:1 conversation | Bearer | `receiverId`, `playRequestId?` | `{ success, data }` |
| GET | `/chat/conversations/:id/messages` | Messages + mark read | Bearer | Query: `limit?`, `skip?` | `{ success, count, data }` |
| POST | `/chat/messages` | Persist message (HTTP path) | Bearer | `conversationId`, `text` | 201 `{ success, data }` |

**Note:** `refreshToken` is returned on register/login but there is **no** `/auth/refresh` route; the SPA persists only `accessToken` in `AuthContext.jsx`.

---

## 4. Architecture diagram (text)

```
                                    ┌─────────────────────────────────────┐
                                    │  Browser (React + Vite + Tailwind)   │
                                    │  axios → VITE_API_URL (/api)         │
                                    │  socket.io-client (chat, local/long- │
                                    │  running API host only)              │
                                    └──────────────┬──────────────────────┘
                                                   │ HTTPS / WSS
                     ┌─────────────────────────────┴─────────────────────────────┐
                     │                    Express `buildApp()`                      │
                     │  helmet → morgan → cors → json/urlencoded                    │
                     │  rateLimit(/api) → rateLimit(/api/auth) → route mounts       │
                     │  404 JSON → errorHandler                                     │
                     └──────────────┬──────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        v                           v                           v
 ┌──────────────┐           ┌─────────────────┐           ┌──────────────────┐
 │ routes/*     │           │ Socket.IO       │           │ server/api/      │
 │ (REST)       │           │ (index.js only) │           │ index.js         │
 └──────┬───────┘           │ join,           │           │ serverless-http  │
        │                   │ joinConversation│           │ + connectMongo   │
        v                   │ sendMessage →   │           └────────┬─────────┘
 ┌──────────────┐           │ newMessage /    │                    │
 │ controllers/*│           │ notification    │                    │ same expressApp
 └──────┬───────┘           └────────┬────────┘                    │
        │                            │                             │
        v                            │ (no Socket on Vercel)       v
 ┌───────────────────────────────────┴──────────────────────────────────┐
 │                        Mongoose models                                 │
 │ User, Profile, PlayRequest, Community, OpenPlayPost,                   │
 │ Conversation, Message, Analytics                                       │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     v
                          ┌────────────────────┐
                          │   MongoDB          │
                          │   (Atlas / local)  │
                          └────────────────────┘

Auth flow (access JWT):
  [Login/Register] → authController.generateTokens → client stores accessToken
        → Authorization: Bearer … on API calls
        → verifyToken: jwt.verify + User.findById + isActive check → req.user

Admin flow:
  JWT with role admin → routes/admin.js: verifyToken + requireRole(['admin'])
```

---

## 5. Problem statement

- **Real-world problem**: People who want casual local sports (indoor/outdoor) lack a structured way to find compatible partners nearby, coordinate time/place, and optionally join community-organized sessions.
- **Target users**: Primary **players** seeking partners; **community organizers** (concept in `User.role` includes `organizer`, though admin is the only role enforced on dedicated routes today); **admins** for moderation and verification (`CONTEXT.md`, `README.md`).
- **Without this software**: Reliance on word of mouth, WhatsApp groups, society notice boards, or ad-hoc DMs—harder discovery, no unified profile/skill/availability matching, and weak visibility into "who's free near me."
- **Core value proposition**: LocalSports centralizes **profile-backed discovery** (games, skill, availability, area), **play requests** with accept/decline flow, **communities and open-play posts**, and **messaging** (real-time when the long-running server is used), so players can move from "looking" to "scheduled match" with less friction.

---

## 6. Authentication & authorization

- **Strategy**: **JWT bearer tokens** for API access; passwords stored as **bcrypt** hashes. **OAuth / sessions / API keys** are **not** implemented.
- **Token generation**: `jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })` and parallel refresh signing with `JWT_REFRESH_SECRET` in `generateTokens` (`authController.js`).
- **Client storage**: `localStorage` key `localsports_auth` holds JSON `{ accessToken, user, isProfileComplete }` (`AuthContext.jsx`). **Refresh token is not persisted or used by the client.**
- **Validation**: `verifyToken` reads `Authorization`, splits Bearer token, `jwt.verify` with `JWT_SECRET`, loads `User`, enforces existence and `isActive`, sets `req.user = decoded` (`middleware/auth.js`).
- **Roles**: `User.role` enum **`user` \| `organizer` \| `admin`** (`models/User.js`). Route enforcement today: **`admin`** via `requireRole(['admin'])` on `/api/admin/*`. **`organizer` is not used in middleware** beyond the schema default.
- **Middleware signatures (names + params only)**:
  - `verifyToken(req, res, next)`
  - `requireRole(roles)` → returns `(req, res, next)` where `roles` is `string[]`

---

## 7. Database design

- **Database**: **MongoDB** via **Mongoose** (`server/db.js`, models under `server/models/`).

### Collections / schemas (models)

| Model | Purpose | Notable fields |
|-------|---------|----------------|
| **User** | Credentials & account | `name`, `email` (unique), `phone`, `passwordHash`, `role`, `isActive`, timestamps |
| **Profile** | Play preferences & geo | `userId` (unique ref User), `preferredGames[]`, `skillLevel`, `availability.{days,slots}`, `preferredLocations[]`, `location` GeoJSON (`coordinates`, `area`), `bio`, `avatarUrl`, `isProfileComplete` |
| **PlayRequest** | 1:1 play invites | `senderId`, `receiverId`, `gameId`, `proposedTime`, `location`, `locationNote`, `message`, `status` |
| **Community** | Local groups | `name`, `description`, `area`, `location`, `createdBy`, `members[]`, `isVerified` |
| **OpenPlayPost** | Scheduled group sessions | `communityId`, `createdBy`, `gameId`, `scheduledTime`, `location`, `maxParticipants`, `participants[]`, `status` |
| **Conversation** | Chat threads | `participants[]`, `playRequestId?`, `lastMessage`, `updatedAt` (+ `createdAt`) |
| **Message** | Chat messages | `conversationId`, `senderId`, `text`, `readBy[]` |
| **Analytics** | Event stream | `event`, `userId?`, `metadata`, `createdAt` |

### Relationships (conceptual)

- **User ↔ Profile**: **1:1** (`Profile.userId` unique → `User`).
- **PlayRequest**: **many** between users (`senderId`, `receiverId` → User).
- **Community**: **many:many-ish** membership via `members[]` ObjectIds → User; **many:1** `createdBy` → User.
- **OpenPlayPost**: **many:1** `communityId` → Community; **many:many-style** participation via `participants[]`.
- **Conversation**: **2 participants** enforced in controllers (`$size: 2`), refs User; optional `playRequestId` → PlayRequest.
- **Message**: **many:1** `conversationId`; **many:1** `senderId` → User.
- **Analytics**: optional `userId` → User.

### Indexing / migrations / seeding

- **Declared in schemas**:  
  - `Profile`: `profileSchema.index({ location: '2dsphere' })`  
  - `Community`: `location` **2dsphere**  
  - `PlayRequest`: compound indexes `{ senderId, status }`, `{ receiverId, status }`  
  - `Conversation`: `{ participants: 1, updatedAt: -1 }`  
  - `Message`: `{ conversationId: 1, createdAt: 1 }`  
  - `OpenPlayPost`: `{ communityId: 1, status: 1 }`  
  - `Analytics`: indexes on `event`, `createdAt`
- **Migrations**: **No** formal migration tool (e.g. migrate-mongo); indexes live in Mongoose schemas / one-off `seedGames.js` `createIndex` call.
- **Seeding**: `seed_mock.js` (HTTP); `server/utils/seedGames.js` ensures `2dsphere` on profiles.

---

## 8. Error handling & logging

- **Global error handler**: `errorHandler` in `server/middleware/errorHandler.js`, registered last in `buildApp`. It handles errors passed as `next(err)` with shape `res.status(statusCode).json({ success: false, error: message, code })`.
- **Typical API errors**: Most controllers use **try/catch** and return JSON directly; **no `next(err)` usage** was found in routes/controllers, so the global handler is **wired but rarely triggered** by current code paths.
- **Client error shape**: Axios interceptor maps failures to `Error` using `error.response?.data?.error` or `message` (`client/src/lib/api.js`).
- **Validation errors**: 400 with `details: errors.array()` from `express-validator` where used (`authController`, `profileController`, etc.).
- **Logging**: `console.error` in controllers and `errorHandler`; **morgan** for HTTP logs; Vercel handler logs bootstrap failures (`server/api/index.js`). **No** Winston/Pino/Bunyan.
- **Custom error classes**: **None** found; errors use plain `Error` / status fields where applicable.

---

## 9. Security measures

| Measure | Implementation |
|---------|----------------|
| **Password hashing** | bcrypt salt rounds 12 on register; `comparePassword` on login |
| **JWT secrets** | `JWT_SECRET`, `JWT_REFRESH_SECRET` from env (fallback strings in code — should not be used in production) |
| **Auth on sensitive routes** | `verifyToken` on profile, players, requests, communities (mutations), all chat, all admin |
| **RBAC** | `requireRole(['admin'])` for admin routes |
| **Account state** | Deactivated users blocked at `verifyToken` and login |
| **CORS** | Restricted to `CLIENT_URL` list (comma-separated) with credentials |
| **Rate limiting** | Global `/api`, stricter `/api/auth`, per-minute on register/login |
| **Helmet** | Default security headers |
| **Input validation** | `express-validator` on major write endpoints |
| **NoSQL injection** | Mongoose typed queries; user input generally passed as values, not raw query operators from body |
| **Sensitive fields** | `User` `toJSON` strips `passwordHash`; `Profile` `toJSON` strips exact coordinates (keeps `area` only) |
| **Env for secrets** | `.env.example` documents secrets; `getMongoUri` throws on Vercel without `MONGO_URI` |
| **Trust proxy** | `trust proxy: 1` for correct IP behind reverse proxies |

Gaps / notes: **Refresh tokens are issued but not rotated or validated server-side**; **no CSRF** for SPA (typical for token-in-header APIs); **Socket.IO** in `index.js` has **no JWT handshake auth** in the snippet (rooms join by client-supplied ids).

---

## 10. Project structure

**Tree (~2 levels):**

```
localSports-main/
├── README.md                 # Setup, deployment, overview
├── CONTEXT.md               # Product/engineering context
├── seed_mock.js             # Seeds users via REST
├── client/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js / postcss.config.js
│   ├── vercel.json
│   └── src/
│       ├── main.jsx           # React entry
│       ├── App.jsx            # Routes
│       ├── index.css
│       ├── context/AuthContext.jsx
│       ├── lib/api.js        # Axios instance
│       ├── components/       # auth, layout, requests UI
│       └── pages/            # Feature pages + admin/*
└── server/
    ├── package.json
    ├── index.js              # Long-running server + Socket.IO + mongo connect
    ├── db.js                 # Mongo URI / connectMongo
    ├── Dockerfile
    ├── vercel.json
    ├── api/index.js           # Vercel serverless entry
    ├── lib/expressApp.js      # Express app factory
    ├── routes/               # REST routers
    ├── controllers/
    ├── models/
    ├── middleware/           # auth.js, errorHandler.js
    └── utils/                # analytics, seedGames
```

| Area | Purpose |
|------|---------|
| **`client/`** | SPA: pages per feature, `AuthContext` for JWT + routing guards, Axios API client, Tailwind UI. |
| **`client/src/pages/admin/`** | Admin dashboard, user list, community verification UI. |
| **`server/`** | REST API, Mongoose models, middleware, Socket.IO host for local/long-run deploys. |
| **`server/api/`** | Vercel-compatible handler wrapping the same Express app. |
| **`server/lib/expressApp.js`** | Single place for middleware, rate limits, route mounting, 404, error handler. |
| **`server/routes/`** | HTTP surface area only (thin). |
| **`server/controllers/`** | Business logic and response formatting. |
| **`server/models/`** | Schema definitions and indexes. |
| **`server/middleware/`** | JWT verification, RBAC, global error handler. |
| **`seed_mock.js`** | Optional dev data through public API. |
