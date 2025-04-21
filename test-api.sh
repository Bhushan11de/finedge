#!/bin/bash

echo "Testing Stock Tracker API..."

# 1. Register a new user
echo -e "\n1. Registering new user..."
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# 2. Login
echo -e "\n2. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token received: $TOKEN"

# 3. Buy Stock
echo -e "\n3. Buying stock..."
curl -X POST http://localhost:5000/api/transactions/buy \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stockId": 1,
    "quantity": 10,
    "price": 100.50
  }'

# 4. View Portfolio
echo -e "\n4. Viewing portfolio..."
curl -X GET http://localhost:5000/api/transactions/portfolio \
  -H "Authorization: Bearer $TOKEN"

# 5. Forgot Password
echo -e "\n5. Testing forgot password..."
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'

echo -e "\nAPI testing completed!" 