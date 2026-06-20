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
    'Content-Type': 'application/json'
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
          throw new Error('Supabase returned ' + res.status);
        }
        const rows = await res.json();
        const data = (rows[0] && rows[0].data) || DEFAULT_DATA;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      } catch (e) {
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
        const res = await fetch(
          SUPABASE_URL + '/rest/v1/store_data?id=eq.1',
          {
            method: 'PATCH',
            headers: supabaseHeaders,
            body: JSON.stringify({ data: data, updated_at: new Date().toISOString() })
          }
        );
        if (!res.ok) {
          const errText = await res.text();
          throw new Error('Supabase returned ' + res.status + ': ' + errText);
        }
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true })
        };
      } catch (e) {
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