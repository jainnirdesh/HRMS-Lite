import { body, param, query, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Employee validation rules
export const validateEmployee = [
  body('employeeId')
    .optional({ values: 'falsy' }) // Treat empty strings as undefined
    .trim()
    .matches(/^EMP\d{3,}$/)
    .withMessage('Employee ID must be in format EMP001, EMP002, etc.'),
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 255 })
    .withMessage('Email cannot exceed 255 characters'),
  
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required')
    .isIn(['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design'])
    .withMessage('Department must be one of: Engineering, Marketing, Sales, HR, Finance, Operations, Design'),
  
  handleValidationErrors
];

// Employee update validation (all fields optional)
export const validateEmployeeUpdate = [
  body('employeeId')
    .optional()
    .trim()
    .matches(/^EMP\d{3,}$/)
    .withMessage('Employee ID must be in format EMP001, EMP002, etc.'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('email')
    .optional()
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 255 })
    .withMessage('Email cannot exceed 255 characters'),
  
  body('department')
    .optional()
    .trim()
    .isIn(['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design'])
    .withMessage('Department must be one of: Engineering, Marketing, Sales, HR, Finance, Operations, Design'),
  
  handleValidationErrors
];

// Attendance validation rules
export const validateAttendance = [
  body('employeeId')
    .trim()
    .notEmpty()
    .withMessage('Employee ID is required')
    .isMongoId()
    .withMessage('Invalid employee ID format'),
  
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be in valid ISO format (YYYY-MM-DD)')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      if (date > today) {
        throw new Error('Attendance date cannot be in the future');
      }
      
      // Check if date is not too old (optional: limit to last 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      if (date < ninetyDaysAgo) {
        throw new Error('Attendance date cannot be older than 90 days');
      }
      
      return true;
    }),
  
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Attendance status is required')
    .isIn(['Present', 'Absent'])
    .withMessage('Status must be either Present or Absent'),
  
  handleValidationErrors
];

// MongoDB ObjectId validation
export const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`),
  
  handleValidationErrors
];

// Query validation for attendance records
export const validateAttendanceQuery = [
  query('employeeId')
    .optional()
    .isMongoId()
    .withMessage('Invalid employee ID format'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be in valid ISO format (YYYY-MM-DD)'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be in valid ISO format (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (req.query.startDate && value) {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(value);
        
        if (endDate < startDate) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),
  
  query('status')
    .optional()
    .isIn(['Present', 'Absent'])
    .withMessage('Status must be either Present or Absent'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];
