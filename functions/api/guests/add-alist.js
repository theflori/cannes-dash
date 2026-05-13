// deploy-marker add-alist-v1
// POST /api/guests/add-alist
// Body: { name, email, phone, instagram, notes, autoList }
// Creates new Airtable record tagged "A-List".

import { jsonError, jsonOk } from '../../_lib/messaging-utils.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.AIRTABLE_TOKEN || !env.AIRTABLE_BASE_ID || !env.AIRTABLE_TABLE_NAME) {
    return jsonError('Missing Airtable env', 500);
  }

  let body;
  try { body = await request.json(); }
  catch { return jsonError('Invalid JSON', 400); }

  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  if (!name) return jsonError('name required', 400);
  if (!email || !email.includes('@')) return jsonError('valid email required', 400);

  const fields = {
    'Full Name': name,
    'Email': email,
    'Tags': ['A-List']
  };
  if (body.phone) fields['Phone'] = String(body.phone).trim();
  if (body.instagram) fields['Instagram'] = String(body.instagram).trim().replace(/^@/, '');
  if (body.notes) fields['Internal Notes'] = String(body.notes).trim();
  if (body.autoList) fields['Messaging Status'] = 'Listed';
  fields['Source'] = 'Manual A-List';

  const url = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_TABLE_NAME}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + env.AIRTABLE_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields, typecast: true })
  });
  const data = await res.json();
  if (!res.ok) {
    return jsonError('Airtable error: ' + (data.error?.message || JSON.stringify(data.error)), 500);
  }

  return jsonOk({ id: data.id, fields: data.fields });
}
