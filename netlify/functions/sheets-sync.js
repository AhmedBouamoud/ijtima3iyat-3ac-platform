/*
  sheets-sync — Netlify Function
  تقرأ بيانات التطبيق من Google Sheets وتعيدها كـ JSON

  متغيرات البيئة المطلوبة في Netlify:
    GOOGLE_SHEETS_API_KEY  — مفتاح API من Google Cloud Console
    GOOGLE_SHEETS_ID       — معرف الـ Spreadsheet من رابط Drive

  أوراق العمل المتوقعة داخل الـ Spreadsheet:
    ملخصات      — id | title | driveUrl
    إنفوغرافيا  — order | domain | emoji | title | point1 | point2 | point3 | point4 | lessonUrl
    إعدادات     — key | value
*/

const API_KEY  = process.env.GOOGLE_SHEETS_API_KEY;
const SHEET_ID = process.env.GOOGLE_SHEETS_ID;

async function getRange(sheet, range) {
  const encoded = encodeURIComponent(`${sheet}!${range}`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encoded}?key=${API_KEY}`;
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
  if (!API_KEY || !SHEET_ID) {
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Google Sheets not configured', configured: false })
    };
  }

  const type = event.queryStringParameters?.type || 'summaries';

  try {
    if (type === 'summaries') {
      const rows = await getRange('ملخصات', 'A:C');
      const summaries = toObjects(rows);
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ summaries }) };
    }

    if (type === 'infographics') {
      const rows = await getRange('إنفوغرافيا', 'A:I');
      const cards = toObjects(rows).map(r => ({ ...r, order: parseInt(r.order) || 0 }));
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ cards }) };
    }

    if (type === 'config') {
      const rows = await getRange('إعدادات', 'A:B');
      const config = {};
      rows.slice(1).forEach(([k, v]) => { if (k) config[k.trim()] = (v || '').trim(); });
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(config) };
    }

    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'type غير معروف' }) };

  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
