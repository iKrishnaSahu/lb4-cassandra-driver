#!/bin/bash

# Test script for User CRUD API endpoints

BASE_URL="http://localhost:3000"

echo "🧪 Testing LoopBack 4 + Cassandra User API"
echo "==========================================="
echo ""

# Function to print section headers
print_header() {
    echo ""
    echo "📍 $1"
    echo "-------------------------------------------"
}

# Create a user
print_header "1. Creating a new user"
CREATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
  }')
echo "$CREATE_RESPONSE" | jq .
USER_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')
echo "Created user with ID: $USER_ID"

# Get all users
print_header "2. Getting all users"
curl -s -X GET "${BASE_URL}/users" | jq .

# Get user by ID
print_header "3. Getting user by ID: $USER_ID"
curl -s -X GET "${BASE_URL}/users/${USER_ID}" | jq .

# Update user
print_header "4. Updating user: $USER_ID"
curl -s -X PATCH "${BASE_URL}/users/${USER_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "age": 31
  }' | jq .

# Verify update
print_header "5. Verifying update"
curl -s -X GET "${BASE_URL}/users/${USER_ID}" | jq .

# Create another user
print_header "6. Creating another user"
CREATE_RESPONSE_2=$(curl -s -X POST "${BASE_URL}/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "email": "alice@example.com",
    "age": 28
  }')
echo "$CREATE_RESPONSE_2" | jq .

# Get all users again
print_header "7. Getting all users (should see 2)"
curl -s -X GET "${BASE_URL}/users" | jq .

# Delete user
print_header "8. Deleting user: $USER_ID"
curl -s -X DELETE "${BASE_URL}/users/${USER_ID}"
echo "User deleted"

# Get all users after deletion
print_header "9. Getting all users after deletion (should see 1)"
curl -s -X GET "${BASE_URL}/users" | jq .

echo ""
echo "✅ All tests completed!"
