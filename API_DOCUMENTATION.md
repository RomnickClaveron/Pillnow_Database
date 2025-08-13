# PillNow API Documentation

## Automatic Status Update System

The PillNow backend now includes an automatic status update system that monitors medication schedules and updates their status based on time.

### How It Works

1. **Automatic Status Updates**: Runs every minute via cron job
2. **Status Logic**:
   - `Pending` → `Done` when scheduled time has passed
   - `Pending` → `Missed` when scheduled time passed more than 1 hour ago
3. **Status History**: All status changes are tracked with timestamps and reasons

### New Status Values

- `Pending`: Medication is scheduled but not yet taken
- `Taken`: Medication was manually marked as taken by user
- `Done`: Medication time has passed (automatically updated)
- `Missed`: Medication time passed more than 1 hour ago (automatically updated)

## API Endpoints

### Status Update Endpoints

#### 1. Manual Status Update
**POST** `/api/medication_schedules/status/update`

Update a schedule's status manually (e.g., when user takes medication).

**Request Body:**
```json
{
  "scheduleId": 123,
  "status": "Taken",
  "notes": "User confirmed medication taken"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Schedule status updated successfully",
  "data": {
    "success": true,
    "scheduleId": 123,
    "newStatus": "Taken",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 2. Get Status History
**GET** `/api/medication_schedules/status/history/:scheduleId`

Get the complete status history for a specific schedule.

**Response:**
```json
{
  "success": true,
  "message": "Status history retrieved successfully",
  "data": {
    "scheduleId": 123,
    "currentStatus": "Done",
    "statusHistory": [
      {
        "status": "Pending",
        "timestamp": "2024-01-15T08:00:00.000Z",
        "reason": "system",
        "notes": "Status changed automatically"
      },
      {
        "status": "Done",
        "timestamp": "2024-01-15T09:00:00.000Z",
        "reason": "automatic",
        "notes": "Automatically marked as done"
      }
    ],
    "lastStatusUpdate": "2024-01-15T09:00:00.000Z"
  }
}
```

#### 3. Start Automatic Updates
**POST** `/api/medication_schedules/status/start-automatic`

Start the automatic status update service.

**Response:**
```json
{
  "success": true,
  "message": "Automatic status updates started successfully"
}
```

#### 4. Stop Automatic Updates
**POST** `/api/medication_schedules/status/stop-automatic`

Stop the automatic status update service.

**Response:**
```json
{
  "success": true,
  "message": "Automatic status updates stopped successfully"
}
```

#### 5. Trigger Manual Update (Testing)
**POST** `/api/medication_schedules/status/trigger-update`

Manually trigger the status update process (useful for testing).

**Response:**
```json
{
  "success": true,
  "message": "Status update triggered successfully"
}
```

### Notification Endpoints

#### 1. Get Pending Notifications
**GET** `/api/medication_schedules/notifications/pending`

Get all schedules that need notifications (scheduled within next 15 minutes).

**Response:**
```json
{
  "success": true,
  "message": "Schedules for notification retrieved successfully",
  "count": 2,
  "data": [
    {
      "scheduleId": 123,
      "userId": 1,
      "medicationId": 456,
      "containerId": "container1",
      "scheduledTime": "2024-01-15T10:00:00.000Z",
      "timeUntilScheduled": 5
    }
  ]
}
```

#### 2. Mark Alert as Sent
**POST** `/api/medication_schedules/notifications/mark-sent`

Mark that a notification has been sent for a schedule.

**Request Body:**
```json
{
  "scheduleId": 123
}
```

**Response:**
```json
{
  "success": true,
  "message": "Alert marked as sent successfully"
}
```

#### 3. Start Notification Service
**POST** `/api/medication_schedules/notifications/start-service`

Start the notification service.

**Response:**
```json
{
  "success": true,
  "message": "Notification service started successfully"
}
```

#### 4. Stop Notification Service
**POST** `/api/medication_schedules/notifications/stop-service`

Stop the notification service.

**Response:**
```json
{
  "success": true,
  "message": "Notification service stopped successfully"
}
```

#### 5. Send Test Notification
**POST** `/api/medication_schedules/notifications/test`

Send a test notification to a user.

**Request Body:**
```json
{
  "userId": 1,
  "message": "Test notification message"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test notification sent successfully"
}
```

#### 6. Get User Notification Settings
**GET** `/api/medication_schedules/notifications/settings/:userId`

Get notification preferences for a user.

**Response:**
```json
{
  "success": true,
  "message": "Notification settings retrieved successfully",
  "data": {
    "userId": 1,
    "pushNotifications": true,
    "emailNotifications": false,
    "smsNotifications": false,
    "reminderTime": 15,
    "quietHours": {
      "start": "22:00",
      "end": "08:00"
    }
  }
}
```

#### 7. Update User Notification Settings
**PUT** `/api/medication_schedules/notifications/settings/:userId`

Update notification preferences for a user.

**Request Body:**
```json
{
  "pushNotifications": true,
  "emailNotifications": false,
  "smsNotifications": false,
  "reminderTime": 15,
  "quietHours": {
    "start": "22:00",
    "end": "08:00"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification settings updated successfully",
  "data": {
    "success": true
  }
}
```

## Frontend Integration Examples

### Auto-refresh Implementation

```javascript
// Poll for status updates every 30 seconds
setInterval(async () => {
  try {
    const response = await fetch('/api/medication_schedules/container/container1');
    const data = await response.json();
    
    if (data.success) {
      // Update UI with new schedule data
      updateScheduleDisplay(data.data);
    }
  } catch (error) {
    console.error('Error fetching schedule updates:', error);
  }
}, 30000);
```

### Manual Status Update

```javascript
// Mark medication as taken
async function markMedicationTaken(scheduleId) {
  try {
    const response = await fetch('/api/medication_schedules/status/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scheduleId: scheduleId,
        status: 'Taken',
        notes: 'User confirmed medication taken'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Update UI to reflect new status
      updateScheduleStatus(scheduleId, 'Taken');
    }
  } catch (error) {
    console.error('Error updating status:', error);
  }
}
```

### Get Status History

```javascript
// Get status history for a schedule
async function getStatusHistory(scheduleId) {
  try {
    const response = await fetch(`/api/medication_schedules/status/history/${scheduleId}`);
    const data = await response.json();
    
    if (data.success) {
      // Display status history in UI
      displayStatusHistory(data.data.statusHistory);
    }
  } catch (error) {
    console.error('Error fetching status history:', error);
  }
}
```

### Notification Integration

```javascript
// Check for pending notifications
async function checkNotifications() {
  try {
    const response = await fetch('/api/medication_schedules/notifications/pending');
    const data = await response.json();
    
    if (data.success && data.count > 0) {
      // Show notifications to user
      data.data.forEach(schedule => {
        showNotification(schedule);
      });
    }
  } catch (error) {
    console.error('Error checking notifications:', error);
  }
}

// Mark notification as sent
async function markNotificationSent(scheduleId) {
  try {
    await fetch('/api/medication_schedules/notifications/mark-sent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scheduleId: scheduleId
      })
    });
  } catch (error) {
    console.error('Error marking notification sent:', error);
  }
}
```

## Installation and Setup

1. **Install Dependencies:**
   ```bash
   npm install node-cron moment
   ```

2. **Start the Server:**
   ```bash
   npm start
   ```

3. **Verify Services:**
   - Automatic status updates start automatically
   - Notification service starts automatically
   - Check server logs for confirmation

## Testing the System

1. **Create a test schedule:**
   ```bash
   curl -X POST http://localhost:3000/api/medication_schedules \
     -H "Content-Type: application/json" \
     -d '{
       "user": 1,
       "medication": 1,
       "container": "test",
       "date": "2024-01-15",
       "time": "10:00"
     }'
   ```

2. **Trigger manual status update:**
   ```bash
   curl -X POST http://localhost:3000/api/medication_schedules/status/trigger-update
   ```

3. **Check status history:**
   ```bash
   curl http://localhost:3000/api/medication_schedules/status/history/1
   ```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (missing required fields)
- `500`: Internal Server Error

## Notes

- The automatic status update service runs every minute
- The notification service checks for notifications every 5 minutes
- All status changes are logged with timestamps and reasons
- The system is designed to be fault-tolerant and will continue running even if individual operations fail
