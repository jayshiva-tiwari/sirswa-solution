const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_system';


const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log('✅ MongoDB connected successfully');
        console.log('📍 Database:', MONGODB_URI);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.log('💡 Make sure MongoDB is running');
        process.exit(1); // Stop server if DB fails
    }
};

module.exports = connectDB;