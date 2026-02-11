import express from 'express';
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats
} from '../controllers/employeeController.js';
import {
  validateEmployee,
  validateEmployeeUpdate,
  validateObjectId,
  validatePagination
} from '../middleware/validation.js';

const router = express.Router();

// @route   GET /api/employees/stats
// @desc    Get employee statistics
// @access  Public
router.get('/stats', getEmployeeStats);

// @route   GET /api/employees
// @desc    Get all employees with pagination and filtering
// @access  Public
router.get('/', validatePagination, getEmployees);

// @route   POST /api/employees
// @desc    Create new employee
// @access  Public
router.post('/', validateEmployee, createEmployee);

// @route   GET /api/employees/:id
// @desc    Get single employee by ID
// @access  Public
router.get('/:id', validateObjectId('id'), getEmployee);

// @route   PUT /api/employees/:id
// @desc    Update employee by ID
// @access  Public
router.put('/:id', validateObjectId('id'), validateEmployeeUpdate, updateEmployee);

// @route   DELETE /api/employees/:id
// @desc    Delete employee by ID
// @access  Public
router.delete('/:id', validateObjectId('id'), deleteEmployee);

export default router;
