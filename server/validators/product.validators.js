/**
 * validators/product.validators.js
 *
 * Validates fields required by the frontend product forms:
 *   - Admin product table: name, category, price, featured, available
 *   - Product detail page: name, description, price, dimensions, images
 */

const { body, query } = require('express-validator');

const createProductValidator = [
  body('name')
    .trim()
    .escape()
    .notEmpty().withMessage('Product name is required.')
    .isLength({ max: 200 }).withMessage('Name cannot exceed 200 characters.'),

  body('description')
    .trim()
    .escape()
    .notEmpty().withMessage('Description is required.'),

  body('price')
    .notEmpty().withMessage('Price is required.')
    .toFloat()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number.'),

  body('category')
    .notEmpty().withMessage('Category is required.')
    .isMongoId().withMessage('Category must be a valid ID.'),

  body('featured')
    .optional()
    .isBoolean().withMessage('Featured must be true or false.'),

  body('available')
    .optional()
    .isBoolean().withMessage('Available must be true or false.'),

  body('dimensions')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 100 }).withMessage('Dimensions cannot exceed 100 characters.'),

  body('sku')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 50 }).withMessage('SKU cannot exceed 50 characters.'),
];

const updateProductValidator = [
  body('name')
    .optional()
    .trim()
    .escape()
    .notEmpty().withMessage('Product name cannot be empty.')
    .isLength({ max: 200 }).withMessage('Name cannot exceed 200 characters.'),

  body('description')
    .optional()
    .trim()
    .escape()
    .notEmpty().withMessage('Description cannot be empty.'),

  body('price')
    .optional()
    .toFloat()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number.'),

  body('category')
    .optional()
    .isMongoId().withMessage('Category must be a valid ID.'),

  body('featured')
    .optional()
    .isBoolean().withMessage('Featured must be true or false.'),

  body('available')
    .optional()
    .isBoolean().withMessage('Available must be true or false.'),

  body('dimensions')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 100 }).withMessage('Dimensions cannot exceed 100 characters.'),
];

const searchQueryValidator = [
  query('q')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 200 }).withMessage('Search query is too long.'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer.'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),

  query('sort')
    .optional()
    .isIn(['newest', 'oldest', 'price_asc', 'price_desc', 'featured'])
    .withMessage('Invalid sort value.'),
];

module.exports = { createProductValidator, updateProductValidator, searchQueryValidator };
