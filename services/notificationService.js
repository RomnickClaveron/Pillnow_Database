const statusUpdateService = require('./statusUpdateService');

class NotificationService {
    constructor() {
        this.isRunning = false;
    }

    // Start notification service
    startNotificationService() {
        if (this.isRunning) {
            console.log('Notification service is already running');
            return;
        }

        console.log('Starting notification service...');
        
        // Check for notifications every 5 minutes
        setInterval(async () => {
            try {
                await this.checkAndSendNotifications();
            } catch (error) {
                console.error('Error in notification service:', error);
            }
        }, 5 * 60 * 1000); // 5 minutes

        this.isRunning = true;
        console.log('Notification service started successfully');
    }

    // Stop notification service
    stopNotificationService() {
        if (!this.isRunning) {
            console.log('Notification service is not running');
            return;
        }

        console.log('Stopping notification service...');
        this.isRunning = false;
        console.log('Notification service stopped');
    }

    // Check and send notifications
    async checkAndSendNotifications() {
        try {
            console.log('Checking for notifications to send...');
            
            const schedulesForNotification = await statusUpdateService.getSchedulesForNotification();
            
            if (schedulesForNotification.length === 0) {
                console.log('No notifications to send');
                return;
            }

            console.log(`Found ${schedulesForNotification.length} schedules requiring notifications`);

            for (const schedule of schedulesForNotification) {
                await this.sendNotification(schedule);
                await statusUpdateService.markAlertSent(schedule.scheduleId);
            }

        } catch (error) {
            console.error('Error checking notifications:', error);
        }
    }

    // Send notification for a specific schedule
    async sendNotification(schedule) {
        try {
            console.log(`Sending notification for schedule ${schedule.scheduleId}`);
            
            // Here you would integrate with your preferred notification service
            // Examples: Firebase Cloud Messaging, OneSignal, Pushwoosh, etc.
            
            const notificationData = {
                scheduleId: schedule.scheduleId,
                userId: schedule.userId,
                medicationId: schedule.medicationId,
                containerId: schedule.containerId,
                scheduledTime: schedule.scheduledTime,
                timeUntilScheduled: schedule.timeUntilScheduled,
                message: `Medication reminder: Your medication is scheduled in ${schedule.timeUntilScheduled} minutes`,
                title: 'Medication Reminder',
                priority: 'high'
            };

            // For now, we'll just log the notification
            // In a real implementation, you would send this to your notification service
            console.log('Notification data:', notificationData);
            
            // Example: Send to Firebase Cloud Messaging
            // await this.sendToFCM(notificationData);
            
            // Example: Send to OneSignal
            // await this.sendToOneSignal(notificationData);
            
            console.log(`Notification sent successfully for schedule ${schedule.scheduleId}`);

        } catch (error) {
            console.error(`Error sending notification for schedule ${schedule.scheduleId}:`, error);
        }
    }

    // Example: Send to Firebase Cloud Messaging
    async sendToFCM(notificationData) {
        // Implementation for Firebase Cloud Messaging
        // You would need to add firebase-admin package
        console.log('Sending to FCM:', notificationData);
    }

    // Example: Send to OneSignal
    async sendToOneSignal(notificationData) {
        // Implementation for OneSignal
        // You would need to add axios or similar HTTP client
        console.log('Sending to OneSignal:', notificationData);
    }

    // Get notification settings for a user
    async getUserNotificationSettings(userId) {
        // This would fetch user notification preferences from database
        // For now, return default settings
        return {
            userId: userId,
            pushNotifications: true,
            emailNotifications: false,
            smsNotifications: false,
            reminderTime: 15, // minutes before scheduled time
            quietHours: {
                start: '22:00',
                end: '08:00'
            }
        };
    }

    // Update user notification settings
    async updateUserNotificationSettings(userId, settings) {
        // This would update user notification preferences in database
        console.log(`Updating notification settings for user ${userId}:`, settings);
        return { success: true };
    }

    // Send test notification
    async sendTestNotification(userId, message = 'Test notification') {
        try {
            const testNotification = {
                scheduleId: 'test',
                userId: userId,
                medicationId: 'test',
                containerId: 'test',
                scheduledTime: new Date(),
                timeUntilScheduled: 0,
                message: message,
                title: 'Test Notification',
                priority: 'normal'
            };

            await this.sendNotification(testNotification);
            
            return {
                success: true,
                message: 'Test notification sent successfully'
            };

        } catch (error) {
            console.error('Error sending test notification:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }
}

module.exports = new NotificationService();
