import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all employees
// @route   GET /api/employees
// @access  Public
export const getEmployees = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, department, search } = req.query;

  // Build query
  const query = {};
  if (department) query.department = department;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Execute query with pagination
  const employees = await Employee.find(query)
    .select('-__v')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await Employee.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: employees,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalRecords: total,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
});

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Public
export const getEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id).select('-__v');

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  // Get employee's attendance summary
  const attendanceStats = await Attendance.aggregate([
    { $match: { employeeId: employee._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const stats = { Present: 0, Absent: 0, Total: 0 };
  attendanceStats.forEach(stat => {
    stats[stat._id] = stat.count;
    stats.Total += stat.count;
  });

  res.status(200).json({
    success: true,
    data: {
      ...employee.toObject(),
      attendanceStats: stats
    }
  });
});

// @desc    Create new employee
// @route   POST /api/employees
// @access  Public
export const createEmployee = asyncHandler(async (req, res) => {
  const { employeeId, name, email, department } = req.body;

  // Check if employee ID already exists (if provided)
  if (employeeId) {
    const existingEmployeeId = await Employee.findOne({ employeeId });
    if (existingEmployeeId) {
      return res.status(400).json({
        success: false,
        message: `Employee ID '${employeeId}' already exists`
      });
    }
  }

  // Check if email already exists
  const existingEmail = await Employee.findOne({ email });
  if (existingEmail) {
    return res.status(400).json({
      success: false,
      message: `Email address '${email}' is already registered`
    });
  }

  const employee = await Employee.create({
    employeeId,
    name,
    email,
    department
  });

  res.status(201).json({
    success: true,
    message: 'Employee created successfully',
    data: employee
  });
});

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Public
export const updateEmployee = asyncHandler(async (req, res) => {
  const { employeeId, name, email, department } = req.body;

  // Check if employee exists
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  // Check for duplicate employee ID (if being updated)
  if (employeeId && employeeId !== employee.employeeId) {
    const existingEmployeeId = await Employee.findOne({ 
      employeeId, 
      _id: { $ne: req.params.id } 
    });
    if (existingEmployeeId) {
      return res.status(400).json({
        success: false,
        message: `Employee ID '${employeeId}' already exists`
      });
    }
  }

  // Check for duplicate email (if being updated)
  if (email && email !== employee.email) {
    const existingEmail = await Employee.findOne({ 
      email, 
      _id: { $ne: req.params.id } 
    });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `Email address '${email}' is already registered`
      });
    }
  }

  const updatedEmployee = await Employee.findByIdAndUpdate(
    req.params.id,
    { employeeId, name, email, department },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    message: 'Employee updated successfully',
    data: updatedEmployee
  });
});

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Public
export const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  // Delete all attendance records for this employee
  await Attendance.deleteMany({ employeeId: req.params.id });

  // Delete the employee
  await Employee.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Employee and related attendance records deleted successfully'
  });
});

// @desc    Get employee statistics
// @route   GET /api/employees/stats
// @access  Public
export const getEmployeeStats = asyncHandler(async (req, res) => {
  // Get total employees count
  const totalEmployees = await Employee.countDocuments();

  // Get employees by department
  const departmentStats = await Employee.aggregate([
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get today's attendance stats
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const todayAttendanceStats = await Attendance.aggregate([
    {
      $match: {
        date: {
          $gte: startOfDay,
          $lt: endOfDay
        }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const attendanceStats = { Present: 0, Absent: 0 };
  todayAttendanceStats.forEach(stat => {
    attendanceStats[stat._id] = stat.count;
  });

  res.status(200).json({
    success: true,
    data: {
      totalEmployees,
      presentToday: attendanceStats.Present,
      absentToday: attendanceStats.Absent,
      departmentBreakdown: departmentStats
    }
  });
});
