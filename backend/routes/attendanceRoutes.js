import express from 'express';
import {
  getAttendanceRecords,
  getAttendanceRecord,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceStats,
  getTodayAttendance
} from '../controllers/attendanceController.js';
import {
  validateAttendance,
  validateObjectId,
  validateAttendanceQuery
} from '../middleware/validation.js';

const router = express.Router();

// @route   GET /api/attendance/stats
// @desc    Get attendance statistics
// @access  Public
router.get('/stats', validateAttendanceQuery, getAttendanceStats);

// @route   GET /api/attendance/today
// @desc    Get today's attendance records
// @access  Public
router.get('/today', getTodayAttendance);

// @route   GET /api/attendance
// @desc    Get all attendance records with filtering and pagination
// @access  Public
router.get('/', validateAttendanceQuery, getAttendanceRecords);

// @route   POST /api/attendance
// @desc    Mark attendance for an employee
// @access  Public
router.post('/', validateAttendance, markAttendance);

// @route   GET /api/attendance/:id
// @desc    Get single attendance record by ID
// @access  Public
router.get('/:id', validateObjectId('id'), getAttendanceRecord);

// @route   PUT /api/attendance/:id
// @desc    Update attendance record by ID
// @access  Public
router.put('/:id', validateObjectId('id'), updateAttendance);

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance record by ID
// @access  Public
router.delete('/:id', validateObjectId('id'), deleteAttendance);

export default router;
