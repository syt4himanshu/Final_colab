'use strict';

const router = require('express').Router();
const { validate, Joi } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const userController = require('../controllers/userController');
const { upload } = require('../middleware/upload');

router.use(authenticate, requireRole('admin'));

router.get('/', userController.listUsers);
router.post(
    '/',
    validate({
        body: Joi.object({ uid: Joi.string().required(), password: Joi.string().min(6).required(), role: Joi.string().valid('admin', 'teacher', 'student').required() }),
    }),
    userController.createUser
);
router.put(
    '/:id',
    validate({ params: Joi.object({ id: Joi.number().integer().required() }) }),
    userController.updateUser
);
router.delete(
    '/:id',
    validate({ params: Joi.object({ id: Joi.number().integer().required() }) }),
    userController.deleteUser
);

router.post('/bulk-upload', upload.single('file'), userController.bulkUpload);

module.exports = router;


