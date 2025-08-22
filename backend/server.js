'use strict';

require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const xss = require('xss-clean');
const morgan = require('morgan');

const logger = require('./utils/logger');
const { attachUserIfPresent } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const teacherRoutes = require('./routes/teachers');
const studentRoutes = require('./routes/students');
const allocationRoutes = require('./routes/allocations');

const app = express();

// Trust proxy if behind one (e.g., render/heroku/nginx)
app.set('trust proxy', 1);

// Security & parsers
app.use(helmet());
app.use(xss());
const allowedOrigins = (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [
    'http://localhost:5002',
    'http://127.0.0.1:5002',
    'null',
]).map(s => s.trim());
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl) and file:// which sends 'null'
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Basic rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use(limiter);

// CSRF protection for cookie-based flows; opt-out for token auth endpoints
const csrfProtection = csrf({ cookie: true });
app.use((req, res, next) => {
    // Disable CSRF entirely for all API routes (they use JWT instead)
    if (req.path.startsWith('/api/')) return next();
    return csrfProtection(req, res, next);
});


// Attach user if access token is present
app.use(attachUserIfPresent);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/allocations', allocationRoutes);

// Health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Celebrate/Joi error handler
const { errors } = require('celebrate');
app.use(errors());

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    logger.error(err);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ message: err.message || 'Internal Server Error' });
});

app.get('/api/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${PORT}`);
});


