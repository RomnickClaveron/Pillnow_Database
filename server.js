const dotenv = require('dotenv'); // Require dotenv first
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');

const app = express(); // Initialize app before using it
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000; // Provide a default port
const MONGO_URI = process.env.DB_URI;

mongoose.connect(MONGO_URI, {})
.then(() => {
    try {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
        
    } catch (error) {
        console.error('Error starting the server:', error);
        
    }
    console.log('MongoDB connected successfully');
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
});