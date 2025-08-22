'use strict';

const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validate, Joi } = require('../middleware/validation');
const controller = require('../controllers/teacherController');

router.get('/', authenticate, controller.listTeachers);
router.get('/:id', authenticate, controller.getTeacher);
router.get('/:id/students', authenticate, controller.getTeacherStudents);
router.put(
    '/:id',
    authenticate,
    requireRole('admin'),
    validate({ params: Joi.object({ id: Joi.number().integer().required() }), body: Joi.object({ max_capacity: Joi.number().integer().min(1).required() }) }),
    controller.updateTeacher
);

module.exports = router;


