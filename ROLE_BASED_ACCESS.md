# Role-Based Access Control (RBAC) System

## Overview
This system implements role-based access control for user account management with three distinct roles: **admin**, **elder**, and **guardian**.

## User Roles

### Admin
- **Full access**: Can view, update, and delete any user account
- **Role management**: Can change user roles
- **System management**: Can view all users in the system
- **Restrictions**: Cannot delete their own account for security reasons

### Elder
- **Self-access**: Can view, update, and delete only their own account
- **No role changes**: Cannot modify their own role
- **Limited access**: Cannot access other users' data

### Guardian
- **Self-access**: Can view, update, and delete only their own account
- **No role changes**: Cannot modify their own role
- **Limited access**: Cannot access other users' data

## API Endpoints

### Public Routes (No Authentication Required)
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user

### Protected Routes (Authentication Required)

#### Admin Only
- `GET /api/users/` - Get all users (admin only)

#### Admin or Self Access
- `GET /api/users/:id` - Get user by ID (admin or self)
- `PUT /api/users/:id` - Update user (admin or self)
- `DELETE /api/users/:id` - Delete user (admin or self)

#### Self Access Only
- `GET /api/users/profile` - Get current user profile

## Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Security Features

1. **Role Validation**: Only valid roles (admin, elder, guardian) can be assigned
2. **Self-Protection**: Users can only modify their own accounts unless they're admin
3. **Role Change Protection**: Only admins can change user roles
4. **Admin Self-Protection**: Admins cannot delete their own accounts
5. **Password Hashing**: All passwords are securely hashed using bcrypt

## Usage Examples

### Register a new user
```json
POST /api/users/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "elder"
}
```

### Login
```json
POST /api/users/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Update user (requires authentication)
```json
PUT /api/users/:id
Authorization: Bearer <token>
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

## Error Responses

- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: User not found
- `400 Bad Request`: Invalid data or role 