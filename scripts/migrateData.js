const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Import models
const User = require('../models/userModels');
const MedicationSchedule = require('../models/medication_scheduleModels');
const Device = require('../models/deviceModels');
const CaregiverConnection = require('../models/caregiverConnectionModels');

const migrateData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.DB_URI);
        console.log('Connected to MongoDB for data migration');

        console.log('Starting data migration...');

        // Step 1: Update existing medication schedules with device integration fields
        console.log('Step 1: Updating existing medication schedules...');
        
        const schedulesToUpdate = await MedicationSchedule.find({
            $or: [
                { device: { $exists: false } },
                { deviceStatus: { $exists: false } },
                { adherenceData: { $exists: false } }
            ]
        });

        console.log(`Found ${schedulesToUpdate.length} schedules to update`);

        for (const schedule of schedulesToUpdate) {
            const updateData = {};
            
            // Add device integration fields if they don't exist
            if (!schedule.device) {
                updateData.device = null;
            }
            if (!schedule.deviceStatus) {
                updateData.deviceStatus = 'pending_sync';
            }
            if (!schedule.adherenceData) {
                updateData.adherenceData = {
                    takenOnTime: false,
                    takenLate: false,
                    lateByMinutes: 0,
                    missedReason: null,
                    caregiverNotified: false,
                    caregiverNotifiedAt: null
                };
            }

            // Update adherence data based on existing status
            if (schedule.status === 'Taken') {
                updateData['adherenceData.takenOnTime'] = true;
            } else if (schedule.status === 'Missed') {
                updateData['adherenceData.missedReason'] = 'forgot';
            }

            if (Object.keys(updateData).length > 0) {
                await MedicationSchedule.findByIdAndUpdate(schedule._id, { $set: updateData });
            }
        }

        console.log('Medication schedules updated successfully');

        // Step 2: Create sample devices for existing users
        console.log('Step 2: Creating sample devices...');
        
        const elders = await User.find({ role: 2 }); // role 2 = elder
        const caregivers = await User.find({ role: 3 }); // role 3 = guardian/caregiver

        // Create sample devices for elders
        for (let i = 0; i < elders.length; i++) {
            const elder = elders[i];
            
            // Check if elder already has a device
            const existingConnection = await CaregiverConnection.findOne({ elder: elder._id });
            if (existingConnection) {
                console.log(`Elder ${elder.name} already has a device connection`);
                continue;
            }

            // Create a sample device
            const device = new Device({
                deviceName: `PillBox-${elder.name}-${i + 1}`,
                bluetoothAddress: `00:11:22:33:44:${String(i + 1).padStart(2, '0')}`,
                deviceType: 'pill_dispenser',
                status: 'active',
                batteryLevel: Math.floor(Math.random() * 40) + 60, // 60-100%
                capabilities: ['medication_reminder', 'adherence_tracking', 'bluetooth_connectivity', 'battery_monitoring'],
                location: 'Home',
                isConnected: true
            });

            await device.save();
            console.log(`Created device for elder ${elder.name}: ${device.deviceName}`);

            // Create caregiver connection if caregivers exist
            if (caregivers.length > 0) {
                const caregiver = caregivers[i % caregivers.length]; // Round-robin assignment
                
                const connection = new CaregiverConnection({
                    caregiver: caregiver._id,
                    elder: elder._id,
                    device: device._id,
                    relationship: 'family',
                    permissions: {
                        viewMedications: true,
                        manageMedications: false,
                        viewAdherence: true,
                        receiveAlerts: true,
                        manageDevice: false
                    },
                    status: 'active'
                });

                await connection.save();
                console.log(`Created caregiver connection: ${caregiver.name} -> ${elder.name} -> ${device.deviceName}`);
            }
        }

        // Step 3: Update existing medication schedules with device assignments
        console.log('Step 3: Assigning devices to existing medication schedules...');
        
        const schedulesWithoutDevice = await MedicationSchedule.find({ device: null });
        const devices = await Device.find({ status: 'active' });

        if (devices.length > 0) {
            for (const schedule of schedulesWithoutDevice) {
                // Find a device for this user
                const userConnections = await CaregiverConnection.find({ 
                    elder: schedule.user, 
                    status: 'active' 
                }).populate('device');

                if (userConnections.length > 0) {
                    const device = userConnections[0].device;
                    
                    await MedicationSchedule.findByIdAndUpdate(schedule._id, {
                        $set: {
                            device: device._id,
                            deviceContainer: `container_${Math.floor(Math.random() * 4) + 1}`,
                            deviceStatus: 'synced',
                            lastDeviceSync: new Date()
                        }
                    });
                    
                    console.log(`Assigned device ${device.deviceName} to schedule ${schedule.scheduleId}`);
                }
            }
        }

        // Step 4: Create sample alerts for monitoring
        console.log('Step 4: Creating sample monitoring alerts...');
        
        const Alert = require('../models/alertsModels');
        
        // Get schedules that need attention
        const missedSchedules = await MedicationSchedule.find({ 
            status: 'Missed',
            'adherenceData.caregiverNotified': false 
        }).populate('user').populate('device');

        for (const schedule of missedSchedules) {
            const alert = new Alert({
                user: schedule.user._id,
                device: schedule.device ? schedule.device._id : null,
                type: 'medication_missed',
                message: `Medication missed: ${schedule.medication} at ${schedule.time}`,
                severity: 'high',
                isRead: false
            });

            await alert.save();
            console.log(`Created alert for missed medication: ${schedule.scheduleId}`);
        }

        // Step 5: Update user roles if needed
        console.log('Step 5: Verifying user roles...');
        
        const usersWithoutRole = await User.find({ role: { $exists: false } });
        if (usersWithoutRole.length > 0) {
            console.log(`Found ${usersWithoutRole.length} users without roles, setting default role to elder`);
            await User.updateMany(
                { role: { $exists: false } },
                { $set: { role: 2 } } // Default to elder
            );
        }

        console.log('Data migration completed successfully!');
        console.log('\nMigration Summary:');
        console.log(`- Updated ${schedulesToUpdate.length} medication schedules`);
        console.log(`- Created ${elders.length} devices for elders`);
        console.log(`- Created ${caregivers.length} caregiver connections`);
        console.log(`- Assigned devices to ${schedulesWithoutDevice.length} schedules`);
        console.log(`- Created ${missedSchedules.length} monitoring alerts`);

    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run the migration
migrateData();









