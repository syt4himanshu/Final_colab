'use strict';

const Student = require('../models/Student');

exports.listStudents = async (req, res) => {
    const { page = 1, limit = 20, year, semester, mentorStatus } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const data = await Student.listStudents({ limit: Number(limit), offset, year, semester, mentorStatus });
    return res.json({ data, page: Number(page), limit: Number(limit) });
};

exports.getStudent = async (req, res) => {
    const student = await Student.getStudentById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    return res.json(student);
};

exports.updateStudent = async (req, res) => {
    const updated = await Student.updateStudent(req.params.id, req.body);
    return res.json(updated);
};

exports.unallocated = async (req, res) => {
    const data = await Student.listUnallocated();
    return res.json({ data });
};


