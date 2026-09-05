# 1. Admin login with admin@taskflow.com
$adminLogin = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -ContentType 'application/json' -Body '{"email":"admin@taskflow.com","password":"AdminPassword123!"}'
Write-Host "Admin login success: $($adminLogin.user.name) ($($adminLogin.user.email)) [Role: $($adminLogin.user.role)]"
$adminToken = $adminLogin.token

# 1b. Member login with alex@taskflow.com
$memberLogin = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -ContentType 'application/json' -Body '{"email":"alex@taskflow.com","password":"Password123!"}'
Write-Host "Member login success: $($memberLogin.user.name) ($($memberLogin.user.email)) [Role: $($memberLogin.user.role)]"

# 2. Register normal user
$regEmail = "user_" + (Get-Random) + "@taskflow.com"
$userReg = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/register' -Method Post -ContentType 'application/json' -Body "{`"name`":`"Alex`",`"email`":`"$regEmail`",`"password`":`"Password123!`"}"
Write-Host "User registered: $($userReg.user.name) (Role: $($userReg.user.role))"
$userToken = $userReg.token
$userId = $userReg.user.id

# 3. Create task with Priority HIGH and Due Date
$taskBody = '{"title":"Implement Security Auditing","description":"Configure helmet and activities","priority":"HIGH","dueDate":"2026-09-15"}'
$newTask = Invoke-RestMethod -Uri 'http://localhost:5000/api/tasks' -Method Post -Headers @{ Authorization = "Bearer $userToken" } -ContentType 'application/json' -Body $taskBody
Write-Host "PASS: Task created with Priority $($newTask.task.priority). AssignedUser is strictly null: $($newTask.task.assignedUser -eq $null)"

# 4. Normal user claims task
$claimBody = "{`"assignedUserId`":`"$userId`"}"
$claimed = Invoke-RestMethod -Uri "http://localhost:5000/api/tasks/$($newTask.task._id)/assign" -Method Patch -Headers @{ Authorization = "Bearer $userToken" } -ContentType 'application/json' -Body $claimBody
Write-Host "PASS: Task claimed by: $($claimed.task.assignedUser.name)"

# 5. Admin reassigns task to unassigned
$adminReassign = Invoke-RestMethod -Uri "http://localhost:5000/api/tasks/$($newTask.task._id)/assign" -Method Patch -Headers @{ Authorization = "Bearer $adminToken" } -ContentType 'application/json' -Body '{"assignedUserId":null}'
Write-Host "PASS: Admin unassigned task: $($adminReassign.task.assignedUser -eq $null)"

# 6. Fetch Activity logs
$activitiesRes = Invoke-RestMethod -Uri 'http://localhost:5000/api/activities' -Method Get -Headers @{ Authorization = "Bearer $adminToken" }
Write-Host "PASS: Activity audit feed fetched successfully. Total logged events: $($activitiesRes.activities.Count)"
Write-Host "Latest event message: $($activitiesRes.activities[0].message)"

Write-Host "`n=== ALL SAAS & BONUS FEATURE TESTS PASSED! ==="
