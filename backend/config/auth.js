'use strict';

require('dotenv').config();
const jwt = require('jsonwebtoken');

const {
    JWT_ACCESS_SECRET = 'dev_access_secret',
    JWT_REFRESH_SECRET = 'dev_refresh_secret',
    JWT_ACCESS_EXPIRES = '15m',
    JWT_REFRESH_EXPIRES = '7d',
} = process.env;

function signAccessToken(payload) {
    return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRES });
}

function signRefreshToken(payload) {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES });
}

function verifyAccessToken(token) {
    return jwt.verify(token, JWT_ACCESS_SECRET);
}

function verifyRefreshToken(token) {
    return jwt.verify(token, JWT_REFRESH_SECRET);
}

module.exports = {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};


