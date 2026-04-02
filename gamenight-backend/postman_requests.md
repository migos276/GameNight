# GameNight API - Postman/Curl Requests

Base URL: `http://localhost:3000/api`

## Notes
- **Authentication**: Login/register sets JWT cookie. Use cookies for protected routes (Events, Games, /auth/me).
- **IDs**: Use fake UUIDs; replace with real ones from responses:
  - `eventId`: `550e8400-e29b-41d4-a716-446655440001`
  - `gameId`: `550e8400-e29b-41d4-a716-446655440002`
- **Headers**: `Content-Type: application/json` for POST/PUT.
- Run server: `npm run dev`

## 1. Health Check (Public)
### GET /api/health
**Postman**: GET `{{base_url}}/health`

**Curl**:
```bash
curl -X GET http://localhost:3000/api/health
```

Expected: `{ \"status\": \"ok\", \"timestamp\": \"...\" }`

## 2. Auth Routes (Public except /me)

### POST /api/auth/register
**Body**:
```json
{
  \"name\": \"John Doe\",
  \"email\": \"john@example.com\",
  \"password\": \"password123456\"
}
```

**Postman**: POST `{{base_url}}/auth/register`, JSON body above.

**Curl**:
```bash
curl -X POST http://localhost:3000/api/auth/register \\
  -H \"Content-Type: application/json\" \\
  -d '{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123456\"}'
```

### POST /api/auth/login
**Body**:
```json
{
  \"email\": \"john@example.com\",
  \"password\": \"password123456\"
}
```

**Postman**: POST `{{base_url}}/auth/login`, JSON body. (Save cookies!)

**Curl** (save cookie):
```bash
curl -X POST http://localhost:3000/api/auth/login \\
  -H \"Content-Type: application/json\" \\
  -c cookies.txt \\
  -d '{\"email\":\"john@example.com\",\"password\":\"password123456\"}'
```

### POST /api/auth/refresh
**Postman**: POST `{{base_url}}/auth/refresh`, Cookies.

**Curl**:
```bash
curl -X POST http://localhost:3000/api/auth/refresh \\
  -b cookies.txt
```

### POST /api/auth/logout
**Postman**: POST `{{base_url}}/auth/logout`, Cookies.

**Curl**:
```bash
curl -X POST http://localhost:3000/api/auth/logout \\
  -b cookies.txt
```

### GET /api/auth/me (Protected)
**Postman**: GET `{{base_url}}/auth/me`, Cookies.

**Curl**:
```bash
curl -X GET http://localhost:3000/api/auth/me \\
  -b cookies.txt
```

## 3. Events Routes (All Protected - use cookies from login)

### GET /api/events (List)
**Postman**: GET `{{base_url}}/events`, Cookies.

**Curl**:
```bash
curl -X GET http://localhost:3000/api/events \\
  -b cookies.txt
```

### POST /api/events (Create)
**Body**:
```json
{
  \"title\": \"Game Night #1\",
  \"description\": \"Board games evening\",
  \"date\": \"2024-12-31T20:00:00Z\",
  \"location\": \"Paris, Cafe ABC\",
  \"maxParticipants\": 8
}
```

**Postman/Curl**:
```bash
curl -X POST http://localhost:3000/api/events \\
  -H \"Content-Type: application/json\" \\
  -b cookies.txt \\
  -d '{\"title\":\"Game Night #1\",\"description\":\"Board games evening\",\"date\":\"2024-12-31T20:00:00Z\",\"location\":\"Paris, Cafe ABC\",\"maxParticipants\":8}'
```

### GET /api/events/:id
**Postman**: GET `{{base_url}}/events/{{eventId}}`, Cookies.

**Curl**:
```bash
curl -X GET \"http://localhost:3000/api/events/550e8400-e29b-41d4-a716-446655440001\" \\
  -b cookies.txt
```

### PUT /api/events/:id (Update)
**Body**: Like create.

**Curl**:
```bash
curl -X PUT \"http://localhost:3000/api/events/550e8400-e29b-41d4-a716-446655440001\" \\
  -H \"Content-Type: application/json\" \\
  -b cookies.txt \\
  -d '{\"title\":\"Updated Game Night\"}'
```

### DELETE /api/events/:id
**Postman**: DELETE `{{base_url}}/events/{{eventId}}`, Cookies.

**Curl**:
```bash
curl -X DELETE \"http://localhost:3000/api/events/550e8400-e29b-41d4-a716-446655440001\" \\
  -b cookies.txt
```

### POST /api/events/:id/join
**Postman**: POST `{{base_url}}/events/{{eventId}}/join`, Cookies.

**Curl**:
```bash
curl -X POST \"http://localhost:3000/api/events/550e8400-e29b-41d4-a716-446655440001/join\" \\
  -b cookies.txt
```

### POST /api/events/:id/leave
**Postman**: POST `{{base_url}}/events/{{eventId}}/leave`, Cookies.

**Curl**:
```bash
curl -X POST \"http://localhost:3000/api/events/550e8400-e29b-41d4-a716-446655440001/leave\" \\
  -b cookies.txt
```

### POST /api/events/:id/confirm
**Postman**: POST `{{base_url}}/events/{{eventId}}/confirm`, Cookies.

**Curl**:
```bash
curl -X POST \"http://localhost:3000/api/events/550e8400-e29b-41d4-a716-446655440001/confirm\" \\
  -b cookies.txt
```

### POST /api/events/:id/games (Propose Game)
**Body**:
```json
{
  \"name\": \"Monopoly\"
}
```

**Postman/Curl**:
```bash
curl -X POST \"http://localhost:3000/api/events/550e8400-e29b-41d4-a716-446655440001/games\" \\
  -H \"Content-Type: application/json\" \\
  -b cookies.txt \\
  -d '{\"name\":\"Monopoly\"}'
```

## 4. Games Routes (Protected)

### POST /api/games/:gameId/vote
**Postman**: POST `{{base_url}}/games/{{gameId}}/vote`, Cookies.

**Curl**:
```bash
curl -X POST \"http://localhost:3000/api/games/550e8400-e29b-41d4-a716-446655440002/vote\" \\
  -b cookies.txt
```

### DELETE /api/games/:gameId/vote
**Postman**: DELETE `{{base_url}}/games/{{gameId}}/vote`, Cookies.

**Curl**:
```bash
curl -X DELETE \"http://localhost:3000/api/games/550e8400-e29b-41d4-a716-446655440002/vote\" \\
  -b cookies.txt
```

## Testing Flow
1. Start server (`npm run dev`).
2. Register/Login (save cookies.txt).
3. Test Health.
4. Create Event → note eventId.
5. Test other events/games with real IDs.
6. Logout.

Swagger docs: http://localhost:3000/api/docs

