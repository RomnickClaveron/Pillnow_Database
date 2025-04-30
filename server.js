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
const MONGO_URI = process.env.DB_URI;

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
                if (err.code !== 48) {
                    console.error(`Error creating collection ${collection}:`, err);
                }
            }
        }

        // Start the server after DB is ready
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// Connect to MongoDB and start server
connectDB();

// Routes
const deviceLogsRoutes = require('./routes/deviceLogsRoutes');
const medicationScheduleRoutes = require('./routes/medicationScheduleRoutes');
const pillIdentificationRoutes = require('./routes/pillIdentificationRoutes');
const alertsRoutes = require('./routes/alertsRoutes');
const userRoutes = require('./routes/userRoutes');
const medicationRoutes = require('./routes/medicationRoutes');

app.use('/api/device-logs', deviceLogsRoutes);
app.use('/api/medication-schedules', medicationScheduleRoutes);
app.use('/api/pill-identification', pillIdentificationRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medications', medicationRoutes);

// Test route
// app.get('/api/test', (req, res) => {
//     res.json({ message: 'API is working!' });
// });

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;
 app;
