/**
 * validators/category.validators.js
 */

const { body } = require('express-validator');

const categoryValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required.')
    .isLength({ max: 80 }).withMessage('Name cannot exceed 80 characters.'),

  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Icon value cannot exceed 50 characters.'),

  body('description')
    .optional()
    .trim(),
];

module.exports = { categoryValidator };
