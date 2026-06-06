/*
  sheets-sync — Netlify Function
  تقرأ بيانات التطبيق من Google Sheets وتعيدها كـ JSON

  متغير البيئة الوحيد المطلوب في Netlify:
    GOOGLE_SHEETS_API_KEY  — مفتاح API من Google Cloud Console

  معرفات الـ Spreadsheets (محفوظة هنا ويمكن تجاوزها بمتغيرات بيئة):
    SHEETS_ID_SUMMARIES    — جدول ملخصات الأستاذ
    SHEETS_ID_INFOGRAPHICS — جدول الإنفوغرافيا
    SHEETS_ID_CONFIG       — جدول الإعدادات
*/

const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;

const SHEET_IDS = {
  summaries:    process.env.SHEETS_ID_SUMMARIES    || '1ovR0p1Vvo41LEZ3L2MY5wMDGDDVr6tiCil9TrIdVnb0',
  infographics: process.env.SHEETS_ID_INFOGRAPHICS || '1O8ynB9iMih_TZNMf8UGm2u_6xqClDenAB1EyGtarbjQ',
  config:       process.env.SHEETS_ID_CONFIG       || '1-59ZLmmlVkNAeXkDU_b2TWz3FMziwz4vvQ09qGj-9nE'
};

async function getRange(sheetId, range) {
  const encoded = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encoded}?key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sheets API ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.values || [];
}

function toObjects(rows) {
  if (rows.length < 2) return [];
  const [headers, ...data] = rows;
  return data
    .filter(row => row.some(Boolean))
    .map(row => Object.fromEntries(headers.map((h, i) => [h.trim(), (row[i] || '').trim()])));
}

const HEADERS = {
  'Content-Type':                'application/json',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control':               'public, max-age=300'
};

exports.handler = async (event) => {
  if (!API_KEY) {
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ error: 'GOOGLE_SHEETS_API_KEY غير مضبوط', configured: false })
    };
  }

  const type = event.queryStringParameters?.type || 'summaries';

  try {
    if (type === 'summaries') {
      const rows = await getRange(SHEET_IDS.summaries, 'A:C');
      const summaries = toObjects(rows);
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ summaries }) };
    }

    if (type === 'infographics') {
      const rows = await getRange(SHEET_IDS.infographics, 'A:I');
      const cards = toObjects(rows).map(r => ({ ...r, order: parseInt(r.order) || 0 }));
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ cards }) };
    }

    if (type === 'config') {
      const rows = await getRange(SHEET_IDS.config, 'A:B');
      const config = {};
      rows.slice(1).forEach(([k, v]) => { if (k) config[k.trim()] = (v || '').trim(); });
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(config) };
    }

    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'type غير معروف' }) };

  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
