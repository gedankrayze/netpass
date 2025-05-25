# NetPass API

A user management and authentication API built with Bun, TypeScript, and ArangoDB.

## Features

- User registration with email and username
- Secure password hashing using bcrypt
- JWT-like token-based authentication
- Session management
- User profile endpoints with update capabilities
- Password change functionality
- Account deletion
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

## Environment Variables

The following environment variables can be configured:

- `DATABASE_URL` - ArangoDB connection URL (default: http://localhost:8529)
- `DATABASE_NAME` - Database name (default: netpass)
- `DATABASE_USER` - Database username (default: root)
- `DATABASE_PASSWORD` - Database password
- `JWT_TTL_DAYS` - JWT token expiration time in days (default: 7)
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
  -e DATABASE_URL=http://host.docker.internal:8529 \
  -e DATABASE_NAME=netpass \
  -e DATABASE_USER=root \
  -e DATABASE_PASSWORD=yourpassword \
  -e JWT_TTL_DAYS=7 \
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
      - DATABASE_URL=http://arangodb:8529
      - DATABASE_NAME=netpass
      - DATABASE_USER=root
      - DATABASE_PASSWORD=yourpassword
      - JWT_TTL_DAYS=7
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

## Project Structure

```
src/
├── config/         # Database and app configuration
├── middleware/     # Authentication and other middleware
├── models/         # Data models and schemas
├── routes/         # API route handlers
├── scripts/        # Utility scripts
├── services/       # Business logic
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Security Features

- Password requirements: minimum 8 characters, uppercase, lowercase, and numbers
- Secure password hashing with bcrypt
- Token-based authentication
- Session expiration (configurable via JWT_TTL_DAYS environment variable)
- Comprehensive input validation using Zod
- Detailed validation error messages
- Protection against common security vulnerabilities

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