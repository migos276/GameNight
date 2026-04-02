# Game Night Frontend

A modern React + Vite frontend for managing game night events with friends.

## Features

- User authentication (login/register)
- Browse upcoming events
- Create new game night events
- Join/leave events
- Propose games and vote on them
- Event confirmation with winning game selection
- Dashboard to manage your events
- Responsive design for mobile and desktop

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Zustand** - State management
- **Axios** - HTTP client with interceptors
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Tailwind CSS** - Styling

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running on http://localhost:3000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file:
```bash
cp .env.example .env.local
```

3. Update the API URL if needed:
```
VITE_API_URL=http://localhost:3000/api
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Header.tsx
│   ├── LoadingSpinner.tsx
│   └── ErrorAlert.tsx
├── pages/              # Page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── HomePage.tsx
│   ├── DashboardPage.tsx
│   ├── CreateEventPage.tsx
│   └── EventDetailPage.tsx
├── store/             # Zustand stores
│   ├── authStore.ts
│   └── eventsStore.ts
├── services/          # API services
│   └── api.ts
├── App.tsx            # Main app with routing
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## Key Features Explained

### Authentication
- Uses JWT tokens stored in localStorage
- Automatic token refresh on 401 responses
- Protected routes for authenticated users only

### Event Management
- Create events with title, description, date, and participant limit
- Join/leave events
- Event hosts can confirm events and select winning games

### Game Voting
- Propose games for each event
- Vote on your favorite games
- Automatic winner selection when event is confirmed
- Vote counts displayed in real-time

### Responsive Design
- Mobile-first approach
- Tailwind CSS for responsive styling
- Adapts from mobile to desktop layouts

## API Integration

The frontend communicates with the backend API at `/api` endpoint. Key endpoints:

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh
- `GET /auth/me` - Get current user
- `GET /events` - List all events
- `POST /events` - Create event
- `GET /events/:id` - Get event details
- `POST /events/:id/join` - Join event
- `POST /events/:id/leave` - Leave event
- `POST /events/:id/confirm` - Confirm event
- `POST /events/:id/games` - Propose game
- `POST /games/:gameId/vote` - Vote for game
- `DELETE /games/:gameId/vote` - Remove vote

## Error Handling

- Clear error messages displayed to users
- Form validation with field-level error feedback
- Loading states during API calls
- Automatic redirect to login on authentication failure

## Development Notes

- State management uses Zustand for simplicity and performance
- Form validation uses React Hook Form + Zod
- API calls are intercepted to handle token management automatically
- Components are functional with React hooks
- TypeScript ensures type safety throughout

## License

MIT
