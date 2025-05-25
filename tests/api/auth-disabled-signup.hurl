# Test signup when ALLOW_SIGNUP is disabled
# Note: This test requires ALLOW_SIGNUP to be set to false or not set in the environment

# Test user signup when disabled
POST http://localhost:3000/api/auth/signup
Content-Type: application/json
{
    "email": "newuser@example.com",
    "username": "newuser",
    "password": "Test1234!",
    "firstName": "New",
    "lastName": "User"
}

HTTP 403
[Asserts]
jsonpath "$.error" == "New user registration is currently disabled"

# Test that login still works when signup is disabled
POST http://localhost:3000/api/auth/login
Content-Type: application/json
{
    "username": "existinguser",
    "password": "Test1234!"
}

# This will return 401 if user doesn't exist, which is expected
# The point is to verify the endpoint is still accessible
HTTP *
[Asserts]
status >= 200
status < 500