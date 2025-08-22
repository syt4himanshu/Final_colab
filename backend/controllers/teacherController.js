'use strict';

const Teacher = require('../models/Teacher');

exports.listTeachers = async (req, res) => {
    const data = await Teacher.listTeachersWithCounts();
    return res.json({ data });
};

exports.getTeacher = async (req, res) => {
    const teacher = await Teacher.getTeacherById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    return res.json(teacher);
};

exports.getTeacherStudents = async (req, res) => {
    const students = await Teacher.getStudentsOfTeacher(req.params.id);
    return res.json({ data: students });
};

exports.updateTeacher = async (req, res) => {
    const { max_capacity } = req.body;
    const updated = await Teacher.updateCapacity(req.params.id, Number(max_capacity));
    return res.json(updated);
};


