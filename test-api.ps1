# Test API Script
Write-Host "Testing Stock Tracker API..."

# 1. Register a new user
Write-Host "`n1. Registering new user..."
$userBody = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $userResponse = Invoke-RestMethod -Uri "http://44.232.157.2:5000/api/auth/signup" -Method Post -Body $userBody -ContentType "application/json"
    Write-Host "User registration successful!"
    Write-Host "User ID: $($userResponse.user.id)"
} catch {
    Write-Host "Error registering user: $_"
}

# 2. Login
Write-Host "`n2. Logging in..."
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://44.232.157.2:5000/api/auth/signin" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "Login successful!"
    Write-Host "Token received"
} catch {
    Write-Host "Error logging in: $_"
}

# 3. Buy Stock
Write-Host "`n3. Buying stock..."
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$buyBody = @{
    stockId = 1
    quantity = 10
    price = 100.50
} | ConvertTo-Json

try {
    $buyResponse = Invoke-RestMethod -Uri "http://44.232.157.2:5000/api/transactions/buy" -Method Post -Body $buyBody -Headers $headers
    Write-Host "Stock purchase successful!"
    Write-Host "Transaction ID: $($buyResponse.id)"
} catch {
    Write-Host "Error buying stock: $_"
}

# 4. View Portfolio
Write-Host "`n4. Viewing portfolio..."
try {
    $portfolioResponse = Invoke-RestMethod -Uri "http://44.232.157.2:5000/api/transactions/portfolio" -Method Get -Headers $headers
    Write-Host "Portfolio retrieved successfully!"
    Write-Host "Portfolio details:"
    $portfolioResponse | ConvertTo-Json
} catch {
    Write-Host "Error viewing portfolio: $_"
}

# 5. Forgot Password
Write-Host "`n5. Testing forgot password..."
$forgotBody = @{
    email = "test@example.com"
} | ConvertTo-Json

try {
    $forgotResponse = Invoke-RestMethod -Uri "http://44.232.157.2:5000/api/auth/forgot-password" -Method Post -Body $forgotBody -ContentType "application/json"
    Write-Host "Password reset email sent successfully!"
} catch {
    Write-Host "Error requesting password reset: $_"
}

Write-Host "`nAPI testing completed!" 