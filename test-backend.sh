#!/bin/bash

# HRMS Lite Backend Testing Script
# Tests all API endpoints to verify functionality

API_BASE_URL="https://hrms-lite-backend-8otz.onrender.com"
API_URL="$API_BASE_URL/api"

echo "🧪 HRMS Lite Backend API Test"
echo "================================"
echo "Testing API at: $API_BASE_URL"
echo ""

# Test 1: Health Check
echo "1. 🩺 Testing Health Check..."
response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$API_BASE_URL/health")
http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
body=$(echo "$response" | sed -e 's/HTTPSTATUS:.*//g')

if [ "$http_code" -eq 200 ]; then
    echo "   ✅ Health check passed (200)"
    echo "   📄 Response: $body"
else
    echo "   ❌ Health check failed ($http_code)"
    echo "   📄 Response: $body"
    exit 1
fi
echo ""

# Test 2: Get Employees
echo "2. 👥 Testing Get Employees..."
response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$API_URL/employees")
http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
body=$(echo "$response" | sed -e 's/HTTPSTATUS:.*//g')

if [ "$http_code" -eq 200 ]; then
    echo "   ✅ Get employees passed (200)"
    # Extract employee count from JSON response
    count=$(echo "$body" | grep -o '"totalRecords":[0-9]*' | sed 's/"totalRecords"://')
    echo "   📊 Found $count employees"
else
    echo "   ❌ Get employees failed ($http_code)"
    echo "   📄 Response: $body"
fi
echo ""

# Test 3: Create Employee
echo "3. ➕ Testing Create Employee..."
test_employee='{
    "employeeId": "EMP999", 
    "name": "Test Employee",
    "email": "test@company.com",
    "department": "Engineering"
}'

response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X POST "$API_URL/employees" \
    -H "Content-Type: application/json" \
    -d "$test_employee")

http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
body=$(echo "$response" | sed -e 's/HTTPSTATUS:.*//g')

if [ "$http_code" -eq 201 ] || [ "$http_code" -eq 200 ]; then
    echo "   ✅ Create employee passed ($http_code)"
    # Extract employee ID for cleanup
    employee_id=$(echo "$body" | grep -o '"_id":"[^"]*"' | sed 's/"_id":"//;s/"//')
    echo "   🆔 Created employee ID: $employee_id"
    
    # Test 4: Delete Employee (cleanup)
    if [ ! -z "$employee_id" ]; then
        echo ""
        echo "4. 🗑️  Testing Delete Employee..."
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
            -X DELETE "$API_URL/employees/$employee_id")
        
        http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
        body=$(echo "$response" | sed -e 's/HTTPSTATUS:.*//g')
        
        if [ "$http_code" -eq 200 ]; then
            echo "   ✅ Delete employee passed (200)"
            echo "   📄 Response: $body"
        else
            echo "   ❌ Delete employee failed ($http_code)"
            echo "   📄 Response: $body"
        fi
    fi
else
    echo "   ❌ Create employee failed ($http_code)"
    echo "   📄 Response: $body"
fi
echo ""

# Test 5: API Documentation
echo "5. 📚 Testing API Documentation..."
response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$API_URL/docs")
http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$http_code" -eq 200 ]; then
    echo "   ✅ API docs accessible (200)"
else
    echo "   ⚠️  API docs not accessible ($http_code)"
fi
echo ""

echo "🎉 Backend API testing complete!"
echo ""
echo "💡 Tips:"
echo "   - Free Render services sleep after 15min of inactivity"
echo "   - First request after sleep may take 10-30 seconds"
echo "   - Consider upgrading to paid tier for production use"
echo ""
