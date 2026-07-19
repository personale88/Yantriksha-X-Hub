const assert = require('assert');

async function runTests() {
  const baseUrl = 'http://localhost:3000/api';
  const prefix = `feat_${Math.floor(Math.random() * 100000)}`;

  console.log(`Starting Phase 2 Features Endpoint Tests...`);

  // Helper to register a user
  async function register(veltech_id, name, email, role, discipline, password) {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        veltech_id, 
        name, 
        email, 
        role, 
        discipline, 
        password,
        phone_number: role === 'student' ? '9876543210' : undefined,
        year_of_studying: role === 'student' ? '2' : undefined,
        branch: role === 'student' ? 'CSE' : undefined
      })
    });
    return res.json();
  }

  // Helper to login and get token cookie
  async function login(email, password) {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const cookie = res.headers.get('set-cookie');
    const data = await res.json();
    return { token: cookie, user: data.user };
  }

  // 1. Create a set of test accounts
  console.log('\nCreating test accounts...');
  
  // Leader (Engineering student)
  const leaderId = `${prefix}_leader`;
  await register(leaderId, 'Leader Student', `${leaderId}@veltech.edu.in`, 'student', 'engineering', 'pass123');
  const leaderSession = await login(`${leaderId}@veltech.edu.in`, 'pass123');

  // Faculty Advisor (faculty)
  const facultyId = `${prefix}_faculty`;
  await register(facultyId, 'Faculty Advisor', `${facultyId}@veltech.edu.in`, 'faculty', 'other', 'pass123');
  const facultySession = await login(`${facultyId}@veltech.edu.in`, 'pass123');
  
  // Mentor (mentor)
  const mentorId = `${prefix}_mentor`;
  await register(mentorId, 'Industry Mentor', `${mentorId}@veltech.edu.in`, 'mentor', 'other', 'pass123');
  const mentorSession = await login(`${mentorId}@veltech.edu.in`, 'pass123');

  // Law student
  const lawId = `${prefix}_law`;
  await register(lawId, 'Law Student', `${lawId}@veltech.edu.in`, 'student', 'law', 'pass123');
  const lawUser = await login(`${lawId}@veltech.edu.in`, 'pass123');

  // Business student
  const bizId = `${prefix}_biz`;
  await register(bizId, 'Biz Student', `${bizId}@veltech.edu.in`, 'student', 'business', 'pass123');
  const bizUser = await login(`${bizId}@veltech.edu.in`, 'pass123');

  // Other students (to fill team up to 10 members)
  const otherUsers = [];
  for (let i = 1; i <= 6; i++) {
    const uId = `${prefix}_other${i}`;
    await register(uId, `Student ${i}`, `${uId}@veltech.edu.in`, 'student', 'other', 'pass123');
    const user = await login(`${uId}@veltech.edu.in`, 'pass123');
    otherUsers.push(user.user);
  }

  // 11th student (for overflow check)
  const uId11 = `${prefix}_other11`;
  await register(uId11, `Student 11`, `${uId11}@veltech.edu.in`, 'student', 'other', 'pass123');
  const user11 = await login(`${uId11}@veltech.edu.in`, 'pass123');

  console.log('✓ Test accounts created successfully.');

  // 2. Create team
  console.log('\n[Test 1] Creating a team...');
  let teamRes = await fetch(`${baseUrl}/teams`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': leaderSession.token
    },
    body: JSON.stringify({
      team_name: `${prefix}_team`,
      sector: 'Renewable Energy'
    })
  });
  let teamData = await teamRes.json();
  assert.strictEqual(teamRes.status, 201);
  assert.strictEqual(teamData.success, true);
  // Leader is Engineering: should be 20% compliance
  assert.strictEqual(teamData.team.compliancePercentage, 20);
  console.log('✓ Team created with initial compliance score (20%).');

  // 3. Add members one by one and check compliance
  console.log('\n[Test 2] Adding members to verify compliance calculations...');
  const teamId = teamData.team.teamId;

  // Add Faculty Advisor
  let addRes = await fetch(`${baseUrl}/teams/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': leaderSession.token },
    body: JSON.stringify({ user_id: facultySession.user.id })
  });
  let addData = await addRes.json();
  assert.strictEqual(addData.team.compliancePercentage, 40); // Eng (20) + Faculty (20)

  // Add Law student
  addRes = await fetch(`${baseUrl}/teams/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': leaderSession.token },
    body: JSON.stringify({ user_id: lawUser.user.id })
  });
  addData = await addRes.json();
  assert.strictEqual(addData.team.compliancePercentage, 60); // Eng + Faculty + Law

  // Add Business student
  addRes = await fetch(`${baseUrl}/teams/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': leaderSession.token },
    body: JSON.stringify({ user_id: bizUser.user.id })
  });
  addData = await addRes.json();
  assert.strictEqual(addData.team.compliancePercentage, 80); // Eng + Faculty + Law + Biz

  // Add 5 other students (total 9 members including leader)
  for (let i = 0; i < 5; i++) {
    addRes = await fetch(`${baseUrl}/teams/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': leaderSession.token },
      body: JSON.stringify({ user_id: otherUsers[i].id })
    });
  }

  // Add 10th student (total 10 members -> 100% compliance)
  addRes = await fetch(`${baseUrl}/teams/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': leaderSession.token },
    body: JSON.stringify({ user_id: otherUsers[5].id })
  });
  addData = await addRes.json();
  assert.strictEqual(addData.team.compliancePercentage, 100);
  assert.strictEqual(addData.team.errors.length, 0);
  console.log('✓ All compliance steps and 10-member rule validated successfully.');

  // 4. Try to add 11th member
  console.log('\n[Test 3] Attempting to add an 11th member...');
  addRes = await fetch(`${baseUrl}/teams/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': leaderSession.token },
    body: JSON.stringify({ user_id: user11.user.id })
  });
  addData = await addRes.json();
  assert.strictEqual(addRes.status, 400);
  assert.strictEqual(addData.success, false);
  console.log('✓ Blocked 11th member successfully (Team limit enforced).');

  // 5. Test CRUD for milestones
  console.log('\n[Test 4] Testing milestones CRUD...');
  let milestoneRes = await fetch(`${baseUrl}/milestones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': leaderSession.token },
    body: JSON.stringify({
      milestone_step: 1,
      report_content: 'Initial Idea brainstorming report',
      file_url: '/uploads/report1.pdf'
    })
  });
  let milestoneData = await milestoneRes.json();
  assert.strictEqual(milestoneRes.status, 201);
  const reportId = milestoneData.reportId;

  // Verify list
  let listRes = await fetch(`${baseUrl}/milestones`, {
    method: 'GET',
    headers: { 'Cookie': leaderSession.token }
  });
  let listData = await listRes.json();
  assert.ok(listData.reports.length > 0);

  // Evaluate report (Mentor approves)
  let evalRes = await fetch(`${baseUrl}/milestones/${reportId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cookie': mentorSession.token },
    body: JSON.stringify({
      status: 'approved',
      mentor_feedback: 'Outstanding project plan, proceeding to next phase!'
    })
  });
  assert.strictEqual(evalRes.status, 200);

  // Check if team stage has updated to 2
  let tRes = await fetch(`${baseUrl}/teams`, {
    headers: { 'Cookie': leaderSession.token }
  });
  let tData = await tRes.json();
  assert.strictEqual(tData.team.currentStage, 2);
  console.log('✓ Milestones CRUD and stage advancement verified.');

  // 6. Test CRUD for funding requests
  console.log('\n[Test 5] Testing funding claims CRUD...');
  
  // Submit request > 50,000 (should fail)
  let fundRes = await fetch(`${baseUrl}/funding/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': leaderSession.token },
    body: JSON.stringify({
      requested_amount: 60000,
      itemized_budget: { components: 30000, tools: 30000 }
    })
  });
  assert.strictEqual(fundRes.status, 400);

  // Submit valid request
  fundRes = await fetch(`${baseUrl}/funding/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': leaderSession.token },
    body: JSON.stringify({
      requested_amount: 35000,
      itemized_budget: { components: 15000, sensors: 10000, software: 10000 }
    })
  });
  let fundData = await fundRes.json();
  assert.strictEqual(fundRes.status, 201);
  const claimId = fundData.claimId;

  // Approve claim
  let approveRes = await fetch(`${baseUrl}/funding/claim/${claimId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cookie': facultySession.token },
    body: JSON.stringify({ status: 'approved' })
  });
  assert.strictEqual(approveRes.status, 200);
  console.log('✓ Funding claim submission and limits verified.');

  // 7. Test CRUD for mentorship bookings
  console.log('\n[Test 6] Testing bookings CRUD...');
  let bookingRes = await fetch(`${baseUrl}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': leaderSession.token },
    body: JSON.stringify({
      team_id: teamId,
      mentor_id: mentorSession.user.id,
      scheduled_time: '2026-07-20 10:00:00',
      mode: 'virtual',
      meeting_link_or_venue: 'https://zoom.us/j/12345678'
    })
  });
  let bookingData = await bookingRes.json();
  assert.strictEqual(bookingRes.status, 201);
  const bookingId = bookingData.bookingId;

  // Update status (mark completed)
  let updateBookRes = await fetch(`${baseUrl}/bookings/${bookingId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cookie': mentorSession.token },
    body: JSON.stringify({ status: 'completed' })
  });
  assert.strictEqual(updateBookRes.status, 200);
  console.log('✓ Bookings CRUD verified.');

  // 8. Test Matchmaker search, filtering, and pagination
  console.log('\n[Test 7] Testing Team Matchmaker pagination and search...');
  let matchRes = await fetch(`${baseUrl}/teams/matchmaker?search=${prefix}_team&limit=5`);
  let matchData = await matchRes.json();
  assert.strictEqual(matchRes.status, 200);
  assert.strictEqual(matchData.teams.length, 1);
  assert.strictEqual(matchData.teams[0].team_name, `${prefix}_team`);
  console.log('✓ Team Matchmaker pagination and search queries verified.');

  console.log('\n=============================================');
  console.log('🎉 ALL PHASE 2 ENDPOINT INTEGRATION TESTS PASSED!');
  console.log('=============================================\n');
}

runTests().catch(err => {
  console.error('✗ Testing Failed:', err);
  process.exit(1);
});
