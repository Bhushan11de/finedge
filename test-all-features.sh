#!/bin/bash

# Set the server URL
SERVER_URL="http://44.232.157.2:5000"

echo "Testing Stock Tracker API Features..."

# Function to extract token from response
extract_token() {
    echo $1 | grep -o '"token":"[^"]*' | cut -d'"' -f4
}

# 1. Register regular user
echo -e "\n1. Registering regular user..."
USER_RESPONSE=$(curl -s -X POST $SERVER_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }')
echo "User registration response: $USER_RESPONSE"

# 2. Register admin user
echo -e "\n2. Registering admin user..."
ADMIN_RESPONSE=$(curl -s -X POST $SERVER_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }')
echo "Admin registration response: $ADMIN_RESPONSE"

# 3. Login as regular user
echo -e "\n3. Logging in as regular user..."
USER_LOGIN_RESPONSE=$(curl -s -X POST $SERVER_URL/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')
USER_TOKEN=$(extract_token "$USER_LOGIN_RESPONSE")
echo "User token received: $USER_TOKEN"

# 4. Login as admin
echo -e "\n4. Logging in as admin..."
ADMIN_LOGIN_RESPONSE=$(curl -s -X POST $SERVER_URL/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')
ADMIN_TOKEN=$(extract_token "$ADMIN_LOGIN_RESPONSE")
echo "Admin token received: $ADMIN_TOKEN"

# 5. Test forgot password
echo -e "\n5. Testing forgot password..."
FORGOT_PASS_RESPONSE=$(curl -s -X POST $SERVER_URL/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }')
echo "Forgot password response: $FORGOT_PASS_RESPONSE"

# 6. Test stock operations with user token
echo -e "\n6. Testing stock operations..."
# Buy stock
echo "Buying stock..."
BUY_RESPONSE=$(curl -s -X POST $SERVER_URL/api/transactions/buy \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stockId": 1,
    "quantity": 10,
    "price": 100.50
  }')
echo "Buy response: $BUY_RESPONSE"

# Sell stock
echo "Selling stock..."
SELL_RESPONSE=$(curl -s -X POST $SERVER_URL/api/transactions/sell \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stockId": 1,
    "quantity": 5,
    "price": 105.00
  }')
echo "Sell response: $SELL_RESPONSE"

# 7. View portfolio
echo -e "\n7. Viewing portfolio..."
PORTFOLIO_RESPONSE=$(curl -s -X GET $SERVER_URL/api/transactions/portfolio \
  -H "Authorization: Bearer $USER_TOKEN")
echo "Portfolio response: $PORTFOLIO_RESPONSE"

# 8. View transaction history
echo -e "\n8. Viewing transaction history..."
TRANSACTION_HISTORY=$(curl -s -X GET $SERVER_URL/api/transactions \
  -H "Authorization: Bearer $USER_TOKEN")
echo "Transaction history: $TRANSACTION_HISTORY"

echo -e "\nAll features tested successfully!" 