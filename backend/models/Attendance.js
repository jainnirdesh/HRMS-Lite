import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Attendance date is required'],
    validate: {
      validator: function(date) {
        return date <= new Date();
      },
      message: 'Attendance date cannot be in the future'
    }
  },
  status: {
    type: String,
    required: [true, 'Attendance status is required'],
    enum: {
      values: ['Present', 'Absent'],
      message: 'Status must be either Present or Absent'
    }
  },
  markedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure one attendance record per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// Additional indexes for better query performance  
attendanceSchema.index({ date: -1 });
attendanceSchema.index({ status: 1 });

// Virtual to populate employee details
attendanceSchema.virtual('employee', {
  ref: 'Employee',
  localField: 'employeeId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to normalize date (remove time component)
attendanceSchema.pre('save', function(next) {
  if (this.date) {
    this.date = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
  }
  next();
});

// Static method to get attendance statistics
attendanceSchema.statics.getStats = async function(date = new Date()) {
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const stats = await this.aggregate([
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

  const result = { Present: 0, Absent: 0 };
  stats.forEach(stat => {
    result[stat._id] = stat.count;
  });

  return result;
};

export default mongoose.model('Attendance', attendanceSchema);
