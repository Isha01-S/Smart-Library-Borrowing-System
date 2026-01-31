const express = require('express');
const cors = require('cors');
require('dotenv').config();

// DB connection
const db = require('./db');

// Create app AFTER requiring express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes (auth should come AFTER app is created)
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

const borrowRouter = require('./routes/borrow');
app.use('/borrow', borrowRouter);

// Test route
app.get('/', (req, res) => {
    res.send('Smart Library API Running');
});



// Start server
app.listen(5000, () => {
    console.log('Server running on port 5000');
});
