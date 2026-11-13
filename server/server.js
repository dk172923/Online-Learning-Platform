const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const transporter = require('./utils/email');

const app = express();

// CORS: allow the frontend origin(s) from CLIENT_URL (comma-separated)
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);

app.use(cors({
    origin: (origin, cb) => {
        // Allow non-browser requests (curl, health checks) and listed origins
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`Origin ${origin} not allowed by CORS`));
    },
}));
app.use(express.json());

// Health check (used by the hosting platform)
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Ensure the database is connected before handling any request
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        res.status(503).json({ message: 'Database unavailable' });
    }
});

// Routes
app.use('/users', require('./routes/user'));
app.use('/instructors', require('./routes/instructor'));
app.use('/admin', require('./routes/admin'));
app.use('/forums', require('./routes/forum'));
app.use('/storage', require('./routes/storage'));

// Contact form: forwards the query to the site mailbox
app.post('/api/contact', async (req, res) => {
    const { name, email, query } = req.body || {};
    if (!name || !email || !query) {
        return res.status(400).json({ message: 'name, email and query are required' });
    }
    try {
        await transporter.sendMail({
            to: process.env.CONTACT_EMAIL,
            replyTo: email,
            subject: `LearnHub contact form: ${name}`,
            text: `From: ${name} <${email}>\n\n${query}`,
        });
        res.json({ message: 'Query submitted successfully' });
    } catch (err) {
        console.error('Contact form email failed:', err);
        res.status(500).json({ message: 'Failed to send query' });
    }
});

// Local / traditional server: `node server.js`. On Vercel the app is imported by api/index.js.
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    connectDB().catch((err) => console.error('MongoDB connection error:', err.message));
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
