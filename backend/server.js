import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import custom modules
import connectDB from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import employeeRoutes from './routes/employeeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Trust proxy (important for deployment)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:3000',
      'https://localhost:5173',
      'https://localhost:5174',
      'https://localhost:5175',
      'https://localhost:5176',
      'https://localhost:3000',
      'https://hrms-lite.vercel.app',
      'https://hrms-lite-phi-seven.vercel.app',
      'https://hrms-lite-*.vercel.app', // Allow any Vercel subdomain
      // Add Render frontend deployment if exists
      'https://hrms-lite-frontend.onrender.com',
      'https://hrms-lite.onrender.com'
    ].filter(Boolean);

    // Check exact match first
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    }
    // Check wildcard patterns for Vercel
    else if (origin.includes('hrms-lite') && origin.includes('vercel.app')) {
      callback(null, true);
    }
    // Allow in development
    else if (process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Pragma'],
  exposedHeaders: ['X-Total-Count']
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).send();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
    next();
  });
}

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HRMS Lite API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to HRMS Lite API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      employees: '/api/employees',
      attendance: '/api/attendance',
      health: '/health'
    }
  });
});

// API documentation route
app.get('/api/docs', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HRMS Lite API Documentation',
    version: '1.0.0',
    endpoints: {
      employees: {
        'GET /api/employees': 'Get all employees with pagination',
        'GET /api/employees/:id': 'Get employee by ID',
        'POST /api/employees': 'Create new employee',
        'PUT /api/employees/:id': 'Update employee by ID',
        'DELETE /api/employees/:id': 'Delete employee by ID',
        'GET /api/employees/stats': 'Get employee statistics'
      },
      attendance: {
        'GET /api/attendance': 'Get all attendance records with filtering',
        'GET /api/attendance/:id': 'Get attendance record by ID',
        'POST /api/attendance': 'Mark attendance for employee',
        'PUT /api/attendance/:id': 'Update attendance record',
        'DELETE /api/attendance/:id': 'Delete attendance record',
        'GET /api/attendance/stats': 'Get attendance statistics',
        'GET /api/attendance/today': 'Get today\'s attendance records'
      }
    },
    sampleRequests: {
      createEmployee: {
        url: 'POST /api/employees',
        body: {
          employeeId: 'EMP001',
          name: 'John Doe',
          email: 'john.doe@company.com',
          department: 'Engineering'
        }
      },
      markAttendance: {
        url: 'POST /api/attendance',
        body: {
          employeeId: '507f1f77bcf86cd799439011',
          date: '2026-02-11',
          status: 'Present'
        }
      }
    }
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📦 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});

export default app;
