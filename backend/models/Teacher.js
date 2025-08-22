'use strict';

const { query } = require('../config/database');

async function listTeachersWithCounts() {
    const sql = `
		SELECT t.*, 
			(SELECT COUNT(*) FROM allocations a WHERE a.teacher_id = t.id) AS allocated_count
		FROM teachers t
		ORDER BY t.id DESC
	`;
    return query(sql);
}

async function getTeacherById(id) {
    const rows = await query('SELECT * FROM teachers WHERE id = ?', [id]);
    return rows[0] || null;
}

async function getStudentsOfTeacher(id) {
    const sql = `
		SELECT s.* FROM students s
		INNER JOIN allocations a ON a.student_id = s.id
		WHERE a.teacher_id = ?
		ORDER BY s.id DESC
	`;
    return query(sql, [id]);
}

async function updateCapacity(id, maxCapacity) {
    await query('UPDATE teachers SET max_capacity = ? WHERE id = ?', [maxCapacity, id]);
    return getTeacherById(id);
}

module.exports = { listTeachersWithCounts, getTeacherById, getStudentsOfTeacher, updateCapacity };


