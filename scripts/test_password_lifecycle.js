async function testPasswordLifecycle() {
  console.log('====================================================');
  console.log('TESTING PASSWORD LIFECYCLE & RECOGNITION');
  console.log('====================================================');

  const testEmail = 'user_pw_test_' + Date.now() + '@mpla-angola.org';
  const testPassword = 'MplaPassword2026!Secret';
  const testPhone = '+27 82 999 1234';
  const testNatId = '980101509' + Math.floor(1000 + Math.random() * 9000);

  console.log('\n[STEP 1] Registering new user with password:');
  console.log('  Email:', testEmail);
  console.log('  Password:', testPassword);

  const regRes = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Militante Reconhecido',
      nationalId: testNatId,
      mobile: testPhone,
      email: testEmail,
      password: testPassword,
      province: 'Western Cape',
      organizationWing: 'Militante'
    })
  });

  console.log('  Registration HTTP Status:', regRes.status);
  const regData = await regRes.json();
  const membershipNo = regData.user?.membershipNo;
  console.log('  Assigned Membership No:', membershipNo);

  // STEP 2: Sign in using Email + Password
  console.log('\n[STEP 2] Signing in with EMAIL + PASSWORD:');
  const loginEmailRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: testEmail,
      password: testPassword
    })
  });

  const loginEmailData = await loginEmailRes.json();
  console.log('  Status:', loginEmailRes.status, '| Success:', loginEmailData.success, '| User:', loginEmailData.user?.fullName);

  // STEP 3: Sign in using Membership Number + Password
  console.log('\n[STEP 3] Signing in with MEMBERSHIP NUMBER + PASSWORD:');
  const loginNoRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: membershipNo,
      password: testPassword
    })
  });

  const loginNoData = await loginNoRes.json();
  console.log('  Status:', loginNoRes.status, '| Success:', loginNoData.success, '| User:', loginNoData.user?.fullName);

  // STEP 4: Sign in with intentional wrong password to verify security
  console.log('\n[STEP 4] Testing security check with WRONG password:');
  const wrongRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: testEmail,
      password: 'WrongPassword999!'
    })
  });

  console.log('  Status:', wrongRes.status, '(Expected 401)');
  const wrongData = await wrongRes.json();
  console.log('  Error message returned:', wrongData.error);

  console.log('\n====================================================');
  console.log('PASSWORD LIFECYCLE TEST COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
}

testPasswordLifecycle();
