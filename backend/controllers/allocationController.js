'use strict';

const { query } = require('../config/database');
const { withTransaction, createAllocation, deleteAllocation, getSummary } = require('../models/Allocation');
const { allocateStudents } = require('../utils/allocationLogic');
const XLSX = require('xlsx');

exports.autoAllocate = async (req, res) => {
    // students without mentor
    const students = await query('SELECT id, year FROM students WHERE mentor_id IS NULL ORDER BY year');
    const teachers = await query(
        `SELECT t.id, t.max_capacity, COUNT(a.id) as allocated_count
		 FROM teachers t
		 LEFT JOIN allocations a ON a.teacher_id = t.id
		 GROUP BY t.id`
    );
    const assignments = allocateStudents({ students, teachers });

    await withTransaction(async (conn) => {
        for (const a of assignments) {
            await createAllocation(a.teacher_id, a.student_id, conn);
        }
    });

    return res.json({ assigned: assignments.length });
};

exports.summary = async (req, res) => {
    const data = await getSummary();
    return res.json({ data });
};

exports.manualAssign = async (req, res) => {
    const { teacher_id, student_id } = req.body;
    await withTransaction(async (conn) => {
        await createAllocation(teacher_id, student_id, conn);
    });
    return res.status(201).json({ message: 'Assigned' });
};

exports.removeAllocation = async (req, res) => {
    await deleteAllocation(req.params.id);
    return res.status(204).send();
};

exports.exportAllocations = async (req, res) => {
    const rows = await query(
        `SELECT a.id, t.id AS teacher_id, CONCAT(t.first_name, ' ', t.last_name) AS teacher_name,
		 s.id AS student_id, CONCAT(s.first_name, ' ', s.last_name) AS student_name, s.year, a.allocated_at
		 FROM allocations a
		 JOIN teachers t ON t.id = a.teacher_id
		 JOIN students s ON s.id = a.student_id
		 ORDER BY t.id, s.year, s.id`
    );
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'allocations');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="allocations.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);
};


