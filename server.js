const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGO_URI = process.env.DB_URI || 'mongodb+srv://nickclaveron:Wind4268@cluster0.onynlby.mongodb.net/pillnow?retryWrites=true&w=majority&appName=Cluster0';

console.log('Attempting to connect to MongoDB with URI:', MONGO_URI);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Create collections if they don't exist
        const collections = [
            'device_logs',
            'medication_schedules',
            'pill_identifications',
            'alerts',
            'users',
            'medications'
        ];

        for (const collection of collections) {
            try {
                await conn.connection.db.createCollection(collection);
                console.log(`Collection ${collection} created successfully`);
            } catch (err) {
                if (err.code !== 48) { // 48 is the code for collection already exists
                    console.error(`Error creating collection ${collection}:`, err);
                }
            }
        }
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// Connect to MongoDB
connectDB();

// Routes
const deviceLogsRoutes = require('./routes/deviceLogsRoutes');
const medicationScheduleRoutes = require('./routes/medicationScheduleRoutes');
const pillIdentificationRoutes = require('./routes/pillIdentificationRoutes');
const alertsRoutes = require('./routes/alertsRoutes');

app.use('/api/device-logs', deviceLogsRoutes);
app.use('/api/medication-schedules', medicationScheduleRoutes);
app.use('/api/pill-identification', pillIdentificationRoutes);
app.use('/api/alerts', alertsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});