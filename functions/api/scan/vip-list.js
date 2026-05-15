// deploy-marker scan-vip-list-v1
// GET /api/scan/vip-list
//
// Returns guests with Importance = 'VIP/Car' for the scanner staff.
// Lightweight payload — only the fields needed at the door:
//   name, instagram, igAvatarUrl, igFollowers, checkedIn, company, importance
//
// Accessible by staff role (allowed via middleware on /api/scan/*).

import { jsonError, jsonOk } from '../../_lib/messaging-utils.js';

export async function onRequestGet(context) {
  const { env } = context;

  for (const k of ['AIRTABLE_TOKEN', 'AIRTABLE_BASE_ID', 'AIRTABLE_TABLE_NAME']) {
    if (!env[k]) return jsonError('Missing env: ' + k, 500);
  }

  // Pull all records flagged for door priority. Single Airtable page can carry up to 100;
  // for safety we paginate up to 5 pages (500 records) — way above any sane
  // VIP allocation for one evening.
  //
  // Criteria for inclusion (ANY of):
  //   - {Importance} is set (VIP/Car, Tier 1, Tier 2, Tier 3)
  //   - Tags includes 'A-List' (manually starred guests)
  //   - {Source} = 'Manual A-List' (older A-List flag if Tags wasn't used)
  // Excludes Declined / Rejected so door staff don't see no-shows.
  const baseUrl = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_TABLE_NAME}`;
  const formula =
    "AND(" +
      "OR(" +
        "{Importance} != ''," +
        "FIND('A-List', ARRAYJOIN({Tags}))," +
        "{Source} = 'Manual A-List'" +
      ")," +
      "{Status} != 'Rejected'," +
      "{Messaging Status} != 'Declined'" +
    ")";
  const all = [];
  let offset = '';
  for (let i = 0; i < 5; i++) {
    const url = new URL(baseUrl);
    url.searchParams.set('filterByFormula', formula);
    url.searchParams.set('pageSize', '100');
    if (offset) url.searchParams.set('offset', offset);

    const res = await fetch(url.toString(), {
      headers: { Authorization: 'Bearer ' + env.AIRTABLE_TOKEN }
    });
    if (!res.ok) {
      const t = await res.text();
      return jsonError('Airtable error ' + res.status + ': ' + t.substring(0, 200), 500);
    }
    const data = await res.json();
    if (Array.isArray(data.records)) all.push(...data.records);
    offset = data.offset || '';
    if (!offset) break;
  }

  const guests = all.map(rec => {
    const f = rec.fields || {};
    const igRaw = f['Instagram'] || '';
    const igHandle = igRaw.toString().trim().replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '');
    const tags = Array.isArray(f['Tags']) ? f['Tags'] : [];
    return {
      id: rec.id,
      name: f['Full Name'] || '',
      instagram: igHandle,
      igAvatarUrl: f['IG Avatar URL'] || '',
      igFollowers: typeof f['IG Followers'] === 'number' ? f['IG Followers'] : null,
      company: f['Company / Industry'] || '',
      checkedIn: f['Checked In'] === true,
      checkedInAt: f['Checked In At'] || '',
      hasPaid: f['Has Paid'] === true,
      status: f['Status'] || '',
      importance: f['Importance'] || '',
      tags,
      source: f['Source'] || '',
      isAList: tags.includes('A-List') || f['Source'] === 'Manual A-List'
    };
  });

  // Sort: VIP/Car first, then Tier 1, Tier 2, Tier 3, then A-List, then alphabetical
  const importanceRank = { 'VIP/Car': 0, 'Tier 1': 1, 'Tier 2': 2, 'Tier 3': 3 };
  guests.sort((a, b) => {
    if (a.checkedIn !== b.checkedIn) return a.checkedIn ? 1 : -1;
    const ar = a.importance in importanceRank ? importanceRank[a.importance] : (a.isAList ? 4 : 5);
    const br = b.importance in importanceRank ? importanceRank[b.importance] : (b.isAList ? 4 : 5);
    if (ar !== br) return ar - br;
    return a.name.localeCompare(b.name);
  });

  return jsonOk({ guests, count: guests.length });
}
