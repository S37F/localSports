# .antigravity/rules.md
# AI Assistant Rules — Local Sports & Indoor Games Partner Finder Platform

> These rules govern how AI coding assistants (Cursor, GitHub Copilot, Claude, etc.) should reason, generate code, and make decisions for this project.

---

## 🧠 Project Identity

- **Project Name**: Local Sports & Indoor Games Partner Finder Platform
- **Type**: Community web application
- **Primary Goal**: Help users find nearby game partners for casual recreational play
- **Target Audience**: Residents of housing societies and neighborhoods; all age groups; initially focused on women's recreational participation
- **Current Phase**: See `CONTEXT.md` for active phase

---

## 🏗️ Architecture Rules

### Stack
- **Frontend**: React.js (or Next.js for SSR), Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (preferred) or PostgreSQL
- **Auth**: JWT with bcrypt password hashing
- **APIs**: RESTful; follow resource-based naming

### File Organization
- Follow the folder structure defined in `CONTEXT.md`
- Keep components small and single-responsibility
- Business logic belongs in **controllers**, not routes
- DB queries belong in **models/services**, not controllers

---

## ✅ Code Standards

### General
- Use **ES6+** syntax (async/await, destructuring, arrow functions)
- Always handle errors — no silent failures, no empty catch blocks
- Use **environment variables** for all secrets and config (never hardcode)
- Write **meaningful variable/function names** — no `x`, `tmp`, `data2`

### Frontend
- Components must be **functional** (no class components)
- Use **React hooks** for state and effects
- Forms: always validate on client AND server
- Accessibility: use semantic HTML, proper ARIA roles, keyboard navigation
- Mobile-first responsive design — every screen must work on 375px width
- Avoid inline styles; use Tailwind utility classes

### Backend
- Every route must have **authentication middleware** unless explicitly public
- Validate all incoming request bodies (use `joi` or `express-validator`)
- Return consistent response shapes:
  ```json
  { "success": true, "data": {}, "message": "..." }
  { "success": false, "error": "...", "code": 400 }
  ```
- Use HTTP status codes correctly (200, 201, 400, 401, 403, 404, 500)

### Database
- Always index fields used in search (especially `location`, `userId`)
- Never store plain-text passwords
- Use **geospatial index** on location fields
- Paginate all list endpoints — default page size: 20

---

## 🚫 Never Do This

- ❌ Do NOT hardcode API keys, JWT secrets, or DB connection strings
- ❌ Do NOT skip input validation on any endpoint
- ❌ Do NOT return passwords or sensitive fields in API responses
- ❌ Do NOT use `var` — only `const` and `let`
- ❌ Do NOT build out-of-scope features (tournaments, native apps, real-time chat) in Phase 1
- ❌ Do NOT break existing working functionality when adding new features
- ❌ Do NOT use synchronous file I/O or blocking operations in the server

---

## 🌍 Location & Matching Rules

- Nearby player search radius: **default 5 km**, user-configurable
- Location stored as `{ lat: Number, lng: Number, area: String }`
- Use MongoDB `$near` / `$geoWithin` or PostGIS for geo queries
- Never expose a user's exact GPS coordinates in the API response — return area/locality only

---

## 🔐 Security Rules

- All protected routes check `Authorization: Bearer <token>` header
- Roles: `user` | `organizer` | `admin` — enforce in middleware
- Rate-limit auth endpoints (login, register): max 10 req/min per IP
- Sanitize all user inputs to prevent XSS and injection attacks
- CORS: allow only whitelisted origins in production

---

## 🎨 UI/UX Rules

- Color palette: use the design system defined in `client/styles/variables.css`
- Font: clean, readable — suitable for ages 25–65
- Primary action always prominent (e.g., "Find Players" CTA)
- Loading states: always show skeleton/spinner when data is fetching
- Empty states: never show a blank screen — always show an empty state message with CTA
- Error states: show user-friendly messages, not raw error strings
- Match cards must show: Name, Game, Skill Level, Availability snippet, Location area, "Send Request" button

---

## 📋 Feature Flags

Use `CONTEXT.md` phase definitions to gate features:

| Feature | Phase | Status |
|---------|-------|--------|
| Registration & Login | 1 | ✅ Build |
| User Profiles | 1 | ✅ Build |
| Nearby Player Search | 1 | ✅ Build |
| Play Requests | 2 | ⏳ Next |
| Match History | 2 | ⏳ Next |
| Community Groups | 3 | 🔒 Later |
| Admin Dashboard | 4 | 🔒 Later |
| Notifications | 5 | 🔒 Later |
| Real-time Chat | Post-MVP | ❌ Out of Scope Phase 1 |

---

## 🧪 Testing Rules

- Write unit tests for all utility functions (matchmaking logic, geo calculations)
- Write integration tests for all API routes
- Test auth flows: register, login, token expiry, unauthorized access
- Manually test on mobile viewport (375px) before marking any UI task done

---

## 📝 When Generating Code

1. **Read `CONTEXT.md` first** to understand entities, APIs, and current phase
2. Always ask: "Does this feature belong to the current phase?"
3. Generate complete, runnable code — no TODOs for critical paths
4. Add JSDoc comments for all exported functions
5. If creating a new API route, update the API surface table in `CONTEXT.md`
6. If creating a new component, place it in the correct subfolder per structure in `CONTEXT.md`

---

## 💬 Communication Style (for AI responses)

- Be concise and implementation-focused
- When suggesting multiple approaches, always recommend one clearly
- Flag if a request is out of scope for the current phase
- If something requires a schema change, call it out explicitly
- Prefer working, simple code over clever, complex abstractions
