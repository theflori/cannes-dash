// deploy-marker 1778398832
// GET /api/guests
// Returns all RSVP records from Airtable as JSON

export async function onRequestGet(context) {
  const { env } = context;

  const required = ['AIRTABLE_TOKEN', 'AIRTABLE_BASE_ID', 'AIRTABLE_TABLE_NAME'];
  for (const k of required) {
    if (!env[k]) {
      return jsonError(`Missing env: ${k}`, 500);
    }
  }

  try {
    const records = await fetchAllRecords(env);
    const guests = records.map(formatRecord);
    return new Response(JSON.stringify({ guests, total: guests.length }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  } catch (err) {
    return jsonError('Failed to fetch from Airtable: ' + err.message, 500);
  }
}

async function fetchAllRecords(env) {
  const records = [];
  let offset = null;
  const url = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_TABLE_NAME}`;

  do {
    const params = new URLSearchParams({ pageSize: '100' });
    if (offset) params.set('offset', offset);

    const res = await fetch(`${url}?${params}`, {
      headers: { Authorization: `Bearer ${env.AIRTABLE_TOKEN}` }
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Airtable ${res.status}: ${text.substring(0, 200)}`);
    }

    const data = await res.json();
    records.push(...data.records);
    offset = data.offset || null;
  } while (offset);

  return records;
}

function formatRecord(record) {
  const f = record.fields || {};
  // Normalize Instagram handle: strip @, strip URL prefix
  const igRaw = f['Instagram'] || '';
  const igHandle = String(igRaw)
    .replace(/^@/, '')
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
    .replace(/\/$/, '')
    .trim();

  return {
    id: record.id,
    name: f['Full Name'] || '',
    email: f['Email'] || '',
    phone: f['Phone'] || '',
    company: f['Company / Industry'] || '',
    instagram: igHandle,
    referredBy: f['Referred By'] || '',
    status: f['Status'] || '',
    messagingStatus: f['Messaging Status'] || '',
    source: f['Source'] || '',
    tags: Array.isArray(f['Tags']) ? f['Tags'] : [],
    notes: f['Internal Notes'] || '',
    igFollowers: typeof f['IG Followers'] === 'number' ? f['IG Followers'] : null,
    igAvatarUrl: f['IG Avatar URL'] || '',
    igLastRefresh: f['IG Last Refresh'] || '',
    createdTime: record.createdTime
  };
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
