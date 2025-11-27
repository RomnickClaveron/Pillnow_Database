# Caregiver-Device Management Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file with the following variables:
```env
DB_URI=mongodb://localhost:27017/pillnow_database
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

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

### 3. Set Up Database
```bash
# Create database indexes for performance
npm run create-indexes

# Migrate existing data to new schema
npm run migrate

# Or run both at once
npm run setup
```

### 4. Start the Server
```bash
npm start
# or for development
npm run dev
```

## 📋 New Features Overview

### 1. Device Management
- **Bluetooth Device Tracking**: Track pill dispensers, smart pillboxes, and Bluetooth trackers
- **Device Status Monitoring**: Battery level, connection status, last seen
- **Device Capabilities**: Medication reminders, adherence tracking, connectivity

### 2. Caregiver Connections
- **Flexible Relationships**: Family, professional caregiver, friend, neighbor
- **Permission Management**: Granular control over what caregivers can see/do
- **Device Settings**: Customizable alert frequencies and quiet hours
- **Monitoring Settings**: Track missed doses, late doses, generate reports

### 3. Enhanced Medication Scheduling
- **Device Integration**: Link schedules to specific devices and containers
- **Adherence Tracking**: On-time, late, missed dose tracking
- **Caregiver Notifications**: Automatic alerts for missed/late doses
- **Sync Status**: Track device synchronization status

### 4. Advanced Monitoring
- **Real-time Statistics**: Adherence rates, missed doses, late doses
- **Daily Breakdowns**: Day-by-day adherence analysis
- **Alert System**: Automated notifications for caregivers
- **Performance Metrics**: Device health and usage statistics

## 🔧 API Endpoints

### Device Management
- `POST /api/devices/connect` - Connect caregiver to device
- `GET /api/devices/caregiver/:caregiverId` - Get caregiver's devices
- `POST /api/devices/disconnect/:deviceId` - Disconnect device
- `GET /api/devices/stats/:deviceId` - Get device adherence stats
- `GET /api/devices/schedules/:deviceId` - Get device-specific schedules
- `GET /api/devices/elder/:elderId` - Get elder's device info
- `POST /api/devices/assign-elder` - Link elder to device

### Enhanced Monitoring
- `GET /api/monitor/device-stats/:deviceId` - Get device adherence stats
- `GET /api/monitor/device-schedules/:deviceId` - Get device-specific schedules
- `GET /api/monitor/elder-device/:elderId` - Get elder's device info
- `GET /api/monitor/alerts` - Get monitoring alerts and notifications

### Caregiver Management
- `POST /api/caregivers/assign-elder-device` - Link elder to device
- `GET /api/caregivers/elder-device/:elderId` - Get elder's device

## 📊 Database Schema Changes

### New Collections
1. **devices** - Bluetooth device information
2. **caregiverconnections** - Caregiver-elder-device relationships

### Enhanced Collections
1. **medicationschedules** - Added device integration and adherence tracking
2. **users** - Role-based access (1=admin, 2=elder, 3=caregiver)

### New Fields in MedicationSchedule
```javascript
{
  device: ObjectId,           // Reference to Device
  deviceContainer: String,    // Container ID on device
  deviceStatus: String,       // Sync status
  lastDeviceSync: Date,       // Last sync timestamp
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

## 🔍 Usage Examples

### 1. Connect a Caregiver to a Device
```javascript
const response = await fetch('/api/devices/connect', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    caregiverId: '123',
    elderId: '456',
    deviceId: '789',
    relationship: 'family',
    permissions: {
      viewMedications: true,
      viewAdherence: true,
      receiveAlerts: true
    }
  })
});
```

### 2. Get Device Adherence Statistics
```javascript
const stats = await fetch('/api/monitor/device-stats/789?startDate=2024-01-01&endDate=2024-01-31');
const data = await stats.json();
console.log('Adherence Rate:', data.data.statistics.adherenceRate);
```

### 3. Get Elder's Monitoring Data
```javascript
const monitoring = await fetch('/api/monitor/elder-device/456');
const data = await monitoring.json();
console.log('Devices:', data.data.devices);
```

## 🚨 Important Notes

### Migration Considerations
1. **Backup Data**: Always backup your database before running migrations
2. **Test Environment**: Run migrations in a test environment first
3. **Gradual Rollout**: Consider rolling out features gradually

### Performance Optimization
1. **Database Indexes**: Run `npm run create-indexes` for optimal performance
2. **Query Optimization**: Use the provided indexes for complex queries
3. **Monitoring**: Monitor database performance with the new collections

### Security Considerations
1. **Permission Validation**: Always validate caregiver permissions
2. **Device Authentication**: Implement device authentication for Bluetooth connections
3. **Data Privacy**: Ensure elder data is only accessible to authorized caregivers

## 🐛 Troubleshooting

### Common Issues

1. **Migration Fails**
   - Check database connection
   - Verify all required fields exist
   - Check for data type mismatches

2. **Index Creation Fails**
   - Ensure database is accessible
   - Check for duplicate indexes
   - Verify collection names

3. **API Endpoints Not Working**
   - Verify routes are properly registered in server.js
   - Check controller imports
   - Validate request/response formats

### Debug Commands
```bash
# Check database connection
node testConnection.js

# Verify collections exist
mongo pillnow_database --eval "db.getCollectionNames()"

# Check indexes
mongo pillnow_database --eval "db.devices.getIndexes()"
```

## 📈 Next Steps

1. **Frontend Integration**: Update your frontend to use the new API endpoints
2. **Device Integration**: Implement Bluetooth connectivity for real devices
3. **Notification System**: Set up push notifications for caregivers
4. **Reporting**: Implement comprehensive reporting features
5. **Analytics**: Add advanced analytics and insights

## 🤝 Support

For issues or questions:
1. Check the API documentation in `API_ENDPOINTS_SUMMARY.md`
2. Review the migration logs
3. Test endpoints using the provided examples
4. Check database indexes and performance

---

**🎉 Congratulations!** Your PillNow system now supports complete caregiver workflow with device management, elder profiles, and adherence monitoring!









