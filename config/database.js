const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    let attempts = 0;
    const maxAttempts = 5;
    
    // Use environment variable or fallback to MongoDB Atlas
    const MONGO_URI = process.env.MONGO_URI ;

    while (attempts < maxAttempts) {
        try {
            await mongoose.connect(MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            console.log('MongoDB connected successfully');
            return;
        } catch (error) {
            attempts++;
            console.log(`MongoDB connection failed (attempt ${attempts}/${maxAttempts}):`, error.message);
            
            if (attempts < maxAttempts) {
                console.log(`Retrying in 3 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 3000));
            } else {
                console.error('Failed to connect to MongoDB after multiple attempts');
                process.exit(1);
            }
        }
    }
};

module.exports = { connectDB };
