# PillNow API Endpoints Summary

## New API Endpoints for Caregiver-Device Management

### Device Management Routes (`/api/devices`)

#### 1. Connect Caregiver to Device
- **POST** `/api/devices/connect`
- **Description**: Connect a caregiver to a device for monitoring an elder
- **Body**:
  ```json
  {
    "caregiverId": "string",
    "elderId": "string", 
    "deviceId": "string",
    "relationship": "family|professional_caregiver|friend|neighbor",
    "permissions": {
      "viewMedications": true,
      "manageMedications": false,
      "viewAdherence": true,
      "receiveAlerts": true,
      "manageDevice": false
    },
    "deviceSettings": {
      "alertFrequency": "immediate|hourly|daily|weekly",
      "quietHours": {
        "start": "22:00",
        "end": "08:00"
      },
      "preferredContactMethod": "push_notification|email|sms|all"
    },
    "monitoringSettings": {
      "trackMissedDoses": true,
      "trackLateDoses": true,
      "lateThreshold": 30,
      "generateReports": true,
      "reportFrequency": "daily|weekly|monthly"
    }
  }
  ```

#### 2. Get Caregiver's Devices
- **GET** `/api/devices/caregiver/:caregiverId`
- **Description**: Get all devices connected to a caregiver
- **Response**: Array of devices with elder and connection info

#### 3. Disconnect Device
- **POST** `/api/devices/disconnect/:deviceId`
- **Body**: `{ "caregiverId": "string" }`
- **Description**: Disconnect a caregiver from a device

#### 4. Get Device Statistics
- **GET** `/api/devices/stats/:deviceId`
- **Description**: Get adherence statistics for a device
- **Query Params**: `startDate`, `endDate`

#### 5. Get Device Schedules
- **GET** `/api/devices/schedules/:deviceId`
- **Description**: Get schedules for a specific device
- **Query Params**: `date`, `status`

#### 6. Get Elder's Device Info
- **GET** `/api/devices/elder/:elderId`
- **Description**: Get device information for an elder

#### 7. Assign Elder to Device
- **POST** `/api/devices/assign-elder`
- **Description**: Link an elder to a device
- **Body**:
  ```json
  {
    "elderId": "string",
    "deviceId": "string",
    "caregiverId": "string",
    "relationship": "family|professional_caregiver|friend|neighbor",
    "permissions": { ... }
  }
  ```

### Enhanced Monitoring Routes (`/api/monitor`)

#### 1. Get Device Adherence Statistics
- **GET** `/api/monitor/device-stats/:deviceId`
- **Description**: Get comprehensive adherence statistics for a device
- **Query Params**: `startDate`, `endDate`
- **Response**: Device info, adherence rates, daily breakdown

#### 2. Get Enhanced Device Schedules
- **GET** `/api/monitor/device-schedules/:deviceId`
- **Description**: Get device schedules with adherence insights
- **Query Params**: `date`, `status`, `includeAdherence`
- **Response**: Schedules with adherence data and insights

#### 3. Get Elder Device Monitoring
- **GET** `/api/monitor/elder-device/:elderId`
- **Description**: Get comprehensive monitoring data for an elder's devices
- **Response**: Elder info, device connections, adherence metrics

#### 4. Get Monitoring Alerts
- **GET** `/api/monitor/alerts`
- **Description**: Get alerts and schedules needing attention
- **Query Params**: `deviceId`, `elderId`, `caregiverId`

### Caregiver Routes (`/api/caregivers`)

#### 1. Assign Elder to Device
- **POST** `/api/caregivers/assign-elder-device`
- **Description**: Create caregiver-elder-device association
- **Body**: Same as device assignment

#### 2. Get Elder's Device
- **GET** `/api/caregivers/elder-device/:elderId`
- **Description**: Get elder's device information

## Database Models

### Device Model
```javascript
{
  deviceId: String (unique),
  deviceName: String,
  bluetoothAddress: String (unique),
  deviceType: "pill_dispenser|smart_pillbox|bluetooth_tracker",
  status: "active|inactive|maintenance|disconnected",
  batteryLevel: Number (0-100),
  lastSeen: Date,
  firmwareVersion: String,
  capabilities: [String],
  location: String,
  isConnected: Boolean,
  connectionHistory: [Object]
}
```

### CaregiverConnection Model
```javascript
{
  connectionId: String (unique),
  caregiver: ObjectId (ref: User),
  elder: ObjectId (ref: User),
  device: ObjectId (ref: Device),
  relationship: "family|professional_caregiver|friend|neighbor",
  permissions: {
    viewMedications: Boolean,
    manageMedications: Boolean,
    viewAdherence: Boolean,
    receiveAlerts: Boolean,
    manageDevice: Boolean
  },
  status: "active|inactive|pending|suspended",
  deviceSettings: Object,
  monitoringSettings: Object
}
```

### Enhanced MedicationSchedule Model
```javascript
{
  // ... existing fields ...
  device: ObjectId (ref: Device),
  deviceContainer: String,
  deviceStatus: "synced|pending_sync|sync_failed",
  lastDeviceSync: Date,
  adherenceData: {
    takenOnTime: Boolean,
    takenLate: Boolean,
    lateByMinutes: Number,
    missedReason: String,
    caregiverNotified: Boolean,
    caregiverNotifiedAt: Date
  }
}
```

## Environment Variables

Add these to your `.env` file:

```env
# Device Management
DEVICE_SYNC_INTERVAL=300000
DEVICE_TIMEOUT=30000
BLUETOOTH_SCAN_DURATION=10000

# Monitoring Settings
ADHERENCE_THRESHOLD=80
LATE_DOSE_THRESHOLD=30
ALERT_RETRY_ATTEMPTS=3
ALERT_RETRY_INTERVAL=300000

# Caregiver Settings
CAREGIVER_ALERT_FREQUENCY=immediate
QUIET_HOURS_START=22:00
QUIET_HOURS_END=08:00
```

## Database Indexes

Run the index creation script:
```bash
node scripts/createIndexes.js
```

## Migration Script

Run the data migration script:
```bash
node scripts/migrateData.js
```

## Usage Examples

### 1. Connect a caregiver to a device:
```bash
curl -X POST http://localhost:3000/api/devices/connect \
  -H "Content-Type: application/json" \
  -d '{
    "caregiverId": "123",
    "elderId": "456", 
    "deviceId": "789",
    "relationship": "family",
    "permissions": {
      "viewMedications": true,
      "viewAdherence": true,
      "receiveAlerts": true
    }
  }'
```

### 2. Get device adherence statistics:
```bash
curl -X GET "http://localhost:3000/api/monitor/device-stats/789?startDate=2024-01-01&endDate=2024-01-31"
```

### 3. Get elder's monitoring data:
```bash
curl -X GET http://localhost:3000/api/monitor/elder-device/456
```

## Key Features

1. **Device Management**: Complete Bluetooth device tracking and management
2. **Caregiver Connections**: Flexible caregiver-elder-device associations
3. **Enhanced Monitoring**: Comprehensive adherence tracking and reporting
4. **Real-time Alerts**: Automated notifications for missed/late doses
5. **Performance Optimized**: Database indexes for fast queries
6. **Migration Ready**: Scripts to update existing data

This implementation provides a complete caregiver workflow with device management, elder profiles, and adherence monitoring! 🚀









