const { getStore } = require('@netlify/blobs');

const STORE_NAME = 'slidewrld-data';
const DATA_KEY = 'store';

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

  const store = getStore(STORE_NAME);
  const url = new URL(event.rawUrl);
  const action = url.searchParams.get('action') || '';

  switch (action) {
    case 'get': {
      try {
        const saved = await store.get(DATA_KEY, { type: 'json' });
        const data = saved || DEFAULT_DATA;
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
        await store.setJSON(DATA_KEY, data);
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
          message: 'SlideWrld API is running with persistent storage',
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