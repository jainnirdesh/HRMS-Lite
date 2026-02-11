# HRMS Lite - Deployment Guide

## 🚀 Deployment Overview

This guide covers deploying the HRMS Lite Admin Dashboard to production using popular cloud services.

### Ar**Note**: Option A (Vercel) or Option B (Render Static Site) are recommended as they're more efficient for serving static files.

### Step 3: Update Backend CORS

After deploying the frontend with any option above:

1. Go back to Render dashboard (backend service)
2. Update `FRONTEND_URL` environment variable with your frontend URL:
   - Vercel: `https://your-app.vercel.app`
   - Render Static Site: `https://your-frontend.onrender.com`
   - Render Web Service: `https://your-frontend.onrender.com`
3. Redeploy the backend service

---

## 🚀 Alternative Deployment Options- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Database**: MongoDB Atlas (Cloud)

---

## 📋 Prerequisites

1. **GitHub Account**: For version control and deployment integration
2. **MongoDB Atlas Account**: For cloud database
3. **Cloud Accounts** (choose one or more):
   - **Backend**: Render, Railway, or Heroku
   - **Frontend**: Vercel, Netlify, or GitHub Pages

---

## 🗄️ Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account or sign in
3. Create a new project called "HRMS-Lite"
4. Build a cluster (choose FREE tier)
5. Create a database user:
   - Username: `hrms-admin`
   - Password: Generate a secure password
6. Add your IP address to Network Access (or use `0.0.0.0/0` for all IPs)

### Step 2: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like):
   ```
   mongodb+srv://hrms-admin:<password>@cluster0.xxxxx.mongodb.net/hrms_lite?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password

---

## 🔧 Backend Deployment (Render)

### Step 1: Prepare Backend for Deployment

1. **Create render.yaml** in backend folder:
   ```yaml
   services:
     - type: web
       name: hrms-lite-backend
       env: node
       plan: free
       buildCommand: npm install
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: MONGODB_URI
           sync: false
         - key: JWT_SECRET
           generateValue: true
         - key: PORT
           value: 10000
   ```

### Step 2: Deploy to Render

1. Push your code to GitHub
2. Go to [Render](https://render.com) and sign up
3. Connect your GitHub account
4. Create a new "Web Service"
5. Select your repository and `backend` folder
6. Configure:
   - **Name**: `hrms-lite-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
7. Add environment variables:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your Atlas connection string
   - `JWT_SECRET`: A secure random string (32+ characters)
   - `FRONTEND_URL`: (Will add after frontend deployment)

### Step 3: Test Backend

After deployment, test your API:
```bash
curl https://hrms-lite-yygs.onrender.com/api/employees
```

---

## 🌐 Frontend Deployment

You have two options for deploying the frontend:

### Option A: Deploy to Vercel (Recommended)

#### Step 1: Prepare Frontend for Deployment

1. **Update API URL** in `.env.production`:
   ```env
   VITE_API_URL=https://your-backend-url.onrender.com/api
   VITE_APP_TITLE=HRMS Lite Admin Dashboard
   VITE_NODE_ENV=production
   ```

2. **vercel.json is already configured** in the project root.

#### Step 2: Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign up
2. Connect your GitHub account
3. Import your repository
4. Configure:
   - **Framework**: `Vite`
   - **Root Directory**: `/` (not backend)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables:
   - `VITE_API_URL`: Your backend URL from Render
   - `VITE_APP_TITLE`: `HRMS Lite Admin Dashboard`
   - `VITE_NODE_ENV`: `production`

### Option B: Deploy to Render Static Site

If you prefer to keep everything on Render:

#### Step 1: Create a New Static Site on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Static Site"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `hrms-lite-frontend`
   - **Branch**: `main`
   - **Root Directory**: `/` (leave empty)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

#### Step 2: Add Environment Variables

1. In the Render dashboard, go to Environment
2. Add variables:
   - `VITE_API_URL`: Your backend URL from Render
   - `VITE_APP_TITLE`: `HRMS Lite Admin Dashboard`
   - `VITE_NODE_ENV`: `production`

### Option C: Deploy Frontend as Node.js App on Render (Current Issue Fix)

If you want to deploy as a Node.js service (less efficient but works):

1. Your `package.json` now includes a `start` script that serves the built files
2. On Render, create a "Web Service" (not Static Site)
3. Configure:
   - **Name**: `hrms-lite-frontend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add environment variables as above

**Note**: Option A (Vercel) or Option B (Render Static Site) are recommended as they're more efficient for serving static files.

### Step 3: Update Backend CORS

1. Go back to Render dashboard
2. Update `FRONTEND_URL` environment variable with your Vercel URL
3. Redeploy the backend service

---

## 🔄 Alternative Deployment Options

### Backend Alternatives

#### Railway
1. Go to [Railway](https://railway.app)
2. Connect GitHub repository
3. Deploy from `backend` folder
4. Add same environment variables

#### Heroku
1. Install Heroku CLI
2. Create new app: `heroku create hrms-lite-backend`
3. Set buildpacks: `heroku buildpacks:set heroku/nodejs`
4. Add environment variables: `heroku config:set MONGODB_URI=...`
5. Deploy: `git subtree push --prefix=backend heroku main`

### Frontend Alternatives

#### Netlify
1. Go to [Netlify](https://netlify.com)
2. Connect GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables in Netlify dashboard

---

## 🧪 Testing Production Deployment

### Backend Health Check
```bash
# Test API endpoints
curl https://your-backend-url/api/employees
curl https://your-backend-url/api/attendance/today
```

### Frontend Testing
1. Visit your deployed frontend URL
2. Test employee creation and management
3. Test attendance recording
4. Verify dashboard statistics update

### Database Verification
1. Log into MongoDB Atlas
2. Go to "Collections" in your cluster
3. Verify `employees` and `attendancerecords` collections exist
4. Check that data persists across frontend operations

---

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use strong, unique JWT secrets
- Restrict MongoDB Atlas network access if possible
- Use HTTPS URLs for all production services

### CORS Configuration
- Set specific frontend URLs in `FRONTEND_URL`
- Avoid using `*` for Access-Control-Allow-Origin in production

### Rate Limiting
- The app includes built-in rate limiting (100 requests per 15 minutes)
- Adjust limits in backend environment variables if needed

---

## 📊 Monitoring & Maintenance

### Backend Monitoring
- Render provides built-in logs and metrics
- Set up log alerts for errors
- Monitor API response times and uptime

### Database Monitoring
- MongoDB Atlas provides performance insights
- Set up alerts for high CPU usage or connection issues
- Monitor storage usage (free tier has 512MB limit)

### Frontend Monitoring
- Vercel provides analytics and performance metrics
- Monitor Core Web Vitals and error rates

---

## 🆙 Scaling Considerations

### Database
- Start with MongoDB Atlas free tier (512MB)
- Upgrade to shared cluster ($9/month) when needed
- Consider dedicated clusters for high-traffic applications

### Backend
- Render free tier includes 750 hours/month
- Upgrade to paid plans for:
  - Always-on services (no cold starts)
  - More CPU and memory
  - Custom domains

### Frontend
- Vercel free tier is generous for most use cases
- Upgrade for:
  - Custom domains
  - Advanced analytics
  - Serverless functions

---

## 🐛 Troubleshooting

### Common Issues

#### Frontend: "Command start not found" Error (Render)
**Problem**: Render trying to run `yarn start` on a Vite project  
**Solution**: 
1. Use Option B (Render Static Site) instead of Web Service
2. Or ensure your `package.json` has the `start` script (already fixed)
3. Or deploy to Vercel instead

#### Backend Won't Start
- Check environment variables are set correctly
- Verify MongoDB connection string format
- Check Render/Railway service logs

#### Frontend API Calls Failing
- Verify VITE_API_URL is correct
- Check CORS configuration in backend
- Verify backend is running and accessible

#### Database Connection Issues
- Check MongoDB Atlas network access settings
- Verify connection string includes correct password
- Ensure database user has read/write permissions

### Debug Commands
```bash
# Check backend logs (Render)
# View logs in Render dashboard

# Test local production build
npm run build && npm run preview

# Test backend locally with production env
NODE_ENV=production npm start
```

---

## 📞 Support

For deployment issues:
1. Check the specific platform's documentation (Render, Vercel, MongoDB Atlas)
2. Verify environment variables are correctly set
3. Check service logs for detailed error messages
4. Ensure all URLs and connections are properly configured

---

*Last updated: February 2025*
