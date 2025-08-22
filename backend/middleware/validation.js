'use strict';

const { celebrate, Joi, Segments } = require('celebrate');

const validate = (schema) =>
    celebrate({
        [Segments.BODY]: schema.body || Joi.object().keys({}),
        [Segments.PARAMS]: schema.params || Joi.object().keys({}),
        [Segments.QUERY]: schema.query || Joi.object().keys({}),
    });

module.exports = { validate, Joi };


