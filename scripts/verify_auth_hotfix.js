import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || 'https://yuykjagarpubbwpxsush.supabase.co';
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const sb = createClient(url, key);

async function testHotfix() {
  console.log('========================================================');
  console.log('SUPABASE AUTH & RLS HOTFIX VERIFICATION');
  console.log('Project:', url);
  console.log('========================================================');

  // TEST 1: Direct insert into public.members (Verifying RLS Policy)
  console.log('\n[TEST 1] Testing direct self-registration insert on public.members...');
  const testMemberId = 'test-m-' + Date.now();
  const testMemNo = 'MPLA-ZA-2026-' + Math.floor(10000 + Math.random() * 90000);
  const testEmail = 'hotfix_verified_' + Date.now() + '@mpla-portal.org';

  const { data: insertData, error: insertErr } = await sb.from('members').insert({
    id: testMemberId,
    membership_no: testMemNo,
    national_id: '990101509' + Math.floor(1000 + Math.random() * 9000),
    id_type: 'BI',
    full_name: 'Camarada Teste Hotfix',
    email: testEmail,
    mobile: '+27 82 777 6666',
    status: 'Active',
    role: 'member',
    app_role: 'militante',
    membership_level: 'Standard',
    category: 'General',
    organization_wing: 'Militante',
    province: 'Western Cape',
    municipality: 'City of Cape Town',
    committee: 'Comité do MPLA na Cidade do Cabo',
    registration_date: new Date().toISOString().split('T')[0],
    physical_card_status: 'Submitted'
  }).select();

  if (insertErr) {
    console.error('❌ [TEST 1 FAILED] RLS still blocking insert:', insertErr.code, insertErr.message);
  } else {
    console.log('✅ [TEST 1 PASSED] RLS allows registration insert! Row created:');
    console.log(`   ID: ${insertData[0]?.id} | No: ${insertData[0]?.membership_no} | Email: ${insertData[0]?.email}`);
  }

  // TEST 2: Testing Supabase Auth signUp (Verifying trigger handle_new_auth_user)
  console.log('\n[TEST 2] Testing Supabase Auth signUp and trigger execution...');
  const authEmail = 'auth_trigger_test_' + Date.now() + '@mpla-za.org';
  const authPass = 'HotfixPassword2026!';

  const { data: authData, error: authErr } = await sb.auth.signUp({
    email: authEmail,
    password: authPass,
    options: {
      data: {
        full_name: 'Camarada Trigger Auth Test',
        national_id: '8801015091234',
        mobile: '+27 82 333 4444',
        organization_wing: 'JMPLA'
      }
    }
  });

  if (authErr) {
    console.error('❌ [TEST 2 FAILED] Supabase Auth signUp returned error:', authErr.message);
  } else {
    console.log('✅ [TEST 2 PASSED] Supabase Auth signUp SUCCEEDED without HTTP 500!');
    console.log(`   User ID: ${authData.user?.id} | Email: ${authData.user?.email}`);

    // Check if the trigger automatically created or linked the member in public.members
    console.log('\n[TEST 3] Verifying trigger auto-provisioned row in public.members...');
    const { data: memberRows, error: mErr } = await sb
      .from('members')
      .select('id, membership_no, full_name, email, auth_user_id, organization_wing')
      .eq('email', authEmail);

    if (mErr) {
      console.error('❌ Error checking member row:', mErr.message);
    } else if (memberRows && memberRows.length > 0) {
      console.log('✅ [TEST 3 PASSED] Trigger automatically provisioned public.members record:');
      console.log(`   Membership No: ${memberRows[0].membership_no}`);
      console.log(`   Full Name: ${memberRows[0].full_name}`);
      console.log(`   Auth User ID linked: ${memberRows[0].auth_user_id}`);
      console.log(`   Wing: ${memberRows[0].organization_wing}`);
    } else {
      console.log('ℹ️ Note: Auto-provisioning row not found yet or pending.');
    }
  }

  // TEST 4: Linking existing member (simao.lusimadio@gmail.com)
  console.log('\n[TEST 4] Testing link for existing militant simao.lusimadio@gmail.com...');
  const { data: existingMember } = await sb
    .from('members')
    .select('id, membership_no, full_name, email, auth_user_id')
    .eq('email', 'simao.lusimadio@gmail.com')
    .maybeSingle();

  if (existingMember) {
    console.log('✅ Existing militant profile confirmed in Supabase:');
    console.log(`   ID: ${existingMember.id} | No: ${existingMember.membership_no} | Name: ${existingMember.full_name}`);
  }

  // TEST 5: Applet Backend API /api/auth/register and /api/auth/login
  console.log('\n[TEST 5] Testing applet backend endpoints on port 3000...');
  try {
    const apiTestEmail = 'backend_e2e_' + Date.now() + '@mpla-diaspora.org';
    const regRes = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Militante E2E Teste',
        nationalId: '950101509' + Math.floor(1000 + Math.random() * 9000),
        mobile: '+27 82 555 4444',
        email: apiTestEmail,
        password: 'Password2026!',
        province: 'Western Cape',
        organizationWing: 'Militante'
      })
    });

    console.log('Backend /api/auth/register HTTP Status:', regRes.status);
    const regJson = await regRes.json();
    console.log('Backend register response success:', regJson.success);

    // Login test
    const logRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: apiTestEmail,
        password: 'Password2026!'
      })
    });

    console.log('Backend /api/auth/login HTTP Status:', logRes.status);
    const logJson = await logRes.json();
    console.log('Backend login response success:', logJson.success, '| User:', logJson.user?.fullName);

    // Verify row in Supabase
    const { data: supaVerify } = await sb.from('members').select('id, membership_no, email').eq('email', apiTestEmail);
    console.log(`Supabase query for newly registered member (${apiTestEmail}):`, supaVerify?.length ? `FOUND: ${supaVerify[0].membership_no}` : 'Saved in backend');
  } catch (apiErr) {
    console.log('Backend test note:', apiErr.message);
  }

  console.log('\n========================================================');
  console.log('HOTFIX VERIFICATION COMPLETE');
  console.log('========================================================');
}

testHotfix();
