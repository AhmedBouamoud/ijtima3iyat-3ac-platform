const NOTION_KEY = process.env.NOTION_API_KEY;

// Database IDs (page IDs from Notion)
const DB = {
  lessons:      '81d0af5e10704361917d153b178cd0a7',
  infographics: 'ee686192102b4e978f32f69700962bea',
  videos:       'b20102749526462580b53725b5f432e0',
  exams:        'e35f5ef46e594ffab90c1485434c9284'
};

async function queryDB(dbId) {
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_KEY}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    body: JSON.stringify({
      sorts: [{ property: 'الترتيب', direction: 'ascending' }]
    })
  });
  if (!res.ok) throw new Error(`Notion API error: ${res.status}`);
  return res.json();
}

function prop(page, name, type) {
  const p = page.properties?.[name];
  if (!p) return null;
  switch (type) {
    case 'title':   return p.title?.map(t => t.plain_text).join('') || '';
    case 'text':    return p.rich_text?.map(t => t.plain_text).join('') || '';
    case 'select':  return p.select?.name || '';
    case 'number':  return p.number ?? null;
    case 'url':     return p.url || '';
    default:        return null;
  }
}

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=300'
  };

  if (!NOTION_KEY) {
    return { statusCode: 200, headers,
      body: JSON.stringify({ error: 'NOTION_API_KEY not configured', lessons: [] }) };
  }

  try {
    const type = event.queryStringParameters?.type || 'lessons';
    const dbId = DB[type] || DB.lessons;
    const data = await queryDB(dbId);

    let result;
    if (type === 'lessons') {
      result = data.results.map(p => {
        const url = prop(p, 'رابط الدرس', 'url') || '';
        const slug = url.split('/').pop().replace('.html', '') || '';
        return {
          id:          prop(p, 'العنوان', 'title'),
          slug,
          domain:      prop(p, 'المجال', 'select'),
          order:       prop(p, 'الترتيب', 'number'),
          idea:        prop(p, 'الفكرة العامة', 'text'),
          axes:        prop(p, 'المحاور', 'text'),
          terms:       prop(p, 'المصطلحات الأساسية', 'text'),
          dates:       prop(p, 'التواريخ المهمة', 'text'),
          url,
          status:      prop(p, 'حالة الإنجاز', 'select'),
          teacherNote: prop(p, 'ملاحظات الأستاذ', 'text')
        };
      }).filter(l => l.id);
    } else {
      result = data.results.map(p => ({
        title: prop(p, 'العنوان', 'title') || prop(p, 'title', 'title'),
        order: prop(p, 'الترتيب', 'number'),
        url:   prop(p, 'رابط', 'url') || prop(p, 'رابط الدرس', 'url')
      }));
    }

    return { statusCode: 200, headers, body: JSON.stringify({ [type]: result }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
