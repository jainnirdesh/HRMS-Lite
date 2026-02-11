# HRMS Lite Admin Dashboard

A modern, full-stack Human Resource Management System (HRMS) admin dashboard built with React, TypeScript, Node.js, Express, and MongoDB. This application provides a comprehensive solution for managing employees, tracking attendance, and monitoring HR statistics with real-time data persistence.

![HRMS Lite Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen) ![React](https://img.shields.io/badge/React-18.3.1-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-Latest-blue) ![Node.js](https://img.shields.io/badge/Node.js-Latest-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)

## 🌐 Live Demo

- **Frontend**: [https://hrms-lite.vercel.app](https://hrms-lite.vercel.app) *(Deploy to get actual URL)*
- **Backend API**: [https://hrms-lite-backend.onrender.com](https://hrms-lite-backend.onrender.com) *(Deploy to get actual URL)*
- **API Documentation**: Visit backend URL + `/api` for endpoint testing

**Demo Credentials:**
- Email: `admin@hrms.com`
- Password: `admin123`

## 📋 Project Overview

HRMS Lite Admin Dashboard is a lightweight, feature-rich HR management system designed for small to medium-sized organizations. The application provides an intuitive interface for HR administrators to manage employee data, track attendance, and monitor key HR metrics with full database persistence and server-side validation.

### Key Features

- **🏠 Dashboard**: Real-time statistics and today's attendance overview
- **👥 Employee Management**: Add, view, and delete employees with comprehensive details
- **📊 Attendance Tracking**: Mark and monitor employee attendance with date-wise filtering
- **📱 Responsive Design**: Fully responsive interface that works on all devices
- **🎨 Modern UI**: Clean, glassmorphism design with smooth animations
- **⚡ Real-time Updates**: Dynamic data updates across all components
- **�️ Database Persistence**: All data stored in MongoDB with proper indexing
- **�🔐 RESTful API**: Secure backend API with validation and error handling
- **🚀 Production Ready**: Deployable to cloud platforms with environment configurations

## 🛠 Tech Stack

### Frontend
- **React 18.3.1** - Component-based UI library
- **TypeScript** - Type-safe JavaScript development
- **Vite 6.3.5** - Fast build tool and development server
- **Tailwind CSS 4.1.12** - Utility-first CSS framework
- **Radix UI & shadcn/ui** - Accessible component library
- **React Router 7.13.0** - Client-side routing
- **Framer Motion** - Smooth animations and transitions

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Express Validator** - Server-side validation
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Express Rate Limit** - API rate limiting

### Development & Deployment
- **ESLint & Prettier** - Code linting and formatting
- **dotenv** - Environment variable management
- **Vercel/Netlify** - Frontend deployment
- **Render/Railway** - Backend deployment
- **MongoDB Atlas** - Cloud database hosting

## 🚀 Local Development Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local installation or MongoDB Atlas account)
- **npm** or **pnpm** package manager

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "HRMS Lite Admin Dashboard Design"
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**
   ```bash
   # Create .env file in backend directory
   cp .env.example .env
   
   # Edit .env with your configuration:
   NODE_ENV=development
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/hrms_lite
   JWT_SECRET=your-secret-key-here
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start MongoDB** (if using local installation)
   ```bash
   # macOS with Homebrew
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

5. **Start Backend Server**
   ```bash
   npm start
   # Server runs on http://localhost:5001
   ```

### Frontend Setup

1. **Open new terminal and navigate to root directory**
   ```bash
   cd "HRMS Lite Admin Dashboard Design"
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   ```bash
   # Create .env.local file in root directory
   echo "VITE_API_URL=http://localhost:5001/api" > .env.local
   ```

4. **Start Frontend Development Server**
   ```bash
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

### Quick Start (All Services)

For convenience, you can start both services:

```bash
# Terminal 1: Start Backend
cd backend && npm start

# Terminal 2: Start Frontend  
npm run dev

# Terminal 3: Start MongoDB (if local)
brew services start mongodb-community
```

### Build for Production

```bash
# Backend (No build needed, runs directly)
cd backend && npm start

# Frontend
npm run build
npm run preview  # Test production build locally
```

### Demo Credentials
- **Email**: `admin@hrms.com`
- **Password**: `admin123`

## 📁 Project Structure

```
src/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── layout/         # Layout components (Sidebar, Navbar)
│   │   └── *.tsx           # Feature-specific components
│   ├── pages/              # Route components
│   │   ├── DashboardPage.tsx
│   │   ├── EmployeesPage.tsx
│   │   ├── AttendancePage.tsx
│   │   └── LoginPage.tsx
│   ├── store/              # Data management
│   │   └── dataStore.ts    # Centralized data store
│   ├── hooks/              # Custom React hooks
│   │   └── useDataStore.ts # Data store hook
│   ├── App.tsx            # Main app component
│   └── routes.ts          # Route definitions
├── styles/                 # CSS and styling
└── main.tsx               # Application entry point
```

## 🎯 Assumptions or Limitations

### Current Assumptions
1. **Single Organization**: Designed for single organization use
2. **Demo Authentication**: Uses localStorage-based authentication (not production-ready)
3. **In-Memory Storage**: Data persists only during the session (no database integration)
4. **Manual Attendance**: Attendance must be marked manually by administrators
5. **Static Departments**: Predefined department list (Engineering, Marketing, Sales, HR, Finance, Operations, Design)

### Current Limitations
1. **No Data Persistence**: Data resets on page refresh (no backend/database)
2. **No User Roles**: Single admin role, no employee self-service portal
3. **Limited Reporting**: Basic statistics only, no advanced reports
4. **No Time Tracking**: Simple present/absent, no clock in/out times
5. **No Bulk Operations**: Individual employee/attendance management only
6. **No Data Export**: No CSV/PDF export functionality
7. **No Email Notifications**: No automated notifications for absences

### Potential Enhancements
- Backend API integration with database
- Advanced user roles and permissions
- Employee self-service portal
- Time-based attendance tracking
- Advanced reporting and analytics
- Bulk operations and data import/export
- Email/SMS notifications
- Leave management system
- Payroll integration

## 🌟 Features in Detail

### Dashboard
- Real-time employee statistics
- Today's attendance overview
- Recent attendance records table
- Interactive stat cards with animations

### Employee Management
- Add new employees with complete details
- View all employees in a structured table
- Delete employees with confirmation
- Automatic attendance record creation for new employees

### Attendance Management
- Mark attendance for any employee on any date
- View attendance history
- Status badges for present/absent
- Date-wise attendance filtering

### Design Features
- **Glassmorphism UI**: Modern glass-like design elements
- **Smooth Animations**: Powered by Framer Motion
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Collapsible Sidebar**: Space-efficient navigation
- **Loading States**: Skeleton loaders for better UX
- **Empty States**: Helpful messages when no data is available

## 🌐 Production Deployment

This application is designed to be easily deployed to popular cloud platforms. For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Quick Deployment Summary

#### Backend (Render/Railway)
1. Push code to GitHub
2. Connect repository to hosting service
3. Set environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Secure random string
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: Your frontend domain
4. Deploy with automatic builds

#### Frontend (Vercel/Netlify)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set environment variable: `VITE_API_URL`
4. Deploy with automatic builds

#### Database (MongoDB Atlas)
1. Create free cluster
2. Get connection string
3. Add to backend environment variables

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hrms_lite
JWT_SECRET=your-super-secure-jwt-secret-key
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

#### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-domain.onrender.com/api
VITE_APP_TITLE=HRMS Lite Admin Dashboard
```

## 📚 API Documentation

The backend provides RESTful API endpoints for all operations:

### Employee Endpoints
- `GET /api/employees` - Get all employees (with pagination)
- `POST /api/employees` - Create new employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/stats` - Get employee statistics

### Attendance Endpoints  
- `GET /api/attendance` - Get all attendance records
- `POST /api/attendance` - Record attendance
- `GET /api/attendance/today` - Get today's attendance
- `GET /api/attendance/stats` - Get attendance statistics

### Request/Response Examples

#### Create Employee
```bash
POST /api/employees
Content-Type: application/json

{
  "employeeId": "EMP001",
  "name": "John Doe", 
  "email": "john@company.com",
  "phone": "1234567890",
  "department": "Engineering",
  "position": "Senior Developer",
  "salary": 75000,
  "hireDate": "2024-01-15"
}
```

#### Record Attendance
```bash
POST /api/attendance
Content-Type: application/json

{
  "employeeId": "EMP001",
  "status": "Present",
  "notes": "On time"
}
```

### Error Handling
All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```