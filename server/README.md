# ZoneSafe API Server

Backend API for ZoneSafe - MUTCD Safety Plan Generation Application

## Overview

Express.js + TypeScript + MySQL backend providing:
- Google OAuth authentication
- CRUD operations for safety plans
- User management
- Activity logging
- API usage tracking

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MySQL 8.0+
- **Authentication:** JWT + Google OAuth
- **Security:** Helmet, CORS, Compression

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+
- Google OAuth credentials

### Installation

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Create database and run schema**
   ```bash
   mysql -u root -p < schema.sql
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

## Environment Variables

See `.env.example` for required environment variables:

- **PORT**: Server port (default: 5000)
- **DB_***: MySQL connection details
- **JWT_SECRET**: Secret for JWT token signing
- **GOOGLE_OAUTH_CLIENT_ID**: Google OAuth client ID
- **API Keys**: OpenAI, Anthropic, HERE Maps, Google Roads, OpenWeather

## Database Schema

The database includes 7 tables:
- **users** - User accounts
- **plans** - Safety plans
- **location_cache** - Cached API responses
- **activity_log** - User activity tracking
- **sessions** - JWT session management
- **api_usage** - API usage metrics
- **email_queue** - Email sending queue

See `schema.sql` for complete schema.

## API Routes

### Authentication (`/api/auth`)

- `POST /google` - Authenticate with Google OAuth
- `POST /logout` - Logout user
- `GET /me` - Get current user info

### Plans (`/api/plans`)

- `GET /` - Get all plans for user (auth required)
- `GET /:id` - Get single plan
- `POST /` - Create new plan (auth required)
- `PUT /:id` - Update plan (auth required)
- `DELETE /:id` - Delete plan (auth required)
- `POST /:id/export` - Export plan as PDF

### Users (`/api/users`)

- `GET /me` - Get user profile (auth required)
- `GET /stats` - Get user statistics (auth required)

## Authentication

### JWT Tokens

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Google OAuth Flow

1. Frontend obtains Google ID token
2. POST to `/api/auth/google` with credential
3. Backend verifies token and creates/updates user
4. Returns JWT token for subsequent requests

## Development

### Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests

### Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.ts        # MySQL connection pool
│   ├── middleware/
│   │   └── auth.ts            # JWT authentication
│   ├── routes/
│   │   ├── auth.ts            # Authentication routes
│   │   ├── plans.ts           # Plan CRUD routes
│   │   └── users.ts           # User routes
│   ├── controllers/           # Business logic (future)
│   ├── models/                # Data models (future)
│   ├── utils/                 # Utility functions (future)
│   └── index.ts               # Server entry point
├── tests/                     # Test files
├── schema.sql                 # Database schema
├── package.json
├── tsconfig.json
└── .env.example
```

## Security Features

- **Helmet**: Security headers
- **CORS**: Restricted to frontend URL
- **JWT**: Token-based authentication
- **SQL Injection**: Prepared statements with mysql2
- **Rate Limiting**: Coming soon
- **Input Validation**: Coming soon

## Future Enhancements

- [ ] Rate limiting middleware
- [ ] Input validation with express-validator
- [ ] Email service integration
- [ ] PDF generation service
- [ ] External API integrations (OpenAI, HERE Maps, etc.)
- [ ] WebSocket support for real-time updates
- [ ] Comprehensive test coverage
- [ ] API documentation (Swagger/OpenAPI)

## Troubleshooting

### Database Connection Issues

- Verify MySQL is running: `mysql -u root -p`
- Check credentials in `.env`
- Ensure database exists: `SHOW DATABASES;`

### Authentication Issues

- Verify `JWT_SECRET` is set in `.env`
- Check Google OAuth credentials
- Ensure frontend URL matches CORS settings

## License

Proprietary - All rights reserved
