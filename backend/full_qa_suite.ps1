# Comprehensive Automated QA Suite for TaskFlow

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:5000/api"
$passed = 0
$failed = 0

function Assert-Condition($condition, $testName) {
    if ($condition) {
        Write-Host "  [PASS] $testName" -ForegroundColor Green
        $global:passed++
    } else {
        Write-Host "  [FAIL] $testName" -ForegroundColor Red
        $global:failed++
    }
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "TASKFLOW COMPLETE AUTOMATED QA TEST SUITE" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# --- 1. AUTHENTICATION TESTS ---
Write-Host "`n--- 1. Authentication Tests ---" -ForegroundColor Yellow

# 1.1 Admin login
$adminEmail = "admin@taskflow.com"
$adminPassword = "AdminPassword123!"
$adminRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body (@{ email = $adminEmail; password = $adminPassword } | ConvertTo-Json)
Assert-Condition ($adminRes.token -ne $null -and $adminRes.user.role -eq "admin") "1.1 Seeded Admin login works and role is 'admin'"
$adminToken = $adminRes.token
$adminId = $adminRes.user.id

# 1.2 User A registration
$rand = Get-Random
$userAEmail = "user_a_$rand@taskflow.com"
$userAPass = "Password123!"
$userARes = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body (@{ name = "User A"; email = $userAEmail; password = $userAPass } | ConvertTo-Json)
Assert-Condition ($userARes.token -ne $null -and $userARes.user.role -eq "user") "1.2 Register User A with valid details (role is strictly 'user')"
$userAToken = $userARes.token
$userAId = $userARes.user.id

# 1.3 User B registration
$userBEmail = "user_b_$rand@taskflow.com"
$userBPass = "Password123!"
$userBRes = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body (@{ name = "User B"; email = $userBEmail; password = $userBPass } | ConvertTo-Json)
Assert-Condition ($userBRes.token -ne $null -and $userBRes.user.role -eq "user") "1.3 Register User B with valid details"
$userBToken = $userBRes.token
$userBId = $userBRes.user.id

# 1.4 Duplicate email registration
try {
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body (@{ name = "Duplicate"; email = $userAEmail; password = "Password123!" } | ConvertTo-Json)
    Assert-Condition $false "1.4 Register with existing email should fail"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Condition ($statusCode -eq 409) "1.4 Register with existing email rejected with 409 Conflict"
}

# 1.5 Invalid email format
try {
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body (@{ name = "Invalid Email"; email = "not-an-email"; password = "Password123!" } | ConvertTo-Json)
    Assert-Condition $false "1.5 Register with invalid email should fail"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Condition ($statusCode -eq 400) "1.5 Register with invalid email rejected with 400 Bad Request"
}

# 1.6 Short password
try {
    Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body (@{ name = "Short Pass"; email = "shortpass@taskflow.com"; password = "123" } | ConvertTo-Json)
    Assert-Condition $false "1.6 Register with short password (< 6 chars) should fail"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Condition ($statusCode -eq 400) "1.6 Register with short password rejected with 400 Bad Request"
}

# 1.7 Login wrong password
try {
    Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body (@{ email = $userAEmail; password = "WrongPassword999!" } | ConvertTo-Json)
    Assert-Condition $false "1.7 Login with wrong password should fail"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Condition ($statusCode -eq 401) "1.7 Login with wrong password rejected with 401 Unauthorized"
}

# 1.8 Login non-existent email
try {
    Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body (@{ email = "nonexistent_email_999@taskflow.com"; password = "Password123!" } | ConvertTo-Json)
    Assert-Condition $false "1.8 Login with nonexistent email should fail"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Condition ($statusCode -eq 401) "1.8 Login with nonexistent email rejected with 401 Unauthorized"
}


# --- 2. TASK VALIDATION & CRUD TESTS ---
Write-Host "`n--- 2. Task Validation & CRUD Tests ---" -ForegroundColor Yellow

# 2.1 Empty title rejected
try {
    Invoke-RestMethod -Uri "$baseUrl/tasks" -Method Post -Headers @{ Authorization = "Bearer $userAToken" } -ContentType "application/json" -Body (@{ title = ""; description = "Valid description" } | ConvertTo-Json)
    Assert-Condition $false "2.1 Task with empty title should fail"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Condition ($statusCode -eq 400) "2.1 Task with empty title rejected with 400 Bad Request"
}

# 2.2 Extremely long title (> 120 chars) rejected
try {
    $longTitle = "A" * 150
    Invoke-RestMethod -Uri "$baseUrl/tasks" -Method Post -Headers @{ Authorization = "Bearer $userAToken" } -ContentType "application/json" -Body (@{ title = $longTitle; description = "Valid description" } | ConvertTo-Json)
    Assert-Condition $false "2.2 Task with extremely long title should fail"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Condition ($statusCode -eq 400) "2.2 Task with > 120 character title rejected with 400 Bad Request"
}

# 2.3 Create valid Task A by User A
$taskABody = @{
    title = "User A Private Feature"
    description = "Building private cryptographic module"
    priority = "HIGH"
    dueDate = "2026-10-01T00:00:00.000Z"
} | ConvertTo-Json

$taskARes = Invoke-RestMethod -Uri "$baseUrl/tasks" -Method Post -Headers @{ Authorization = "Bearer $userAToken" } -ContentType "application/json" -Body $taskABody
$taskA = $taskARes.task
Assert-Condition ($taskA._id -ne $null -and $taskA.title -eq "User A Private Feature" -and $taskA.priority -eq "HIGH" -and $taskA.creator.name -eq "User A") "2.3 User A creates Task A successfully with HIGH priority & creator User A"
$taskAId = $taskA._id

# 2.4 User A assigns Task A to themselves (Claim)
$claimRes = Invoke-RestMethod -Uri "$baseUrl/tasks/$taskAId/assign" -Method Patch -Headers @{ Authorization = "Bearer $userAToken" } -ContentType "application/json" -Body (@{ assignedUserId = $userAId } | ConvertTo-Json)
Assert-Condition ($claimRes.task.assignedUser._id -eq $userAId) "2.4 User A claims Task A for themselves"

# 2.5 User A edits Task A
$editBody = @{
    title = "User A Private Feature (Updated)"
    description = "Updated description with more details"
    priority = "MEDIUM"
} | ConvertTo-Json
$editRes = Invoke-RestMethod -Uri "$baseUrl/tasks/$taskAId" -Method Put -Headers @{ Authorization = "Bearer $userAToken" } -ContentType "application/json" -Body $editBody
Assert-Condition ($editRes.task.title -eq "User A Private Feature (Updated)" -and $editRes.task.priority -eq "MEDIUM") "2.5 User A can edit their own task details"


# --- 3. AUTHORIZATION & ISOLATION (USER B vs USER A) ---
Write-Host "`n--- 3. Authorization & Security Tests ---" -ForegroundColor Yellow

# 3.1 User B tries to VIEW User A's assigned task
try {
    Invoke-RestMethod -Uri "$baseUrl/tasks/$taskAId" -Method Get -Headers @{ Authorization = "Bearer $userBToken" }
    Assert-Condition $false "3.1 User B should NOT be able to view User A's private task"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Condition ($statusCode -eq 403) "3.1 User B viewing User A's task returns 403 Forbidden"
}

# 3.2 User B tries to EDIT User A's task
try {
    Invoke-RestMethod -Uri "$baseUrl/tasks/$taskAId" -Method Put -Headers @{ Authorization = "Bearer $userBToken" } -ContentType "application/json" -Body (@{ title = "Hacked Title" } | ConvertTo-Json)
    Assert-Condition $false "3.2 User B should NOT be able to edit User A's task"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Condition ($statusCode -eq 403) "3.2 User B editing User A's task returns 403 Forbidden"
}

# 3.3 User B tries to CHANGE STATUS of User A's task
try {
    Invoke-RestMethod -Uri "$baseUrl/tasks/$taskAId/status" -Method Patch -Headers @{ Authorization = "Bearer $userBToken" } -ContentType "application/json" -Body (@{ status = "DONE" } | ConvertTo-Json)
    Assert-Condition $false "3.3 User B should NOT be able to change status of User A's task"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Condition ($statusCode -eq 403) "3.3 User B moving User A's task returns 403 Forbidden"
}

# 3.4 User B tries to REASSIGN User A's assigned task
try {
    Invoke-RestMethod -Uri "$baseUrl/tasks/$taskAId/assign" -Method Patch -Headers @{ Authorization = "Bearer $userBToken" } -ContentType "application/json" -Body (@{ assignedUserId = $userBId } | ConvertTo-Json)
    Assert-Condition $false "3.4 User B should NOT be able to reassign User A's assigned task"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Condition ($statusCode -eq 403) "3.4 User B reassigning User A's task returns 403 Forbidden"
}

# 3.5 User B tries to DELETE User A's task
try {
    Invoke-RestMethod -Uri "$baseUrl/tasks/$taskAId" -Method Delete -Headers @{ Authorization = "Bearer $userBToken" }
    Assert-Condition $false "3.5 User B should NOT be able to delete User A's task"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Condition ($statusCode -eq 403) "3.5 User B deleting User A's task returns 403 Forbidden"
}

# 3.6 User A tries to access Admin-only /api/users endpoint
try {
    Invoke-RestMethod -Uri "$baseUrl/users" -Method Get -Headers @{ Authorization = "Bearer $userAToken" }
    Assert-Condition $false "3.6 Normal user should NOT access /api/users"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Condition ($statusCode -eq 403) "3.6 Normal user calling /api/users rejected with 403 Forbidden"
}


# --- 4. ASSIGNMENT RULES (ADMIN vs NORMAL USER) ---
Write-Host "`n--- 4. Assignment Rules & Admin Privileges ---" -ForegroundColor Yellow

# 4.1 Create an unassigned task Task_Unassigned
$taskUnassigned = (Invoke-RestMethod -Uri "$baseUrl/tasks" -Method Post -Headers @{ Authorization = "Bearer $adminToken" } -ContentType "application/json" -Body (@{ title = "Open Feature"; description = "Open for claiming" } | ConvertTo-Json)).task
$taskUId = $taskUnassigned._id
Assert-Condition ($taskUnassigned.assignedUser -eq $null) "4.1 Open task created with unassigned status"

# 4.2 User A cannot assign an unassigned task to User B
try {
    Invoke-RestMethod -Uri "$baseUrl/tasks/$taskUId/assign" -Method Patch -Headers @{ Authorization = "Bearer $userAToken" } -ContentType "application/json" -Body (@{ assignedUserId = $userBId } | ConvertTo-Json)
    Assert-Condition $false "4.2 Normal user assigning task to another user should fail"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Assert-Condition ($statusCode -eq 403) "4.2 Normal user cannot assign task to another user (403 Forbidden)"
}

# 4.3 Admin assigns: Unassigned -> User A
$adminAssignA = Invoke-RestMethod -Uri "$baseUrl/tasks/$taskUId/assign" -Method Patch -Headers @{ Authorization = "Bearer $adminToken" } -ContentType "application/json" -Body (@{ assignedUserId = $userAId } | ConvertTo-Json)
Assert-Condition ($adminAssignA.task.assignedUser._id -eq $userAId) "4.3 Admin assigns task to User A"

# 4.4 Admin reassigns: User A -> User B
$adminAssignB = Invoke-RestMethod -Uri "$baseUrl/tasks/$taskUId/assign" -Method Patch -Headers @{ Authorization = "Bearer $adminToken" } -ContentType "application/json" -Body (@{ assignedUserId = $userBId } | ConvertTo-Json)
Assert-Condition ($adminAssignB.task.assignedUser._id -eq $userBId) "4.4 Admin reassigns task to User B"

# 4.5 Admin unassigns: User B -> Unassigned (null)
$adminUnassign = Invoke-RestMethod -Uri "$baseUrl/tasks/$taskUId/assign" -Method Patch -Headers @{ Authorization = "Bearer $adminToken" } -ContentType "application/json" -Body (@{ assignedUserId = $null } | ConvertTo-Json)
Assert-Condition ($adminUnassign.task.assignedUser -eq $null) "4.5 Admin unassigns task back to null/Unassigned"


# --- 5. DRAG & DROP STATUS TRANSITIONS ---
Write-Host "`n--- 5. Drag & Drop Status Transitions ---" -ForegroundColor Yellow

$statusTransitions = @("DOING", "DONE", "DOING", "TODO", "DONE", "TODO")
$allStatusPassed = $true

foreach ($targetStatus in $statusTransitions) {
    $res = Invoke-RestMethod -Uri "$baseUrl/tasks/$taskUId/status" -Method Patch -Headers @{ Authorization = "Bearer $adminToken" } -ContentType "application/json" -Body (@{ status = $targetStatus } | ConvertTo-Json)
    if ($res.task.status -ne $targetStatus) {
        $allStatusPassed = $false
    }
}
Assert-Condition $allStatusPassed "5.1 All 6 Kanban transitions (TODO <-> DOING <-> DONE) save and persist correctly"


# --- 6. ADMIN DASHBOARD DATA INTEGRITY ---
Write-Host "`n--- 6. Admin Management & Activity Logs ---" -ForegroundColor Yellow

# 6.1 Admin can list all users
$allUsersRes = Invoke-RestMethod -Uri "$baseUrl/users" -Method Get -Headers @{ Authorization = "Bearer $adminToken" }
Assert-Condition ($allUsersRes.users.Count -ge 3) "6.1 Admin retrieves full user list ($($allUsersRes.users.Count) users)"

# 6.2 Admin can view all tasks
$allTasksRes = Invoke-RestMethod -Uri "$baseUrl/tasks" -Method Get -Headers @{ Authorization = "Bearer $adminToken" }
Assert-Condition ($allTasksRes.tasks.Count -ge 2) "6.2 Admin retrieves all tasks ($($allTasksRes.tasks.Count) tasks)"

# 6.3 Activity Audit Logs
$activityRes = Invoke-RestMethod -Uri "$baseUrl/activities" -Method Get -Headers @{ Authorization = "Bearer $adminToken" }
Assert-Condition ($activityRes.activities.Count -ge 5) "6.3 Activity history logs recorded correctly ($($activityRes.activities.Count) events)"

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "QA SUITE SUMMARY: $passed PASSED, $failed FAILED" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "==================================================" -ForegroundColor Cyan
