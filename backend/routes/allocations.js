'use strict';

const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validate, Joi } = require('../middleware/validation');
const controller = require('../controllers/allocationController');

router.post('/auto-allocate', authenticate, requireRole('admin'), controller.autoAllocate);
router.get('/summary', authenticate, controller.summary);
router.post(
    '/manual',
    authenticate,
    requireRole('admin'),
    validate({ body: Joi.object({ teacher_id: Joi.number().integer().required(), student_id: Joi.number().integer().required() }) }),
    controller.manualAssign
);
router.delete('/:id', authenticate, requireRole('admin'), controller.removeAllocation);
router.get('/export', authenticate, requireRole('admin'), controller.exportAllocations);

module.exports = router;


