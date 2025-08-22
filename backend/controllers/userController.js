'use strict';

const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { createUser: modelCreateUser, listUsers: modelListUsers, updateUser: modelUpdateUser, deleteUser: modelDeleteUser } = require('../models/User');
const { parseUsersFromExcel } = require('../utils/excelHandler');

exports.listUsers = async (req, res) => {
    const { page = 1, limit = 20, role, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const data = await modelListUsers({ limit: Number(limit), offset, role, search });
    return res.json({ data, page: Number(page), limit: Number(limit) });
};

exports.createUser = async (req, res) => {
    const { uid, password, role } = req.body;
    const existing = await query('SELECT id FROM users WHERE uid = ?', [uid]);
    if (existing.length) return res.status(409).json({ message: 'UID already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await modelCreateUser({ uid, passwordHash, role });
    return res.status(201).json(user);
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
    }
    const mapped = {};
    if (updates.password) mapped.password = updates.password;
    if (updates.role) mapped.role = updates.role;
    if (updates.status) mapped.status = updates.status;
    const user = await modelUpdateUser(id, mapped);
    return res.json(user);
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    await modelDeleteUser(id);
    return res.status(204).send();
};

exports.bulkUpload = async (req, res) => {
    const filePath = req.file?.path || req.body.filePath;
    if (!filePath) return res.status(400).json({ message: 'file required' });
    const records = await parseUsersFromExcel(filePath);
    const created = [];
    for (const rec of records) {
        const existing = await query('SELECT id FROM users WHERE uid = ?', [rec.uid]);
        if (existing.length) continue;
        const passwordHash = await bcrypt.hash(rec.password || rec.uid, 10);
        const user = await modelCreateUser({ uid: rec.uid, passwordHash, role: rec.role || 'student' });
        created.push(user);
    }
    return res.json({ createdCount: created.length, created });
};


