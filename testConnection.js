const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.DB_URI || 'mongodb+srv://nickclaveron:Wind4268@cluster0.onynlby.mongodb.net/pillnow?retryWrites=true&w=majority&appName=Cluster0';
console.log('MongoDB URI:', MONGO_URI);

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...');
        
        // Connect to MongoDB
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`Connected to MongoDB at: ${conn.connection.host}`);
        console.log(`Database name: ${conn.connection.name}`);

        // List all collections
        const collections = await conn.connection.db.listCollections().toArray();
        console.log('\nCollections in database:');
        collections.forEach(collection => {
            console.log(`- ${collection.name}`);
        });

        // Test each collection
        const testCollections = [
            'device_logs',
            'medication_schedules',
            'pill_identifications',
            'alerts',
            'users',
            'medications'
        ];

        console.log('\nTesting collections:');
        for (const collection of testCollections) {
            const exists = collections.some(c => c.name === collection);
            console.log(`${collection}: ${exists ? '✅ Exists' : '❌ Missing'}`);
        }

        // Close the connection
        await mongoose.connection.close();
        console.log('\nConnection closed successfully');

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

testConnection();