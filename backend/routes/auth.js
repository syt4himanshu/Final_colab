'use strict';

const router = require('express').Router();
const { validate, Joi } = require('../middleware/validation');
const authController = require('../controllers/authController');

router.post(
    '/login',
    validate({
        body: Joi.object({ uid: Joi.string().required(), password: Joi.string().required() }),
    }),
    authController.login
);

router.post('/logout', authController.logout);

router.post(
    '/change-password',
    validate({ body: Joi.object({ oldPassword: Joi.string().required(), newPassword: Joi.string().min(6).required() }) }),
    authController.changePassword
);

router.get('/verify-token', authController.verifyToken);

module.exports = router;


