const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const createIndexes = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.DB_URI);
        console.log('Connected to MongoDB for index creation');

        const db = mongoose.connection.db;

        // Device indexes
        await db.collection('devices').createIndex({ deviceId: 1 }, { unique: true });
        await db.collection('devices').createIndex({ bluetoothAddress: 1 }, { unique: true });
        await db.collection('devices').createIndex({ status: 1 });
        await db.collection('devices').createIndex({ deviceType: 1 });
        await db.collection('devices').createIndex({ isConnected: 1 });
        await db.collection('devices').createIndex({ lastSeen: 1 });
        console.log('Device indexes created');

        // CaregiverConnection indexes
        await db.collection('caregiverconnections').createIndex({ connectionId: 1 }, { unique: true });
        await db.collection('caregiverconnections').createIndex({ caregiver: 1, status: 1 });
        await db.collection('caregiverconnections').createIndex({ elder: 1, status: 1 });
        await db.collection('caregiverconnections').createIndex({ device: 1, status: 1 });
        await db.collection('caregiverconnections').createIndex({ caregiver: 1, elder: 1, device: 1 }, { unique: true });
        await db.collection('caregiverconnections').createIndex({ lastActivity: 1 });
        console.log('CaregiverConnection indexes created');

        // Enhanced MedicationSchedule indexes
        await db.collection('medicationschedules').createIndex({ scheduleId: 1 }, { unique: true });
        await db.collection('medicationschedules').createIndex({ user: 1, date: 1 });
        await db.collection('medicationschedules').createIndex({ device: 1, date: 1 });
        await db.collection('medicationschedules').createIndex({ status: 1, date: 1 });
        await db.collection('medicationschedules').createIndex({ 'adherenceData.caregiverNotified': 1 });
        await db.collection('medicationschedules').createIndex({ 'adherenceData.takenLate': 1 });
        await db.collection('medicationschedules').createIndex({ deviceStatus: 1 });
        await db.collection('medicationschedules').createIndex({ lastDeviceSync: 1 });
        console.log('Enhanced MedicationSchedule indexes created');

        // User indexes
        await db.collection('users').createIndex({ userId: 1 }, { unique: true });
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        await db.collection('users').createIndex({ role: 1 });
        console.log('User indexes created');

        // Alert indexes
        await db.collection('alerts').createIndex({ user: 1, createdAt: -1 });
        await db.collection('alerts').createIndex({ device: 1, createdAt: -1 });
        await db.collection('alerts').createIndex({ type: 1, severity: 1 });
        await db.collection('alerts').createIndex({ isRead: 1, createdAt: -1 });
        console.log('Alert indexes created');

        // Device logs indexes
        await db.collection('device_logs').createIndex({ deviceId: 1, timestamp: -1 });
        await db.collection('device_logs').createIndex({ logType: 1, timestamp: -1 });
        await db.collection('device_logs').createIndex({ timestamp: -1 });
        console.log('Device logs indexes created');

        // Medication indexes
        await db.collection('medications').createIndex({ medicationId: 1 }, { unique: true });
        await db.collection('medications').createIndex({ user: 1 });
        await db.collection('medications').createIndex({ name: 1 });
        console.log('Medication indexes created');

        // Compound indexes for complex queries
        await db.collection('medicationschedules').createIndex({ 
            user: 1, 
            device: 1, 
            date: 1, 
            status: 1 
        });
        
        await db.collection('caregiverconnections').createIndex({ 
            caregiver: 1, 
            status: 1, 
            lastActivity: -1 
        });

        await db.collection('devices').createIndex({ 
            status: 1, 
            deviceType: 1, 
            lastSeen: -1 
        });

        console.log('Compound indexes created');
        console.log('All indexes created successfully!');

    } catch (error) {
        console.error('Error creating indexes:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run the script
createIndexes();









