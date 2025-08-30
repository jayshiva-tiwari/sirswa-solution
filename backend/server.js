const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const leadRoutes = require('./routes/leads'); // leads routes
const clientRoutes = require('./routes/clients'); // client routes
const expenseRoutes = require('./routes/expenses'); // expenses routes
const statsRoutes = require('./routes/stats'); // stats routes
const tasksRoutes = require('./routes/tasks');
const metricsRoutes = require('./routes/metrics'); // metrics routes


// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
    origin: [process.env.BASE_URL || 'http://localhost:3000' , 'https://crm.sirswasolutions.com'], // Allow requests from the frontend
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
connectDB()

// Test route
app.get('/', (req, res) => {
    res.json({
        message: 'Backend server is running!',
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// Routes - Make sure the auth.js file exists and exports a router
try {
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes loaded');
} catch (error) {
    console.error('❌ Error loading auth routes:', error.message);

    // Fallback routes if file not found
    app.get('/api/auth/test', (req, res) => {
        res.json({ message: 'Auth route file not found, using fallback' });
    });
}

// Tasks routes
app.use('/api/tasks', tasksRoutes);
console.log('✅ Tasks routes loaded');

// Leads routes
app.use('/api/leads', leadRoutes); // Add this line
console.log('✅ Lead routes loaded');


// client routes
app.use('/api/clients', clientRoutes);
console.log('✅ Client routes loaded');


app.use('/api/expenses', expenseRoutes);
console.log('✅ Expense routes loaded');

app.use('/api/stats', statsRoutes);
console.log('✅ Stats routes loaded');

// metrics routes
app.use('/api/metrics', metricsRoutes);
console.log('✅ Metrics routes loaded');

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.path,
        method: req.method
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log('================================================');
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`📍 Local: http://localhost:${PORT}`);
    console.log(`📍 Test Auth: http://localhost:${PORT}/api/auth/test`);
    console.log('================================================');
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
    } else {
        console.error('❌ Server error:', error);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});