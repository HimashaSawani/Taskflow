const BASE_URL = process.env.API_URL || 'https://taskflow-usiv.vercel.app/api';
const ROOT_URL = BASE_URL.replace(/\/api\/?$/, '');

console.log('\x1b[36m%s\x1b[0m', '=========================================================');
console.log('\x1b[36m%s\x1b[0m', '   TASKFLOW PRODUCTION FULL-STACK QA AUTOMATION SUITE   ');
console.log('\x1b[90m%s\x1b[0m', `   Target API: ${BASE_URL}\n=========================================================\n`);

let passed = 0;
let failed = 0;
let total = 0;

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!res.ok) {
    const error = new Error(data?.message || `HTTP ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function runTest(name, fn) {
  total++;
  process.stdout.write(`[${total.toString().padStart(2, '0')}] ${name} ... `);
  try {
    await fn();
    passed++;
    console.log('\x1b[32mPASS\x1b[0m');
  } catch (err) {
    failed++;
    console.log('\x1b[31mFAIL\x1b[0m');
    console.log('     \x1b[33mError:\x1b[0m', err.data?.message || err.message);
  }
}

async function main() {
  let adminToken = '';
  let memberToken = '';
  let newUserId = '';
  let newUserToken = '';
  let createdTaskId = '';

  // 1. Root & Health Check
  await runTest('Server Root Endpoint Status', async () => {
    const data = await request(ROOT_URL);
    if (!data.message) throw new Error('Invalid response');
  });

  // 2. Admin Authentication
  await runTest('Admin Login (admin@taskflow.com)', async () => {
    const data = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@taskflow.com',
        password: 'AdminPassword123!',
      }),
    });
    if (data.user.role !== 'admin') throw new Error('Expected admin role');
    if (!data.token) throw new Error('No token returned');
    adminToken = data.token;
  });

  // 3. Member Authentication
  await runTest('Member Login (alex@taskflow.com)', async () => {
    const data = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'alex@taskflow.com',
        password: 'Password123!',
      }),
    });
    if (data.user.role !== 'user') throw new Error('Expected user role');
    if (!data.token) throw new Error('No token returned');
    memberToken = data.token;
  });

  // 4. Dynamic User Registration
  await runTest('Dynamic User Registration (New Team Member)', async () => {
    const rand = Math.floor(Math.random() * 90000) + 10000;
    const data = await request(`${BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        name: `QA Engineer ${rand}`,
        email: `qa_user_${rand}@taskflow.com`,
        password: 'Password123!',
      }),
    });
    if (data.user.role !== 'user') throw new Error('Expected user role');
    newUserId = data.user.id;
    newUserToken = data.token;
  });

  // 5. Fetch Tasks List
  await runTest('Fetch Kanban Tasks (Authenticated)', async () => {
    const data = await request(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!Array.isArray(data.tasks)) throw new Error('Tasks list is not an array');
  });

  // 6. Create Task with Priority HIGH & Due Date
  await runTest('Create Task with Priority HIGH & Due Date', async () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    const data = await request(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${newUserToken}` },
      body: JSON.stringify({
        title: `Automated QA Task #${Math.floor(Math.random() * 1000)}`,
        description: 'Validating real-time Kanban state sync',
        priority: 'HIGH',
        dueDate: dueDate.toISOString().split('T')[0],
      }),
    });
    if (data.task.priority !== 'HIGH') throw new Error('Priority was not HIGH');
    if (data.task.assignedUser !== null) throw new Error('New task should start unassigned');
    createdTaskId = data.task._id;
  });

  // 7. Member Self-Claims Task
  await runTest('Member Self-Claims Task (RBAC Check)', async () => {
    const data = await request(`${BASE_URL}/tasks/${createdTaskId}/assign`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${newUserToken}` },
      body: JSON.stringify({ assignedUserId: newUserId }),
    });
    if (data.task.assignedUser._id !== newUserId) throw new Error('Task was not assigned to claiming user');
  });

  // 8. Drag-and-Drop Pipeline Progression
  await runTest('Kanban Drag & Drop Pipeline (TODO -> DOING -> DONE)', async () => {
    const resDoing = await request(`${BASE_URL}/tasks/${createdTaskId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${newUserToken}` },
      body: JSON.stringify({ status: 'DOING' }),
    });
    if (resDoing.task.status !== 'DOING') throw new Error('Failed to move to DOING');

    const resDone = await request(`${BASE_URL}/tasks/${createdTaskId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${newUserToken}` },
      body: JSON.stringify({ status: 'DONE' }),
    });
    if (resDone.task.status !== 'DONE') throw new Error('Failed to move to DONE');
  });

  // 9. Admin Dynamic Reassignment
  await runTest('Admin Dynamic Reassignment (Return to Unassigned)', async () => {
    const data = await request(`${BASE_URL}/tasks/${createdTaskId}/assign`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ assignedUserId: null }),
    });
    if (data.task.assignedUser !== null) throw new Error('Task was not unassigned');
  });

  // 10. Activity / Audit Feed
  await runTest('Audit Log Feed (Tracked Activity Events)', async () => {
    const data = await request(`${BASE_URL}/activities`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!Array.isArray(data.activities) || data.activities.length === 0) {
      throw new Error('No activity events logged');
    }
  });

  // 11. Admin User Directory
  await runTest('Admin User Directory & Workload Analytics', async () => {
    const data = await request(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!Array.isArray(data.users) || data.users.length === 0) {
      throw new Error('No users returned');
    }
  });

  // 12. RBAC Security Guard
  await runTest('Security RBAC: Member Blocked from /api/users (403 Forbidden)', async () => {
    try {
      await request(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${memberToken}` },
      });
      throw new Error('Security Breach: Member accessed admin directory!');
    } catch (err) {
      if (err.status !== 403) {
        throw new Error(`Expected 403 Forbidden, got ${err.status}`);
      }
    }
  });

  // 13. Task Cleanup
  await runTest('Task Deletion & Cleanup', async () => {
    const data = await request(`${BASE_URL}/tasks/${createdTaskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!data.message || !data.message.includes('deleted')) {
      throw new Error('Task was not deleted');
    }
  });

  console.log('\n\x1b[36m%s\x1b[0m', '=========================================================');
  const summaryColor = failed === 0 ? '\x1b[32m' : '\x1b[31m';
  console.log(summaryColor + `   QA TEST SUMMARY: ${passed} / ${total} TESTS PASSED` + '\x1b[0m');
  console.log('\x1b[36m%s\x1b[0m', '=========================================================\n');
}

main();
