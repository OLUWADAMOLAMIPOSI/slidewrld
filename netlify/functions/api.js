const SUPABASE_URL = 'https://zaovyywfqykaghrgfiap.supabase.co';
const SUPABASE_KEY = 'sb_publishable_PzxqQfj9CvhyaDxWf79tGg_MPq_ViOY';

const DEFAULT_DATA = {
  products: [],
  orders: [],
  subscribers: [],
  settings: {}
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    'Pragma': 'no-cache'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const url = new URL(event.rawUrl);
  const action = url.searchParams.get('action') || '';

  const supabaseHeaders = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json'
  };

  switch (action) {
    case 'get': {
      try {
        const res = await fetch(
          SUPABASE_URL + '/rest/v1/store_data?id=eq.1&select=data',
          { headers: supabaseHeaders }
        );
        if (!res.ok) {
          const errText = await res.text();
          throw new Error('Supabase returned ' + res.status + ': ' + errText);
        }
        const rows = await res.json();
        const data = (rows[0] && rows[0].data) || DEFAULT_DATA;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      } catch (e) {
        console.error('GET error:', e.message);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(DEFAULT_DATA)
        };
      }
    }

    case 'save': {
      try {
        const data = JSON.parse(event.body);

        // Upsert guarantees the row exists and is written in one
        // call. A plain PATCH against id=1 silently matches zero
        // rows if that row was never created, and Supabase still
        // returns a success response, which makes the save look
        // like it worked when nothing was actually written.
        const res = await fetch(
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

        if (!res.ok) {
          const errText = await res.text();
          throw new Error('Supabase returned ' + res.status + ': ' + errText);
        }

        const result = await res.json();

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, row: result })
        };
      } catch (e) {
        console.error('SAVE error:', e.message);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: e.message })
        };
      }
    }

    case 'ping': {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'ok',
          message: 'SlideWrld API is running with Supabase storage',
          timestamp: new Date().toISOString()
        })
      };
    }

    default:
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid action' })
      };
  }
};