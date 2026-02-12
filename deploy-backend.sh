#!/bin/bash

# HRMS Backend Deployment Script
# This script helps deploy backend changes to Render

echo "🚀 HRMS Backend Deployment Helper"
echo "================================="
echo ""

echo "📁 Current backend directory structure:"
ls -la backend/

echo ""
echo "🔧 Recent changes made:"
echo "✅ Updated CORS configuration to allow multiple localhost ports"
echo "✅ Added explicit OPTIONS handler for preflight requests"
echo "✅ Enhanced error logging for CORS issues"
echo ""

echo "📋 Deployment checklist:"
echo "□ 1. Commit changes to git"
echo "□ 2. Push to repository connected to Render"
echo "□ 3. Wait for automatic deployment (or trigger manual deploy)"
echo "□ 4. Test endpoints after deployment"
echo ""

echo "💡 Key changes to deploy:"
echo "   - Enhanced CORS origins to include ports 5173-5176"
echo "   - Added explicit OPTIONS request handler"
echo "   - Better error logging for debugging"
echo ""

echo "⚠️  Note: Render deployments typically take 2-5 minutes"
echo "   The service may return 500 errors during deployment"
echo ""

# Test local backend
echo "🧪 Testing local backend..."
if curl -s http://localhost:5001/health > /dev/null; then
    echo "✅ Local backend is running"
    echo "   Testing CORS preflight..."
    
    # Test preflight request
    preflight_response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X OPTIONS \
        -H "Origin: http://localhost:5175" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        http://localhost:5001/api/employees)
    
    if [ "$preflight_response" = "200" ]; then
        echo "✅ CORS preflight working locally"
    else
        echo "❌ CORS preflight failed locally ($preflight_response)"
    fi
else
    echo "❌ Local backend is not running"
    echo "   Run: cd backend && node server.js"
fi

echo ""
echo "🎯 Next steps:"
echo "1. If using Git: git add ., git commit -m 'Fix CORS configuration', git push"
echo "2. If not using Git: Manually upload the updated server.js to Render"
echo "3. Wait for deployment to complete"
echo "4. Test the frontend again"

echo ""
echo "🔗 Useful links:"
echo "   - Render Dashboard: https://dashboard.render.com"
echo "   - Backend Health: https://hrms-lite-backend-8otz.onrender.com/health"
echo "   - API Docs: https://hrms-lite-backend-8otz.onrender.com/api/docs"
