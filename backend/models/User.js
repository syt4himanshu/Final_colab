'use strict';

const { query } = require('../config/database');

async function createUser({ uid, passwordHash, role = 'student', status = 'active' }) {
    const result = await query(
        'INSERT INTO users (uid, password, role, status) VALUES (?, ?, ?, ?)',
        [uid, passwordHash, role, status]
    );
    return { id: result.insertId, uid, role, status };
}

async function findById(id) {
    const rows = await query('SELECT id, uid, role, status, created_at, updated_at FROM users WHERE id = ?', [id]);
    return rows[0] || null;
}

async function listUsers({ limit = 20, offset = 0, role, search }) {
    let sql = 'SELECT id, uid, role, status, created_at FROM users WHERE 1=1';
    const params = [];
    if (role) {
        sql += ' AND role = ?';
        params.push(role);
    }
    if (search) {
        sql += ' AND (uid LIKE ?)';
        params.push(`%${search}%`);
    }
    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    return query(sql, params);
}

async function updateUser(id, updates) {
    const fields = [];
    const params = [];
    for (const [key, value] of Object.entries(updates)) {
        fields.push(`${key} = ?`);
        params.push(value);
    }
    params.push(id);
    await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
    return findById(id);
}

async function deleteUser(id) {
    await query('DELETE FROM users WHERE id = ?', [id]);
}

module.exports = { createUser, findById, listUsers, updateUser, deleteUser };


