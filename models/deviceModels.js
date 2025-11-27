const mongoose = require('mongoose');
const Counter = require('./counterModels');

const deviceSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        unique: true
    },
    deviceName: {
        type: String,
        required: true,
        trim: true
    },
    bluetoothAddress: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    deviceType: {
        type: String,
        enum: ['pill_dispenser', 'smart_pillbox', 'bluetooth_tracker'],
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'maintenance', 'disconnected'],
        default: 'inactive'
    },
    batteryLevel: {
        type: Number,
        min: 0,
        max: 100,
        default: 100
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    firmwareVersion: {
        type: String,
        default: '1.0.0'
    },
    capabilities: [{
        type: String,
        enum: ['medication_reminder', 'adherence_tracking', 'bluetooth_connectivity', 'battery_monitoring']
    }],
    location: {
        type: String,
        trim: true
    },
    isConnected: {
        type: Boolean,
        default: false
    },
    connectionHistory: [{
        connectedAt: {
            type: Date,
            default: Date.now
        },
        disconnectedAt: {
            type: Date
        },
        duration: {
            type: Number // in minutes
        }
    }]
}, {
    timestamps: true
});

// Pre-save middleware to generate sequential ID
deviceSchema.pre('save', async function(next) {
    if (!this.deviceId) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'deviceId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.deviceId = counter.seq.toString();
    }
    next();
});

// Method to update connection status
deviceSchema.methods.updateConnectionStatus = function(isConnected) {
    const now = new Date();
    
    if (isConnected && !this.isConnected) {
        // Device is connecting
        this.isConnected = true;
        this.status = 'active';
        this.lastSeen = now;
        this.connectionHistory.push({
            connectedAt: now
        });
    } else if (!isConnected && this.isConnected) {
        // Device is disconnecting
        this.isConnected = false;
        this.status = 'disconnected';
        
        // Update the last connection record
        const lastConnection = this.connectionHistory[this.connectionHistory.length - 1];
        if (lastConnection && !lastConnection.disconnectedAt) {
            lastConnection.disconnectedAt = now;
            lastConnection.duration = Math.round((now - lastConnection.connectedAt) / (1000 * 60)); // duration in minutes
        }
    }
    
    return this;
};

// Method to update battery level
deviceSchema.methods.updateBatteryLevel = function(batteryLevel) {
    this.batteryLevel = Math.max(0, Math.min(100, batteryLevel));
    this.lastSeen = new Date();
    
    // Update status based on battery level
    if (this.batteryLevel < 20) {
        this.status = 'maintenance';
    } else if (this.batteryLevel < 10) {
        this.status = 'inactive';
    }
    
    return this;
};

module.exports = mongoose.model('Device', deviceSchema);



