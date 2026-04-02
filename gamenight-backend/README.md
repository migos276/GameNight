# 🎲 GameNight API

REST API for organizing board game nights with friends. Built with Node.js, Express, TypeScript, PostgreSQL and Prisma.

---

## 🚀 Tech Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Runtime        | Node.js + TypeScript              |
| Framework      | Express.js                        |
| Database       | PostgreSQL + Prisma ORM           |
| Auth           | JWT (httpOnly cookies)            |
| Validation     | Zod                               |
| Documentation  | Swagger / OpenAPI 3.0             |

---

## 📦 Installation

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14

### Steps

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd gamenight-backend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your values

# 4. Run database migrations
npm run migrate

# 5. Start development server
npm run dev
```

---

## 🔐 Environment Variables

| Variable              | Description                          | Example                          |
|-----------------------|--------------------------------------|----------------------------------|
| `DATABASE_URL`        | PostgreSQL connection string         | `postgresql://user:pass@localhost:5432/gamenight` |
| `PORT`                | Server port                          | `3000`                           |
| `NODE_ENV`            | Environment                          | `development`                    |
| `JWT_ACCESS_SECRET`   | Secret for access tokens             | `a_long_random_string`           |
| `JWT_REFRESH_SECRET`  | Secret for refresh tokens            | `another_long_random_string`     |
| `CORS_ORIGIN`         | Allowed frontend origin              | `http://localhost:5173`          |

---

## 📜 Available Scripts

| Script            | Description                          |
|-------------------|--------------------------------------|
| `npm run dev`     | Start dev server with hot-reload     |
| `npm run build`   | Compile TypeScript to JavaScript     |
| `npm start`       | Start production server              |
| `npm run migrate` | Run Prisma migrations (dev)          |
| `npm run migrate:prod` | Run Prisma migrations (prod)    |
| `npm run generate`| Regenerate Prisma client             |
| `npm run studio`  | Open Prisma Studio                   |

---

## 📚 API Documentation

Swagger UI is available at: `http://localhost:3000/api/docs`

Raw OpenAPI JSON: `http://localhost:3000/api/docs.json`

---

## 🗺️ API Endpoints

### Auth
| Method | Endpoint              | Description               | Auth Required |
|--------|-----------------------|---------------------------|---------------|
| POST   | `/api/auth/register`  | Register a new user       | ❌            |
| POST   | `/api/auth/login`     | Login                     | ❌            |
| POST   | `/api/auth/refresh`   | Refresh access token      | ❌ (cookie)   |
| POST   | `/api/auth/logout`    | Logout                    | ❌            |
| GET    | `/api/auth/me`        | Get current user profile  | ✅            |

### Events
| Method | Endpoint                    | Description                          | Auth |
|--------|-----------------------------|--------------------------------------|------|
| GET    | `/api/events`               | List all events                      | ✅   |
| POST   | `/api/events`               | Create an event                      | ✅   |
| GET    | `/api/events/:id`           | Get event details                    | ✅   |
| PUT    | `/api/events/:id`           | Update event (host only)             | ✅   |
| DELETE | `/api/events/:id`           | Delete event (host only)             | ✅   |
| POST   | `/api/events/:id/join`      | Join an event                        | ✅   |
| POST   | `/api/events/:id/leave`     | Leave an event                       | ✅   |
| POST   | `/api/events/:id/confirm`   | Confirm event & pick winner (host)   | ✅   |
| POST   | `/api/events/:id/games`     | Propose a game for the event         | ✅   |

### Games & Votes
| Method | Endpoint                    | Description            | Auth |
|--------|-----------------------------|------------------------|------|
| POST   | `/api/games/:gameId/vote`   | Vote for a game        | ✅   |
| DELETE | `/api/games/:gameId/vote`   | Remove your vote       | ✅   |

---

## 🗄️ Data Model

```
User ──< hostedEvents (Event)
User ──< EventMember >── Event
User ──< GameProposal >── Event
User ──< Vote >── GameProposal
Event ──> winningGame (GameProposal)
```

---

## ✅ What's implemented

- [x] Full JWT authentication with httpOnly cookies (access + refresh tokens)
- [x] User registration and login with bcrypt password hashing
- [x] Token refresh and logout with refresh token invalidation
- [x] Full CRUD for events with host-only permissions
- [x] Join / Leave events with capacity enforcement
- [x] Event confirmation with automatic winning game calculation
- [x] Game proposals per event
- [x] Vote / unvote for game proposals (one vote per user per game)
- [x] Centralized error handling with proper HTTP status codes
- [x] Zod validation on all incoming requests
- [x] Swagger/OpenAPI documentation
- [x] Prisma schema with all relations and unique constraints

## ❌ Not yet implemented

- [ ] Pagination on event list
- [ ] Email notifications
- [ ] Event cancellation endpoint
- [ ] Admin role / admin endpoints
- [ ] Rate limiting
- [ ] Unit / integration tests

---

## 🧠 Technical Choices

- **Prisma over TypeORM**: Better DX, type-safe queries, and cleaner migrations
- **httpOnly cookies**: Protects tokens from XSS attacks (no localStorage)
- **Zod**: Lightweight, TypeScript-native validation with great error messages
- **Modular architecture**: Each domain (auth, events, games) has its own controller/service/routes/schema for clean separation of concerns
- **AppError class**: Standardized error handling that flows through Express's error middleware
