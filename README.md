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
- Session expiration (7 days by default)
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