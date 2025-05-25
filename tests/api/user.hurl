# First login to get a token
POST http://localhost:3000/api/auth/login
Content-Type: application/json
{
    "username": "testuser",
    "password": "Test1234!"
}

HTTP 200
[Captures]
token: jsonpath "$.token"

# Test get user profile with valid token
GET http://localhost:3000/api/users/profile
Authorization: Bearer {{token}}

HTTP 200
[Asserts]
jsonpath "$.username" == "testuser"
jsonpath "$.email" == "test@example.com"
jsonpath "$.password" not exists

# Test get user profile without token
GET http://localhost:3000/api/users/profile

HTTP 401
[Asserts]
jsonpath "$.error" contains "Authorization header missing"

# Test get user profile with invalid token
GET http://localhost:3000/api/users/profile
Authorization: Bearer invalid_token_here

HTTP 401
[Asserts]
jsonpath "$.error" contains "Invalid or expired token"

# Test update profile
PATCH http://localhost:3000/api/users/profile
Authorization: Bearer {{token}}
Content-Type: application/json
{
    "firstName": "Updated",
    "lastName": "Name"
}

HTTP 200
[Asserts]
jsonpath "$.profile.firstName" == "Updated"
jsonpath "$.profile.lastName" == "Name"

# Test update profile with invalid data
PATCH http://localhost:3000/api/users/profile
Authorization: Bearer {{token}}
Content-Type: application/json
{
    "avatar": "not-a-url"
}

HTTP 400
[Asserts]
jsonpath "$.message" == "Validation failed"
jsonpath "$.errors.avatar" exists

# Test update profile with custom preferences
PATCH http://localhost:3000/api/users/profile
Authorization: Bearer {{token}}
Content-Type: application/json
{
    "custom": {
        "theme": "dark",
        "language": "en",
        "notifications": {
            "email": true,
            "push": false
        }
    }
}

HTTP 200
[Asserts]
jsonpath "$.custom.theme" == "dark"
jsonpath "$.custom.language" == "en"
jsonpath "$.custom.notifications.email" == true
jsonpath "$.custom.notifications.push" == false

# Test change password
POST http://localhost:3000/api/users/change-password
Authorization: Bearer {{token}}
Content-Type: application/json
{
    "currentPassword": "Test1234!",
    "newPassword": "NewPass1234!"
}

HTTP 200
[Asserts]
jsonpath "$.message" == "Password changed successfully"

# Test change password with wrong current password
POST http://localhost:3000/api/users/change-password
Authorization: Bearer {{token}}
Content-Type: application/json
{
    "currentPassword": "WrongPassword",
    "newPassword": "NewPass1234!"
}

HTTP 401
[Asserts]
jsonpath "$.error" == "Current password is incorrect"

# Test change password with weak new password
POST http://localhost:3000/api/users/change-password
Authorization: Bearer {{token}}
Content-Type: application/json
{
    "currentPassword": "NewPass1234!",
    "newPassword": "weak"
}

HTTP 400
[Asserts]
jsonpath "$.message" == "Validation failed"
jsonpath "$.errors.newPassword" exists