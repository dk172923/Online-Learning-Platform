// config/db.js - cached connection so serverless invocations reuse it
const mongoose = require('mongoose');

let connecting = null;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) return mongoose.connection;
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not set. Add it to server/.env (see server/.env.example).');
    }
    if (!connecting) {
        connecting = mongoose
            .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
            .then((m) => { console.log('Connected to MongoDB'); return m.connection; })
            .catch((err) => { connecting = null; throw err; });
    }
    return connecting;
};

module.exports = connectDB;
