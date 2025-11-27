# Schedule Routes Security Implementation

## Overview

All medication schedule routes now validate:
1. **Token authentication** - User must be authenticated
2. **User ID matching** - User ID in body/URL must match token subject (unless admin)
3. **Schedule ownership** - Schedules can only be modified by their owner or users with elevated roles

---

## Security Middleware

### `validateUserIdMatch`
- Validates that `user` field in request body matches authenticated user
- Validates that `userId` in URL params matches authenticated user
- Admins are exempt from this check
- Rejects requests with 403 if user IDs don't match

### `validateScheduleOwnership`
- Checks if schedule exists
- Validates ownership:
  - **Admin**: Can access any schedule
  - **Schedule Owner**: User who owns the schedule (schedule.user)
  - **Schedule Creator**: Guardian who created the schedule (schedule.createdBy)
- Rejects requests with 403 if user doesn't have permission
- Attaches schedule to `req.schedule` for use in controllers

### `validateCreateOwnership`
- Validates user ID in body for create operations
- **Admin**: Can create schedules for anyone
- **Guardian**: Can create schedules for elders (not themselves)
- **Elder**: Can only create schedules for themselves
- Rejects requests with 403 if user tries to create for wrong user

---

## Protected Routes

### Create Schedule
- **Route**: `POST /api/medication_schedules`
- **Middleware**: `protect` → `validateCreateOwnership`
- **Validation**: 
  - User ID in body must match token (unless admin/guardian)
  - Guardians can only create for elders

### Update Schedule
- **Route**: `PUT /api/medication_schedules/:id`
- **Middleware**: `protect` → `validateScheduleOwnership`
- **Validation**:
  - Schedule must belong to user or user must be admin/creator
  - If `user` field in body is provided, it must match schedule owner

### Delete Schedule
- **Route**: `DELETE /api/medication_schedules/:id`
- **Middleware**: `protect` → `validateScheduleOwnership`
- **Validation**: Same as update

### Get Schedules by User ID
- **Route**: `GET /api/medication_schedules/user/:userId`
- **Middleware**: `protect` → `validateUserIdMatch`
- **Validation**: User ID in URL must match token (unless admin)

### Update Schedule Status
- **Route**: `POST /api/medication_schedules/status/update`
- **Middleware**: `protect` → `validateScheduleOwnership`
- **Validation**: Schedule ownership (checks `scheduleId` in body)

### Get Status History
- **Route**: `GET /api/medication_schedules/status/history/:scheduleId`
- **Middleware**: `protect` → `validateScheduleOwnership`
- **Validation**: Schedule ownership

### User Notification Settings
- **Route**: `GET /api/medication_schedules/notifications/settings/:userId`
- **Route**: `PUT /api/medication_schedules/notifications/settings/:userId`
- **Middleware**: `protect` → `validateUserIdMatch`
- **Validation**: User ID in URL must match token (unless admin)

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden - User ID Mismatch
```json
{
  "success": false,
  "message": "Forbidden: User ID in request body does not match authenticated user",
  "authenticatedUserId": "123",
  "requestedUserId": "456"
}
```

### 403 Forbidden - Schedule Ownership
```json
{
  "success": false,
  "message": "Forbidden: You do not have permission to access this schedule",
  "authenticatedUserId": "123",
  "scheduleUserId": "456",
  "scheduleCreatedBy": "789",
  "userRole": 2
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Schedule not found"
}
```

---

## Role-Based Access

### Admin (Role 1)
- ✅ Can create schedules for any user
- ✅ Can view/modify/delete any schedule
- ✅ Can access any user's schedules
- ✅ Exempt from user ID matching checks

### Guardian/Caregiver (Role 3)
- ✅ Can create schedules for elders (not themselves)
- ✅ Can view/modify schedules they created
- ✅ Cannot create schedules for themselves
- ✅ Must match user ID when accessing specific user data

### Elder (Role 2)
- ✅ Can only create schedules for themselves
- ✅ Can only view/modify their own schedules
- ✅ Must match user ID in all requests

---

## Testing

### Test 1: User tries to create schedule for different user
```bash
# Should fail if not admin/guardian
POST /api/medication_schedules
Authorization: Bearer <token_for_user_123>
Body: { "user": 456, ... }
# Response: 403 Forbidden
```

### Test 2: User tries to update schedule they don't own
```bash
# Should fail
PUT /api/medication_schedules/999
Authorization: Bearer <token_for_user_123>
# Response: 403 Forbidden (if schedule belongs to user 456)
```

### Test 3: User tries to access different user's schedules
```bash
# Should fail if not admin
GET /api/medication_schedules/user/456
Authorization: Bearer <token_for_user_123>
# Response: 403 Forbidden
```

### Test 4: Admin can access any schedule
```bash
# Should succeed
GET /api/medication_schedules/user/456
Authorization: Bearer <admin_token>
# Response: 200 OK
```

---

## Implementation Details

### Controller Changes
- Removed duplicate authorization checks (now handled by middleware)
- Use `req.schedule` from middleware instead of fetching again
- Simplified error handling

### Middleware Flow
1. `protect` - Validates token, sets `req.user`
2. `validateUserIdMatch` / `validateCreateOwnership` / `validateScheduleOwnership` - Validates permissions
3. Controller - Processes request with validated data

### Security Benefits
- ✅ Centralized authorization logic
- ✅ Consistent error messages
- ✅ Prevents unauthorized access
- ✅ Validates user ID matching
- ✅ Role-based access control

---

## Migration Notes

**Breaking Changes:**
- Requests with mismatched user IDs will now be rejected (403)
- Must provide valid token for all schedule operations
- User ID in body/URL must match authenticated user (unless admin)

**Backward Compatibility:**
- Existing valid requests will continue to work
- Error messages are more descriptive
- Same role-based access rules apply

---

## Files Modified

1. **middleware/scheduleAuthMiddleware.js** - New file with authorization middleware
2. **routes/medicationScheduleRoutes.js** - Added middleware to routes
3. **controllers/medicationScheduleController.js** - Simplified authorization logic

---

## Next Steps

1. Test all endpoints with different user roles
2. Verify error responses are correct
3. Update API documentation
4. Add integration tests for authorization

