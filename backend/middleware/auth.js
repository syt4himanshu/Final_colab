'use strict';

const { verifyAccessToken } = require('../config/auth');

function getTokenFromRequest(req) {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    if (req.cookies && req.cookies.accessToken) {
        return req.cookies.accessToken;
    }
    return null;
}

function authenticate(req, res, next) {
    try {
        const token = getTokenFromRequest(req);
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        return next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

function attachUserIfPresent(req, res, next) {
    try {
        const token = getTokenFromRequest(req);
        if (!token) return next();
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        return next();
    } catch (err) {
        return next();
    }
}

module.exports = {
    authenticate,
    attachUserIfPresent,
};


