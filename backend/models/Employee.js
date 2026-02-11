import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^EMP\d{3,}$/, 'Employee ID must be in format EMP001, EMP002, etc.']
  },
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: {
      values: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design'],
      message: 'Department must be one of: Engineering, Marketing, Sales, HR, Finance, Operations, Design'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for attendance records count
employeeSchema.virtual('attendanceRecords', {
  ref: 'Attendance',
  localField: '_id',
  foreignField: 'employeeId'
});

// Pre-save middleware to generate employee ID if not provided
employeeSchema.pre('save', async function(next) {
  if (!this.employeeId) {
    const lastEmployee = await mongoose.model('Employee').findOne().sort({ employeeId: -1 });
    if (lastEmployee) {
      const lastNumber = parseInt(lastEmployee.employeeId.substring(3));
      this.employeeId = `EMP${String(lastNumber + 1).padStart(3, '0')}`;
    } else {
      this.employeeId = 'EMP001';
    }
  }
  next();
});

// Index for better query performance
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ email: 1 });
employeeSchema.index({ department: 1 });

export default mongoose.model('Employee', employeeSchema);
