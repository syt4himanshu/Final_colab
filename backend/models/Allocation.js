'use strict';

const { query, getConnection } = require('../config/database');

async function createAllocation(teacherId, studentId, conn = null) {
    const executor = conn || { query: (sql, params) => query(sql, params) };
    await executor.query('INSERT INTO allocations (teacher_id, student_id) VALUES (?, ?)', [teacherId, studentId]);
    await executor.query('UPDATE students SET mentor_id = ? WHERE id = ?', [teacherId, studentId]);
}

async function deleteAllocation(id) {
    // find allocation to remove mentor link
    const rows = await query('SELECT * FROM allocations WHERE id = ?', [id]);
    const alloc = rows[0];
    if (!alloc) return;
    await query('DELETE FROM allocations WHERE id = ?', [id]);
    await query('UPDATE students SET mentor_id = NULL WHERE id = ?', [alloc.student_id]);
}

async function getSummary() {
    const sql = `
		SELECT t.id as teacher_id, CONCAT(t.first_name, ' ', t.last_name) as teacher_name, t.max_capacity,
			COUNT(a.id) as allocated
		FROM teachers t
		LEFT JOIN allocations a ON a.teacher_id = t.id
		GROUP BY t.id
		ORDER BY t.id
	`;
    return query(sql);
}

async function withTransaction(callback) {
    const conn = await getConnection();
    try {
        await conn.beginTransaction();
        const result = await callback(conn);
        await conn.commit();
        conn.release();
        return result;
    } catch (err) {
        await conn.rollback();
        conn.release();
        throw err;
    }
}

module.exports = { createAllocation, deleteAllocation, getSummary, withTransaction };


