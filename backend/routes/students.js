'use strict';

const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validate, Joi } = require('../middleware/validation');
const controller = require('../controllers/studentController');

router.get('/', authenticate, controller.listStudents);
router.get('/unallocated', authenticate, controller.unallocated);
router.get('/:id', authenticate, controller.getStudent);
router.put(
    '/:id',
    authenticate,
    requireRole('admin', 'teacher'),
    validate({ params: Joi.object({ id: Joi.number().integer().required() }), body: Joi.object().unknown(true) }),
    controller.updateStudent
);

module.exports = router;


