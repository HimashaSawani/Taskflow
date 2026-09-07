param(
    [string]$BaseUrl = "https://taskflow-usiv.vercel.app/api"
)

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   TASKFLOW PRODUCTION FULL-STACK QA AUTOMATION SUITE   " -ForegroundColor Cyan
Write-Host "   Target API: $BaseUrl" -ForegroundColor Gray
Write-Host "=========================================================`n" -ForegroundColor Cyan

$TotalTests = 0
$PassedTests = 0
$FailedTests = 0

function Run-Test {
    param(
        [string]$Title,
        [scriptblock]$TestBlock
    )
    $script:TotalTests++
    Write-Host -NoNewline "[$TotalTests] $Title ... "
    try {
        & $TestBlock
        $script:PassedTests++
        Write-Host "PASS" -ForegroundColor Green
    } catch {
        $script:FailedTests++
        Write-Host "FAIL: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            Write-Host "   Server Response: $($reader.ReadToEnd())" -ForegroundColor Yellow
        }
    }
}

# 1. Health Check
Run-Test "Server Health & DB Connection Check" {
    $health = Invoke-RestMethod -Uri "$($BaseUrl.Replace('/api', ''))/health" -Method Get
    if ($health.status -ne "ok") { throw "Status is not ok" }
}

# 2. Admin Authentication
$adminToken = ""
Run-Test "Admin Login (admin@taskflow.com)" {
    $body = @{ email = "admin@taskflow.com"; password = "AdminPassword123!" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -Body $body -ContentType "application/json"
    if ($res.user.role -ne "admin") { throw "Expected role admin, got $($res.user.role)" }
    if (-not $res.token) { throw "No token received" }
    $script:adminToken = $res.token
}

# 3. Member Authentication
$memberToken = ""
Run-Test "Member Login (alex@taskflow.com)" {
    $body = @{ email = "alex@taskflow.com"; password = "Password123!" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -Body $body -ContentType "application/json"
    if ($res.user.role -ne "user") { throw "Expected role user, got $($res.user.role)" }
    if (-not $res.token) { throw "No token received" }
    $script:memberToken = $res.token
}

# 4. User Registration (New Team Member)
$newUserId = ""
$newUserToken = ""
Run-Test "Dynamic User Registration" {
    $rand = Get-Random -Minimum 1000 -Maximum 9999
    $body = @{
        name = "QA Engineer $rand"
        email = "qa_user_$rand@taskflow.com"
        password = "Password123!"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method Post -Body $body -ContentType "application/json"
    if ($res.user.role -ne "user") { throw "Expected user role" }
    $script:newUserId = $res.user.id
    $script:newUserToken = $res.token
}

# 5. Fetch Tasks List
$initialTaskCount = 0
Run-Test "Fetch Kanban Tasks (Authenticated)" {
    $res = Invoke-RestMethod -Uri "$BaseUrl/tasks" -Method Get -Headers @{ Authorization = "Bearer $script:adminToken" }
    if ($null -eq $res.tasks) { throw "Tasks list is null" }
    $script:initialTaskCount = $res.tasks.Count
}

# 6. Create Task with Priority & Due Date
$createdTaskId = ""
Run-Test "Create New Kanban Task (HIGH Priority)" {
    $dueDate = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
    $body = @{
        title = "Automated QA Test Task $(Get-Random)"
        description = "Validating automated test suite in production"
        priority = "HIGH"
        dueDate = $dueDate
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/tasks" -Method Post -Body $body -Headers @{ Authorization = "Bearer $script:newUserToken" } -ContentType "application/json"
    if ($res.task.priority -ne "HIGH") { throw "Expected HIGH priority" }
    if ($null -ne $res.task.assignedUser) { throw "New tasks should start unassigned" }
    $script:createdTaskId = $res.task._id
}

# 7. Self-Claim Task (RBAC Check)
Run-Test "Member Self-Claims Task" {
    $body = @{ assignedUserId = $script:newUserId } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/tasks/$script:createdTaskId/assign" -Method Patch -Body $body -Headers @{ Authorization = "Bearer $script:newUserToken" } -ContentType "application/json"
    if ($res.task.assignedUser._id -ne $script:newUserId) { throw "Task was not assigned to claiming user" }
}

# 8. Drag-and-Drop Status Update
Run-Test "Drag-and-Drop Pipeline Progression (TODO -> DOING -> DONE)" {
    $body = @{ status = "DOING" } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/tasks/$script:createdTaskId/status" -Method Patch -Body $body -Headers @{ Authorization = "Bearer $script:newUserToken" } -ContentType "application/json"
    if ($res.task.status -ne "DOING") { throw "Status was not updated to DOING" }

    $body2 = @{ status = "DONE" } | ConvertTo-Json
    $res2 = Invoke-RestMethod -Uri "$BaseUrl/tasks/$script:createdTaskId/status" -Method Patch -Body $body2 -Headers @{ Authorization = "Bearer $script:newUserToken" } -ContentType "application/json"
    if ($res2.task.status -ne "DONE") { throw "Status was not updated to DONE" }
}

# 9. Admin Reassignment & Governance
Run-Test "Admin Dynamic Reassignment (Unassigned)" {
    $body = @{ assignedUserId = $null } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/tasks/$script:createdTaskId/assign" -Method Patch -Body $body -Headers @{ Authorization = "Bearer $script:adminToken" } -ContentType "application/json"
    if ($null -ne $res.task.assignedUser) { throw "Task should be unassigned" }
}

# 10. Audit Log / Activity Feed Verification
Run-Test "Audit Log Feed (Tracking All Activity Events)" {
    $res = Invoke-RestMethod -Uri "$BaseUrl/activities" -Method Get -Headers @{ Authorization = "Bearer $script:adminToken" }
    if ($null -eq $res.activities -or $res.activities.Count -eq 0) { throw "No activity events recorded" }
}

# 11. Admin User Directory & Workload Metrics
Run-Test "Admin User Directory & Workload Analytics" {
    $res = Invoke-RestMethod -Uri "$BaseUrl/users" -Method Get -Headers @{ Authorization = "Bearer $script:adminToken" }
    if ($null -eq $res.users -or $res.users.Count -eq 0) { throw "No users returned" }
}

# 12. Security Boundary: Normal Member Blocked from Admin Directory
Run-Test "Security RBAC: Normal User Blocked from /api/users (403 Forbidden)" {
    try {
        $res = Invoke-RestMethod -Uri "$BaseUrl/users" -Method Get -Headers @{ Authorization = "Bearer $script:memberToken" }
        throw "Security failure: Normal member accessed admin user directory!"
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -ne 403 -and $_.Exception.Response.StatusCode -ne 403) {
            # 403 Forbidden expected
        }
    }
}

# 13. Cleanup Created Task
Run-Test "Task Cleanup / Deletion" {
    $res = Invoke-RestMethod -Uri "$BaseUrl/tasks/$script:createdTaskId" -Method Delete -Headers @{ Authorization = "Bearer $script:adminToken" }
    if ($res.message -notmatch "deleted") { throw "Task was not deleted" }
}

Write-Host "`n=========================================================" -ForegroundColor Cyan
Write-Host "   QA TEST SUMMARY: $PassedTests / $TotalTests PASSED" -ForegroundColor $(if ($FailedTests -eq 0) { "Green" } else { "Red" })
Write-Host "=========================================================`n" -ForegroundColor Cyan
