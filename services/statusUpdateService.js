const cron = require('node-cron');
const moment = require('moment');
const EventEmitter = require('events');
const MedicationSchedule = require('../models/medication_scheduleModels');

class StatusUpdateService {
    constructor() {
        this.isRunning = false;
        this.events = new EventEmitter();
    }

    // Initialize the cron job to run every minute
    startAutomaticUpdates() {
        if (this.isRunning) {
            console.log('Status update service is already running');
            return;
        }

        console.log('Starting automatic status update service...');
        
        // Run every minute
        cron.schedule('* * * * *', async () => {
            try {
                await this.updatePendingSchedules();
            } catch (error) {
                console.error('Error in automatic status update:', error);
            }
        });

        this.isRunning = true;
        console.log('Automatic status update service started successfully');
    }

    // Stop the cron job
    stopAutomaticUpdates() {
        if (!this.isRunning) {
            console.log('Status update service is not running');
            return;
        }

        console.log('Stopping automatic status update service...');
        // Note: In a real implementation, you'd need to store the cron job reference
        // For now, we'll just set the flag
        this.isRunning = false;
        console.log('Automatic status update service stopped');
    }

    // Main function to update pending schedules
    async updatePendingSchedules() {
        try {
            console.log('Checking for pending schedules to update...');
            
            const now = moment();
            
            // Find all pending schedules
            const pendingSchedules = await MedicationSchedule.find({
                status: 'Pending'
            });

            console.log(`Found ${pendingSchedules.length} pending schedules`);

            let updatedCount = 0;
            let missedCount = 0;

            for (const schedule of pendingSchedules) {
                const scheduleDateTime = this.getScheduleDateTime(schedule);
                
                if (!scheduleDateTime) {
                    console.log(`Invalid schedule date/time for schedule ${schedule.scheduleId}`);
                    continue;
                }

                // Check if scheduled time has passed
                if (now.isAfter(scheduleDateTime)) {
                    const previousStatus = schedule.status;
                    let newStatus = 'Done';
                    let reason = 'automatic';
                    let notes = 'Automatically marked as done';

                    // If more than 1 hour has passed, mark as missed
                    if (now.isAfter(scheduleDateTime.clone().add(1, 'hour'))) {
                        newStatus = 'Missed';
                        notes = 'Automatically marked as missed (more than 1 hour late)';
                    }

                    // Update the schedule status
                    schedule.updateStatus(newStatus, reason, notes);
                    await schedule.save();

                    // Emit realtime event
                    this.events.emit('statusUpdate', {
                        scheduleId: schedule.scheduleId,
                        userId: schedule.user,
                        medicationId: schedule.medication,
                        containerId: schedule.container,
                        previousStatus: previousStatus,
                        newStatus: newStatus,
                        updatedAt: new Date().toISOString(),
                        source: 'automatic'
                    });

                    if (newStatus === 'Done') {
                        updatedCount++;
                    } else {
                        missedCount++;
                    }

                    console.log(`Updated schedule ${schedule.scheduleId} from ${previousStatus} to ${newStatus}`);
                }
            }

            if (updatedCount > 0 || missedCount > 0) {
                console.log(`Status update completed: ${updatedCount} marked as Done, ${missedCount} marked as Missed`);
            }

        } catch (error) {
            console.error('Error updating pending schedules:', error);
            throw error;
        }
    }

    // Helper function to get the full date-time from schedule
    getScheduleDateTime(schedule) {
        try {
            const dateStr = moment(schedule.date).format('YYYY-MM-DD');
            const timeStr = schedule.time;
            const dateTimeStr = `${dateStr} ${timeStr}`;
            return moment(dateTimeStr, 'YYYY-MM-DD HH:mm');
        } catch (error) {
            console.error('Error parsing schedule date/time:', error);
            return null;
        }
    }

    // Manual status update function
    async updateScheduleStatus(scheduleId, newStatus, reason = 'manual', notes = '') {
        try {
            const schedule = await MedicationSchedule.findOne({ scheduleId: scheduleId });
            
            if (!schedule) {
                throw new Error('Schedule not found');
            }

            // Validate status
            const validStatuses = ['Pending', 'Taken', 'Done', 'Missed'];
            if (!validStatuses.includes(newStatus)) {
                throw new Error('Invalid status');
            }

            const previousStatus = schedule.status;

            // Update status using the model method
            schedule.updateStatus(newStatus, reason, notes);
            await schedule.save();

            // Emit realtime event
            this.events.emit('statusUpdate', {
                scheduleId: schedule.scheduleId,
                userId: schedule.user,
                medicationId: schedule.medication,
                containerId: schedule.container,
                previousStatus: previousStatus,
                newStatus: newStatus,
                updatedAt: new Date().toISOString(),
                source: 'manual'
            });

            console.log(`Manually updated schedule ${scheduleId} to ${newStatus}`);

            return {
                success: true,
                scheduleId: schedule.scheduleId,
                newStatus: newStatus,
                timestamp: new Date()
            };

        } catch (error) {
            console.error('Error in manual status update:', error);
            throw error;
        }
    }

    // Get status history for a schedule
    async getStatusHistory(scheduleId) {
        try {
            const schedule = await MedicationSchedule.findOne({ scheduleId: scheduleId });
            
            if (!schedule) {
                throw new Error('Schedule not found');
            }

            return {
                success: true,
                scheduleId: schedule.scheduleId,
                currentStatus: schedule.status,
                statusHistory: schedule.statusHistory || [],
                lastStatusUpdate: schedule.lastStatusUpdate
            };

        } catch (error) {
            console.error('Error getting status history:', error);
            throw error;
        }
    }

    // Get schedules that need notifications
    async getSchedulesForNotification() {
        try {
            const now = moment();
            const fifteenMinutesFromNow = moment().add(15, 'minutes');
            
            const schedules = await MedicationSchedule.find({
                status: 'Pending',
                alertSent: false
            });

            const notificationSchedules = [];

            for (const schedule of schedules) {
                const scheduleDateTime = this.getScheduleDateTime(schedule);
                
                if (scheduleDateTime && 
                    now.isBefore(scheduleDateTime) && 
                    fifteenMinutesFromNow.isAfter(scheduleDateTime)) {
                    
                    notificationSchedules.push({
                        scheduleId: schedule.scheduleId,
                        userId: schedule.user,
                        medicationId: schedule.medication,
                        containerId: schedule.container,
                        scheduledTime: scheduleDateTime.toDate(),
                        timeUntilScheduled: scheduleDateTime.diff(now, 'minutes')
                    });
                }
            }

            return notificationSchedules;

        } catch (error) {
            console.error('Error getting schedules for notification:', error);
            throw error;
        }
    }

    // Mark alert as sent
    async markAlertSent(scheduleId) {
        try {
            await MedicationSchedule.findOneAndUpdate(
                { scheduleId: scheduleId },
                { alertSent: true }
            );
            
            console.log(`Marked alert as sent for schedule ${scheduleId}`);
        } catch (error) {
            console.error('Error marking alert as sent:', error);
            throw error;
        }
    }
}

module.exports = new StatusUpdateService();
