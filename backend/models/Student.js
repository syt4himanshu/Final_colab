'use strict';

const { query } = require('../config/database');

async function listStudents({ limit = 20, offset = 0, year, semester, mentorStatus }) {
    let sql = 'SELECT * FROM students WHERE 1=1';
    const params = [];
    if (year) {
        sql += ' AND year = ?';
        params.push(Number(year));
    }
    if (semester) {
        sql += ' AND semester = ?';
        params.push(Number(semester));
    }
    if (mentorStatus === 'unallocated') {
        sql += ' AND mentor_id IS NULL';
    }
    if (mentorStatus === 'allocated') {
        sql += ' AND mentor_id IS NOT NULL';
    }
    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    return query(sql, params);
}

async function getStudentById(id) {
    const rows = await query('SELECT * FROM students WHERE id = ?', [id]);
    const student = rows[0] || null;
    if (!student) return null;
    const records = await query('SELECT * FROM academic_records WHERE student_id = ? ORDER BY semester', [id]);
    student.academic_records = records;
    return student;
}

async function updateStudent(id, updates) {
    const fields = [];
    const params = [];
    for (const [key, value] of Object.entries(updates)) {
        fields.push(`${key} = ?`);
        params.push(value);
    }
    params.push(id);
    await query(`UPDATE students SET ${fields.join(', ')} WHERE id = ?`, params);
    return getStudentById(id);
}

async function listUnallocated() {
    return query('SELECT * FROM students WHERE mentor_id IS NULL ORDER BY id DESC');
}

module.exports = { listStudents, getStudentById, updateStudent, listUnallocated };


