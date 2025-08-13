const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const statusUpdateService = require('./services/statusUpdateService');
const notificationService = require('./services/notificationService');
const { initWebsocket } = require('./services/websocketService');

const app = express();
const server = http.createServer(app);

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

		// Start the automatic status update service
		console.log('Initializing automatic status update service...');
		statusUpdateService.startAutomaticUpdates();

		// Start the notification service
		console.log('Initializing notification service...');
		notificationService.startNotificationService();

		// Initialize WebSocket service
		console.log('Initializing WebSocket service...');
		initWebsocket(server);

		// Start the server after DB is ready
		const PORT = process.env.PORT || 3000;
		server.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
			console.log('Automatic status update service is active');
			console.log('Notification service is active');
			console.log('WebSocket service is active');
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

app.use('/api/device_logs', deviceLogsRoutes);
app.use('/api/medication_schedules', medicationScheduleRoutes);
app.use('/api/pill_identification', pillIdentificationRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medications', medicationRoutes);

// Error handler
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;
