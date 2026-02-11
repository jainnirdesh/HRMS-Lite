import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Public
export const getAttendanceRecords = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 50, 
    employeeId, 
    startDate, 
    endDate, 
    status 
  } = req.query;

  // Build query
  const query = {};
  
  if (employeeId) query.employeeId = employeeId;
  if (status) query.status = status;
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1); // Include the end date
      query.date.$lt = end;
    }
  }

  // Execute query with pagination
  const attendanceRecords = await Attendance.find(query)
    .populate('employeeId', 'employeeId name email department')
    .select('-__v')
    .sort({ date: -1, createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await Attendance.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  // Transform data to include employee details at root level
  const transformedRecords = attendanceRecords.map(record => ({
    _id: record._id,
    employeeId: record.employeeId._id,
    employeeName: record.employeeId.name,
    employeeNumber: record.employeeId.employeeId,
    department: record.employeeId.department,
    date: record.date,
    status: record.status,
    markedAt: record.markedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  }));

  res.status(200).json({
    success: true,
    data: transformedRecords,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalRecords: total,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
});

// @desc    Get attendance record by ID
// @route   GET /api/attendance/:id
// @access  Public
export const getAttendanceRecord = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id)
    .populate('employeeId', 'employeeId name email department')
    .select('-__v');

  if (!attendance) {
    return res.status(404).json({
      success: false,
      message: 'Attendance record not found'
    });
  }

  res.status(200).json({
    success: true,
    data: attendance
  });
});

// @desc    Mark attendance for an employee
// @route   POST /api/attendance
// @access  Public
export const markAttendance = asyncHandler(async (req, res) => {
  const { employeeId, date, status } = req.body;

  // Check if employee exists
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return res.status(404).json({
      success: false,
      message: 'Employee not found'
    });
  }

  // Normalize date to remove time component
  const attendanceDate = new Date(date);
  const normalizedDate = new Date(
    attendanceDate.getFullYear(), 
    attendanceDate.getMonth(), 
    attendanceDate.getDate()
  );

  // Check if attendance already exists for this employee and date
  const existingAttendance = await Attendance.findOne({
    employeeId,
    date: normalizedDate
  });

  let attendanceRecord;

  if (existingAttendance) {
    // Update existing attendance
    existingAttendance.status = status;
    existingAttendance.markedAt = new Date();
    attendanceRecord = await existingAttendance.save();
  } else {
    // Create new attendance record
    attendanceRecord = await Attendance.create({
      employeeId,
      date: normalizedDate,
      status
    });
  }

  // Populate employee details
  await attendanceRecord.populate('employeeId', 'employeeId name email department');

  res.status(201).json({
    success: true,
    message: existingAttendance ? 'Attendance updated successfully' : 'Attendance marked successfully',
    data: attendanceRecord
  });
});

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Public
export const updateAttendance = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    return res.status(404).json({
      success: false,
      message: 'Attendance record not found'
    });
  }

  attendance.status = status || attendance.status;
  attendance.markedAt = new Date();

  const updatedAttendance = await attendance.save();
  await updatedAttendance.populate('employeeId', 'employeeId name email department');

  res.status(200).json({
    success: true,
    message: 'Attendance updated successfully',
    data: updatedAttendance
  });
});

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Public
export const deleteAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    return res.status(404).json({
      success: false,
      message: 'Attendance record not found'
    });
  }

  await Attendance.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Attendance record deleted successfully'
  });
});

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Public
export const getAttendanceStats = asyncHandler(async (req, res) => {
  const { startDate, endDate, employeeId } = req.query;

  // Build date filter
  const dateFilter = {};
  if (startDate || endDate) {
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      dateFilter.$lt = end;
    }
  }

  // Build match conditions
  const matchConditions = {};
  if (Object.keys(dateFilter).length > 0) {
    matchConditions.date = dateFilter;
  }
  if (employeeId) {
    matchConditions.employeeId = employeeId;
  }

  // Get overall stats
  const overallStats = await Attendance.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get stats by employee
  const employeeStats = await Attendance.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: {
          employeeId: '$employeeId',
          status: '$status'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.employeeId',
        attendance: {
          $push: {
            status: '$_id.status',
            count: '$count'
          }
        },
        totalDays: { $sum: '$count' }
      }
    },
    {
      $lookup: {
        from: 'employees',
        localField: '_id',
        foreignField: '_id',
        as: 'employee'
      }
    },
    {
      $unwind: '$employee'
    },
    {
      $project: {
        employeeId: '$employee.employeeId',
        name: '$employee.name',
        department: '$employee.department',
        attendance: 1,
        totalDays: 1
      }
    },
    {
      $sort: { totalDays: -1 }
    }
  ]);

  // Format overall stats
  const stats = { Present: 0, Absent: 0, Total: 0 };
  overallStats.forEach(stat => {
    stats[stat._id] = stat.count;
    stats.Total += stat.count;
  });

  res.status(200).json({
    success: true,
    data: {
      overall: stats,
      byEmployee: employeeStats
    }
  });
});

// @desc    Get today's attendance
// @route   GET /api/attendance/today
// @access  Public
export const getTodayAttendance = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const todayAttendance = await Attendance.find({
    date: {
      $gte: startOfDay,
      $lt: endOfDay
    }
  })
    .populate('employeeId', 'employeeId name email department')
    .select('-__v')
    .sort({ createdAt: -1 })
    .lean();

  // Transform data
  const transformedRecords = todayAttendance.map(record => ({
    _id: record._id,
    employeeId: record.employeeId._id,
    employeeName: record.employeeId.name,
    employeeNumber: record.employeeId.employeeId,
    department: record.employeeId.department,
    date: record.date,
    status: record.status,
    markedAt: record.markedAt
  }));

  res.status(200).json({
    success: true,
    data: transformedRecords
  });
});
