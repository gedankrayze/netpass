# Test user signup
POST http://localhost:3000/api/auth/signup
Content-Type: application/json
{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test1234!",
    "firstName": "Test",
    "lastName": "User"
}

HTTP 201
[Asserts]
jsonpath "$.user.email" == "test@example.com"
jsonpath "$.user.username" == "testuser"
jsonpath "$.token" exists

[Captures]
token: jsonpath "$.token"

# Test duplicate email
POST http://localhost:3000/api/auth/signup
Content-Type: application/json
{
    "email": "test@example.com",
    "username": "anotheruser",
    "password": "Test1234!"
}

HTTP 409
[Asserts]
jsonpath "$.error" contains "Email already registered"

# Test duplicate username
POST http://localhost:3000/api/auth/signup
Content-Type: application/json
{
    "email": "different@example.com",
    "username": "testuser",
    "password": "Test1234!",
    "firstName": "Different",
    "lastName": "User"
}

HTTP 409
[Asserts]
jsonpath "$.error" contains "Username already taken"

# Test invalid email format
POST http://localhost:3000/api/auth/signup
Content-Type: application/json
{
    "email": "invalid-email",
    "username": "validuser",
    "password": "Test1234!"
}

HTTP 400
[Asserts]
jsonpath "$.message" == "Validation failed"
jsonpath "$.errors.email[0]" == "Invalid email format"

# Test weak password
POST http://localhost:3000/api/auth/signup
Content-Type: application/json
{
    "email": "test2@example.com",
    "username": "validuser",
    "password": "weak"
}

HTTP 400
[Asserts]
jsonpath "$.message" == "Validation failed"
jsonpath "$.errors.password" exists

# Test invalid username
POST http://localhost:3000/api/auth/signup
Content-Type: application/json
{
    "email": "test3@example.com",
    "username": "u",
    "password": "Test1234!"
}

HTTP 400
[Asserts]
jsonpath "$.message" == "Validation failed"
jsonpath "$.errors.username[0]" contains "at least 3 characters"

# Test user login with username
POST http://localhost:3000/api/auth/login
Content-Type: application/json
{
    "username": "testuser",
    "password": "Test1234!"
}

HTTP 200
[Asserts]
jsonpath "$.user.username" == "testuser"
jsonpath "$.token" exists

[Captures]
login_token: jsonpath "$.token"

# Test user login with email
POST http://localhost:3000/api/auth/login
Content-Type: application/json
{
    "username": "test@example.com",
    "password": "Test1234!"
}

HTTP 200
[Asserts]
jsonpath "$.user.email" == "test@example.com"

# Test invalid credentials
POST http://localhost:3000/api/auth/login
Content-Type: application/json
{
    "username": "testuser",
    "password": "wrongpassword"
}

HTTP 401
[Asserts]
jsonpath "$.error" == "Invalid credentials"

# Test logout
POST http://localhost:3000/api/auth/logout
Authorization: Bearer {{login_token}}

HTTP 200
[Asserts]
jsonpath "$.message" == "Logged out successfully"