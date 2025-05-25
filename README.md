# NetPass API

A user management and authentication API built with Bun, TypeScript, and ArangoDB.

## Features

- User registration with email and username
- Secure password hashing using bcrypt
- JWT-like token-based authentication
- Session management
- User profile endpoints with update capabilities
- Custom user preferences storage
- Password change functionality
- Account deletion
- CORS support for cross-origin requests
- Input validation using Zod schemas
- Detailed validation error messages
- RESTful API design

## Prerequisites

- Bun (latest version)
- ArangoDB
- Task (for running development pipelines)
- Hurl (for API testing)

## Installation

1. Install dependencies:
```bash
bun install
```

2. Copy the environment variables:
```bash
cp .env.example .env
```

3. Configure your ArangoDB connection in `.env`

4. Initialize the database:
```bash
task db:init
```

This will:
- Create the necessary collections (users, sessions)
- Set up unique indexes on email and username fields
- Add performance indexes for tokens and sessions

## Environment Variables

The following environment variables can be configured:

- `ARANGO_URL` - ArangoDB connection URL (default: http://localhost:8529)
- `ARANGO_DB` - Database name (default: netpass)
- `ARANGO_USERNAME` - Database username (default: root)
- `ARANGO_PASSWORD` - Database password
- `JWT_TTL_DAYS` - JWT token expiration time in days (default: 7)
- `ALLOW_SIGNUP` - Enable/disable new user registration (default: false, set to "true" to enable)
- `CORS_ORIGINS` - Comma-separated list of allowed origins for CORS, or * for all (default: *)
- `PORT` - Server port (default: 3000)

## Development

Run the development server with auto-reload:
```bash
task dev
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login with username/email and password
- `POST /api/auth/logout` - Logout (requires authentication)

### User

- `GET /api/users/profile` - Get current user profile (requires authentication)
- `PATCH /api/users/profile` - Update user profile (requires authentication)
- `POST /api/users/change-password` - Change password (requires authentication)
- `DELETE /api/users/delete` - Delete user account (requires authentication)

### Health Check

- `GET /` - API welcome message
- `GET /version` - API version information

## Testing

This application uses Hurl for testing the API endpoints.

Run all API tests:
```bash
task test
```

Run specific test suites:
```bash
task test:auth    # Authentication tests
task test:user    # User endpoint tests
```

## Building

Build for production:
```bash
task build
```

## Docker

### Building the Docker image

```bash
docker build -t netpass-api .
```

### Running with Docker

```bash
docker run -d \
  --name netpass \
  -p 3000:3000 \
  -e ARANGO_URL=http://host.docker.internal:8529 \
  -e ARANGO_DB=netpass \
  -e ARANGO_USERNAME=root \
  -e ARANGO_PASSWORD=yourpassword \
  -e JWT_TTL_DAYS=7 \
  -e ALLOW_SIGNUP=true \
  -e CORS_ORIGINS=* \
  netpass-api
```

### Using Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - ARANGO_URL=http://arangodb:8529
      - ARANGO_DB=netpass
      - ARANGO_USERNAME=root
      - ARANGO_PASSWORD=yourpassword
      - JWT_TTL_DAYS=7
      - ALLOW_SIGNUP=true
      - CORS_ORIGINS=*
    depends_on:
      - arangodb

  arangodb:
    image: arangodb:latest
    ports:
      - "8529:8529"
    environment:
      - ARANGO_ROOT_PASSWORD=yourpassword
    volumes:
      - arangodb_data:/var/lib/arangodb3

volumes:
  arangodb_data:
```

Then run:
```bash
docker-compose up -d
```

## Utility Scripts

- `bun run src/scripts/init-db.ts` - Initialize database collections and indexes
- `bun run src/scripts/check-db.ts` - Check database connection
- `bun run src/scripts/add-indexes.ts` - Add database indexes (if needed)
- `bun run src/scripts/clear-test-data.ts` - Clear test users from database
- `bun run src/scripts/cleanup-sessions.ts` - Remove expired sessions from database

## Project Structure

```
src/
├── config/         # Database and app configuration
├── middleware/     # Authentication and CORS middleware
├── models/         # Data models and schemas
├── routes/         # API route handlers
├── scripts/        # Utility scripts
├── services/       # Business logic
├── types/          # TypeScript type definitions
└── utils/          # Utility functions

foxx-services/
└── session-cleanup/  # ArangoDB Foxx service for scheduled session cleanup
```

## Security Features

- Password requirements: minimum 8 characters, uppercase, lowercase, and numbers
- Secure password hashing with bcrypt
- Token-based authentication
- Session expiration (configurable via JWT_TTL_DAYS environment variable)
- Automatic session cleanup (opportunistic during login + manual script)
- Unique constraints on email and username (enforced at database level)
- Comprehensive input validation using Zod
- Detailed validation error messages
- Protection against common security vulnerabilities
- CORS configuration for secure cross-origin requests

## Session Management

NetPass handles expired sessions in three ways:

1. **Opportunistic Cleanup**: During login requests, there's a 10% chance of triggering background cleanup of expired sessions
2. **Manual Cleanup**: Run `bun run src/scripts/cleanup-sessions.ts` to remove all expired sessions
3. **ArangoDB Foxx Service**: Deploy the included Foxx service for automatic scheduled cleanup

### Using ArangoDB Scheduled Tasks (Recommended)

The recommended approach for production is to use the included Foxx service:

```bash
# Navigate to the Foxx service directory
cd foxx-services/session-cleanup

# Create a zip file
zip -r ../session-cleanup.zip .

# Install via ArangoDB Web UI or CLI
# Via CLI:
foxx install /netpass/session-cleanup ./session-cleanup.zip --database=netpass
```

The Foxx service automatically schedules hourly cleanup and provides endpoints for:
- Manual cleanup trigger: `POST /netpass/session-cleanup/cleanup`
- Session statistics: `GET /netpass/session-cleanup/status`
- Schedule management: `POST/DELETE /netpass/session-cleanup/schedule`

## Example API Usage

### Sign Up
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "SecurePass123"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```