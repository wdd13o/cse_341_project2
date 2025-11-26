<#
Simple PowerShell test script to demonstrate register -> login -> call protected endpoint

Usage (PowerShell):
  # ensure server is running on localhost:3000
  .\scripts\auth_test.ps1

This script will:
 - POST /auth/register
 - POST /auth/login
 - POST /authors with the returned token
#>

$params = @{ BaseUrl = 'http://localhost:3000' }

function Post-Json($url, $body, $token = $null) {
    $headers = @{ 'Content-Type' = 'application/json' }
    if ($token) { $headers['Authorization'] = "Bearer $token" }
    $json = $body | ConvertTo-Json -Depth 5
    try {
        return Invoke-RestMethod -Method Post -Uri $url -Body $json -ContentType 'application/json' -Headers $headers
    } catch {
        Write-Error "Request to $url failed: $($_.Exception.Message)"
        if ($_.ErrorDetails) { Write-Host $_.ErrorDetails.Message }
        return $null
    }
}

Write-Host "Using base URL: $($params.BaseUrl)"

# 1) Register
$regBody = @{ email = 'tester@example.com'; password = 'TestPass123' }
Write-Host "Registering user..."
$reg = Post-Json "$($params.BaseUrl)/auth/register" $regBody
if ($reg -ne $null) { Write-Host "Register response:"; $reg | ConvertTo-Json }

# 2) Login
$loginBody = @{ email = 'tester@example.com'; password = 'TestPass123' }
Write-Host "Logging in..."
$login = Post-Json "$($params.BaseUrl)/auth/login" $loginBody
if ($login -eq $null) { Write-Error 'Login failed, aborting'; exit 1 }
$token = $login.token
if (-not $token) { Write-Error 'No token returned from login'; exit 1 }
Write-Host "Token acquired (truncated): $($token.Substring(0,20))..."

# 3) Create an author (protected)
$authorBody = @{ name = 'PS Test Author'; bio = 'Created by auth_test.ps1' }
Write-Host "Creating author using token..."
$create = Post-Json "$($params.BaseUrl)/authors" $authorBody $token
if ($create -ne $null) { Write-Host "Create response:"; $create | ConvertTo-Json }

Write-Host 'Test script finished.'
