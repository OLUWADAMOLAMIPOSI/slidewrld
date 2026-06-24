// ============================================================
// SLIDEWRLD API — Vercel Serverless Function
// Backed by Supabase (table: store_data, single row, id = 1)
//
// Routes (all through this one file):
//   GET  /api?action=ping   -> health check
//   GET  /api?action=get    -> returns { products, orders, subscribers, settings }
//   POST /api?action=save   -> body is { products, orders, subscribers, settings }
//
// This file replaces whatever was previously pasted here. It is
// NOT meant to run in a browser — it only runs on Vercel's server.
// ============================================================

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const EMPTY_DATA = {
    products: [],
    orders: [],
    subscribers: [],
    settings: {}
};

module.exports = async function handler(req, res) {
    // Allow the browser to call this from the same domain.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const action = req.query.action;

    try {
        if (action === 'ping') {
            return res.status(200).json({ status: 'ok' });
        }

        if (action === 'get' && req.method === 'GET') {
            const { data, error } = await supabase
                .from('store_data')
                .select('data')
                .eq('id', 1)
                .single();

            if (error) {
                console.error('Supabase read error:', error.message);
                return res.status(500).json({ error: 'Could not read data from database.' });
            }

            const payload = data && data.data ? data.data : EMPTY_DATA;
            return res.status(200).json(payload);
        }

        if (action === 'save' && req.method === 'POST') {
            const incoming = req.body;

            if (!incoming || typeof incoming !== 'object') {
                return res.status(400).json({ error: 'Invalid request body.' });
            }

            const toSave = {
                products: incoming.products || [],
                orders: incoming.orders || [],
                subscribers: incoming.subscribers || [],
                settings: incoming.settings || {}
            };

            const { error } = await supabase
                .from('store_data')
                .update({ data: toSave, updated_at: new Date().toISOString() })
                .eq('id', 1);

            if (error) {
                console.error('Supabase write error:', error.message);
                return res.status(500).json({ error: 'Could not save data to database.' });
            }

            return res.status(200).json({ success: true });
        }

        return res.status(400).json({ error: 'Unknown action: ' + action });
    } catch (e) {
        console.error('Unhandled API error:', e.message);
        return res.status(500).json({ error: 'Server error: ' + e.message });
    }
};