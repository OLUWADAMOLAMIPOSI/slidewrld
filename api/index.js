const SUPABASE_URL = 'https://zaovyywfqykaghrgfiap.supabase.co';
const SUPABASE_KEY = 'sb_publishable_PzxqQfj9CvhyaDxWf79tGg_MPq_ViOY';

const DEFAULT_DATA = {
  products: [],
  orders: [],
  subscribers: [],
  settings: {}
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const action = req.query.action || '';

  const supabaseHeaders = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json'
  };

  if (action === 'get') {
    try {
      const supaRes = await fetch(
        SUPABASE_URL + '/rest/v1/store_data?id=eq.1&select=data',
        { headers: supabaseHeaders }
      );
      if (!supaRes.ok) {
        const errText = await supaRes.text();
        throw new Error('Supabase returned ' + supaRes.status + ': ' + errText);
      }
      const rows = await supaRes.json();
      const data = (rows[0] && rows[0].data) || DEFAULT_DATA;
      res.status(200).json(data);
    } catch (e) {
      console.error('GET error:', e.message);
      res.status(200).json(DEFAULT_DATA);
    }
    return;
  }

  if (action === 'save') {
    try {
      // req.body is already parsed to an object by Vercel when the
      // request has Content-Type: application/json.
      const data = req.body;

      const supaRes = await fetch(
        SUPABASE_URL + '/rest/v1/store_data?on_conflict=id',
        {
          method: 'POST',
          headers: {
            ...supabaseHeaders,
            'Prefer': 'resolution=merge-duplicates,return=representation'
          },
          body: JSON.stringify({
            id: 1,
            data: data,
            updated_at: new Date().toISOString()
          })
        }
      );

      if (!supaRes.ok) {
        const errText = await supaRes.text();
        throw new Error('Supabase returned ' + supaRes.status + ': ' + errText);
      }

      const result = await supaRes.json();
      res.status(200).json({ success: true, row: result });
    } catch (e) {
      console.error('SAVE error:', e.message);
      res.status(400).json({ success: false, error: e.message });
    }
    return;
  }

  if (action === 'ping') {
    res.status(200).json({
      status: 'ok',
      message: 'SlideWrld API is running with Supabase storage',
      timestamp: new Date().toISOString()
    });
    return;
  }

  res.status(400).json({ error: 'Invalid action' });
};