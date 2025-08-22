'use strict';

const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } = require('../config/auth');

async function findUserByUid(uid) {
    const users = await query('SELECT * FROM users WHERE uid = ?', [uid]);
    return users[0] || null;
}

exports.login = async (req, res) => {
    const { uid, password } = req.body;
    const user = await findUserByUid(uid);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.status !== 'active') return res.status(403).json({ message: 'Account inactive' });

    const payload = { id: user.id, uid: user.uid, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    res.json({ accessToken, refreshToken, user: payload });
};

exports.logout = async (req, res) => {
    // stateless JWT: let client discard tokens; optionally invalidate refresh token in store
    return res.json({ message: 'Logged out' });
};

exports.changePassword = async (req, res) => {
    const authHeader = req.headers['authorization'] || '';
    if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
    const token = authHeader.substring(7);
    let decoded;
    try {
        decoded = verifyAccessToken(token);
    } catch (e) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    const { oldPassword, newPassword } = req.body;
    const users = await query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    const user = users[0];
    if (!user) return res.status(404).json({ message: 'User not found' });
    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) return res.status(400).json({ message: 'Old password incorrect' });
    const hash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password = ? WHERE id = ?', [hash, decoded.id]);
    return res.json({ message: 'Password updated' });
};

exports.verifyToken = async (req, res) => {
    const token = req.headers['authorization']?.startsWith('Bearer ')
        ? req.headers['authorization'].substring(7)
        : null;
    if (!token) return res.status(400).json({ valid: false });
    try {
        const decoded = verifyAccessToken(token);
        return res.json({ valid: true, user: { id: decoded.id, uid: decoded.uid, role: decoded.role } });
    } catch (e) {
        return res.status(401).json({ valid: false });
    }
};


