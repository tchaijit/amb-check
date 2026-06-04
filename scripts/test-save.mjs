const BASE = 'https://bsi-amb-check.vercel.app';

function mergeCookies(...jars) {
  const map = new Map();
  for (const jar of jars) {
    for (const c of jar) {
      const pair = c.split(';')[0];
      const eq = pair.indexOf('=');
      map.set(pair.slice(0, eq), pair.slice(eq + 1));
    }
  }
  return [...map.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
}

async function main() {
  const csrfRes = await fetch(BASE + '/api/auth/csrf');
  const { csrfToken } = await csrfRes.json();
  let cookies = mergeCookies(csrfRes.headers.getSetCookie());

  const loginRes = await fetch(BASE + '/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: cookies },
    body: new URLSearchParams({ csrfToken, email: 'driver@hospital.com', password: 'password123', redirect: 'false', json: 'true' }),
    redirect: 'manual',
  });
  cookies = mergeCookies(csrfRes.headers.getSetCookie(), loginRes.headers.getSetCookie());
  console.log('login status:', loginRes.status);

  const sess = await fetch(BASE + '/api/auth/session', { headers: { Cookie: cookies } });
  const sj = await sess.json();
  console.log('session:', JSON.stringify(sj.user || sj));
  if (!sj.user) { console.error('NOT LOGGED IN — abort'); return; }

  // create/get today's inspection for ambulance 1
  const postRes = await fetch(BASE + '/api/inspections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookies },
    body: JSON.stringify({ ambulanceId: 1 }),
  });
  const pj = await postRes.json();
  const inspId = pj.inspection?.id;
  console.log('POST inspection status:', postRes.status, '| id:', inspId);

  // PUT one item exactly like the frontend does
  const putRes = await fetch(BASE + `/api/inspections/${inspId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: cookies },
    body: JSON.stringify({
      items: [{
        category: 'driver_check',
        itemName: 'SELFTEST item',
        itemCode: '__SELFTEST__',
        inspectorRole: 'driver',
        status: 'normal',
        value: 'ok',
        remarks: null,
        inspectedBy: sj.user.id ? parseInt(sj.user.id) : 1,
        employeeCode: 'EMP-TEST',
      }],
      role: 'driver',
      completed: true,
    }),
  });
  console.log('PUT status:', putRes.status, '| body:', await putRes.text());
}

main().catch((e) => console.error('FAIL:', e.message));
