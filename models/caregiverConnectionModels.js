const mongoose = require('mongoose');
const Counter = require('./counterModels');

const caregiverConnectionSchema = new mongoose.Schema({
    connectionId: {
        type: String,
        unique: true
    },
    caregiver: {
        type: Number,
        ref: 'User',
        required: true
    },
    elder: {
        type: Number,
        ref: 'User',
        required: true
    },
    device: {
        type: String,
        ref: 'Device',
        required: true
    },
    relationship: {
        type: String,
        enum: ['family', 'professional_caregiver', 'friend', 'neighbor'],
        required: true
    },
    permissions: {
        viewMedications: {
            type: Boolean,
            default: true
        },
        manageMedications: {
            type: Boolean,
            default: false
        },
        viewAdherence: {
            type: Boolean,
            default: true
        },
        receiveAlerts: {
            type: Boolean,
            default: true
        },
        manageDevice: {
            type: Boolean,
            default: false
        }
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending', 'suspended'],
        default: 'pending'
    },
    connectedAt: {
        type: Date,
        default: Date.now
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        trim: true
    },
    // Track device-specific settings for this caregiver-elder-device combination
    deviceSettings: {
        alertFrequency: {
            type: String,
            enum: ['immediate', 'hourly', 'daily', 'weekly'],
            default: 'immediate'
        },
        quietHours: {
            start: {
                type: String,
                default: '22:00'
            },
            end: {
                type: String,
                default: '08:00'
            }
        },
        preferredContactMethod: {
            type: String,
            enum: ['push_notification', 'email', 'sms', 'all'],
            default: 'push_notification'
        }
    },
    // Track adherence monitoring preferences
    monitoringSettings: {
        trackMissedDoses: {
            type: Boolean,
            default: true
        },
        trackLateDoses: {
            type: Boolean,
            default: true
        },
        lateThreshold: {
            type: Number,
            default: 30 // minutes
        },
        generateReports: {
            type: Boolean,
            default: true
        },
        reportFrequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
            default: 'weekly'
        }
    }
}, {
    timestamps: true
});

// Pre-save middleware to generate sequential ID
caregiverConnectionSchema.pre('save', async function(next) {
    if (!this.connectionId) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'connectionId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.connectionId = counter.seq.toString();
    }
    next();
});

// Method to update last activity
caregiverConnectionSchema.methods.updateActivity = function() {
    this.lastActivity = new Date();
    return this;
};

// Method to check if caregiver has permission
caregiverConnectionSchema.methods.hasPermission = function(permission) {
    return this.permissions[permission] === true;
};

// Method to update permissions
caregiverConnectionSchema.methods.updatePermissions = function(newPermissions) {
    this.permissions = { ...this.permissions, ...newPermissions };
    this.lastActivity = new Date();
    return this;
};

// Method to activate/deactivate connection
caregiverConnectionSchema.methods.updateStatus = function(newStatus) {
    this.status = newStatus;
    this.lastActivity = new Date();
    
    if (newStatus === 'active') {
        this.connectedAt = new Date();
    }
    
    return this;
};

// Static method to find active connections for a caregiver
caregiverConnectionSchema.statics.findActiveByCaregiver = function(caregiverId) {
    return this.find({ 
        caregiver: caregiverId, 
        status: 'active' 
    }).populate('elder', 'name email phone').populate('device', 'deviceName deviceType status');
};

// Static method to find active connections for an elder
caregiverConnectionSchema.statics.findActiveByElder = function(elderId) {
    return this.find({ 
        elder: elderId, 
        status: 'active' 
    }).populate('caregiver', 'name email phone').populate('device', 'deviceName deviceType status');
};

module.exports = mongoose.model('CaregiverConnection', caregiverConnectionSchema);



