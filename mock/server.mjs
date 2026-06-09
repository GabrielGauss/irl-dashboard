// Standalone mock IRL Engine for local dashboard development & screenshots.
// Serves the same wire format as the real Rust engine. Not part of the build.
// Run: node mock/server.mjs   (listens on :4000)

import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const PORT = 4000;
const TOKEN = 'demo-read-token';

function hex(n) {
  const c = '0123456789abcdef';
  let s = '';
  for (let i = 0; i < n; i++) s += c[Math.floor(Math.random() * 16)];
  return s;
}

const ASSETS = ['BTC/USD', 'ETH/USD', 'AAPL', 'SPY', 'EUR/USD', 'NVDA'];
const VENUES = ['XNAS', 'COINBASE', 'XNYS', 'KRAKEN'];
const REGIMES = [
  { id: 2, label: 'Risk-On Expansion', risk: 0.78, scale: 1.0, sides: ['long', 'short'] },
  { id: 1, label: 'Neutral Drift', risk: 0.5, scale: 0.6, sides: ['long', 'neutral'] },
  { id: 0, label: 'Defensive Contraction', risk: 0.18, scale: 0.25, sides: ['neutral'] },
];
const currentRegime = REGIMES[0];

const AGENTS = [
  agent('Atlas Crypto Alpha', 'Active', [0, 1, 2], 250000, 5),
  agent('Helios Equities', 'Active', [1, 2], 1000000, 2),
  agent('Vega FX Macro', 'Suspended', null, 500000, 10),
  agent('Orion Futures', 'Active', [2], 750000, 8),
  agent('Nyx Shadow Test', 'Revoked', [0], 100000, 3),
];

function agent(name, status, regimes, maxNotional, lev) {
  return {
    agent_id: randomUUID(),
    name,
    model_hash_hex: hex(64),
    policy_module_id: `policy-${name.split(' ')[0].toLowerCase()}-v2`,
    allowed_regimes: regimes,
    max_notional: maxNotional,
    max_leverage: lev,
    allowed_venues: status === 'Active' ? VENUES.slice(0, 2) : null,
    status,
    allowed_mta_pubkeys: Math.random() > 0.5 ? [hex(64)] : null,
  };
}

const V_STATUSES = ['MATCHED', 'MATCHED', 'MATCHED', 'PENDING', 'SHADOW_HALTED', 'DIVERGENT', 'EXPIRED'];
const TRACES = Array.from({ length: 320 }, () => {
  const v = V_STATUSES[Math.floor(Math.random() * V_STATUSES.length)];
  const policy =
    v === 'SHADOW_HALTED' ? 'SHADOW_BLOCKED' : v === 'DIVERGENT' ? 'AUTHORIZED' : 'AUTHORIZED';
  const ageMs = Math.random() ** 2 * 24 * 3600 * 1000; // skew toward recent
  return {
    trace_id: randomUUID(),
    agent_id: AGENTS[Math.floor(Math.random() * AGENTS.length)].agent_id,
    txn_time: new Date(Date.now() - ageMs).toISOString(),
    policy_result: policy,
    verification_status: v,
    execution_asset: ASSETS[Math.floor(Math.random() * ASSETS.length)],
    execution_notional: Math.round((5000 + Math.random() * 200000) * 100) / 100,
    reasoning_hash: hex(64),
  };
}).sort((a, b) => new Date(b.txn_time) - new Date(a.txn_time));

function fullTrace(id) {
  const t = TRACES.find((x) => x.trace_id === id) ?? TRACES[0];
  return {
    schema: 'Reasoning_Trace_v1',
    trace_id: t.trace_id,
    agent_id: t.agent_id,
    txn_time: t.txn_time,
    reasoning_hash: t.reasoning_hash,
    policy_result: t.policy_result,
    verification_status: t.verification_status,
    intent: {
      asset: t.execution_asset,
      side: 'Long',
      quantity: 1.5,
      notional: t.execution_notional,
      order_type: 'MARKET',
      venue_id: VENUES[0],
    },
    mta: {
      regime_id: currentRegime.id,
      regime_label: currentRegime.label,
      risk_level: currentRegime.risk,
      max_notional_scale: currentRegime.scale,
      allowed_sides: currentRegime.sides,
      version: '2.4.1',
      hash: hex(64),
      broadcast_time: Date.now() - 12000,
      pubkey_fingerprint: hex(64),
    },
    execution: {
      exchange_tx_id: `exch-${hex(8)}`,
      execution_status: t.verification_status === 'PENDING' ? null : 'FILLED',
      execution_price: 43250.5,
      final_proof: t.verification_status === 'PENDING' ? null : hex(64),
    },
  };
}

const ACTIONS = [
  'AgentRegister',
  'AgentSuspend',
  'AgentActivate',
  'ShadowModeChange',
  'AgentStatusChange',
];
const AUDIT = Array.from({ length: 60 }, (_, i) => {
  const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  const ag = AGENTS[Math.floor(Math.random() * AGENTS.length)];
  return {
    id: randomUUID(),
    operator_id: ['ops@macropulse', 'compliance@macropulse', 'admin@macropulse'][i % 3],
    action,
    target_type: action.startsWith('Agent') ? 'agent' : null,
    target_id: action.startsWith('Agent') ? ag.agent_id : null,
    details_json:
      action === 'ShadowModeChange'
        ? { old_value: false, new_value: true, reason: 'pre-deployment policy tuning' }
        : { old_status: 'Active', new_status: 'Suspended', name: ag.name },
    ip_address: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    created_at: new Date(Date.now() - i * 3600 * 1000 * 1.7).toISOString(),
  };
}).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

function json(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'authorization, content-type',
  });
  res.end(JSON.stringify(body));
}

createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'authorization, content-type',
    });
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const auth = req.headers['authorization'];

  if (url.pathname === '/irl/health') {
    return json(res, 200, { status: 'ok', cert_expiry_status: { warning: 'expires in 47 day(s)' } });
  }

  // All other endpoints require a bearer token.
  if (auth !== `Bearer ${TOKEN}`) {
    return json(res, 401, { error: 'unauthorized' });
  }

  if (url.pathname === '/irl/agents') {
    return json(res, 200, { agents: AGENTS });
  }
  if (url.pathname === '/irl/traces') {
    const limit = Math.min(Number(url.searchParams.get('limit')) || 500, 5000);
    const rows = TRACES.slice(0, limit);
    return json(res, 200, { count: rows.length, traces: rows });
  }
  if (url.pathname.startsWith('/irl/trace/')) {
    const id = url.pathname.split('/').pop();
    return json(res, 200, fullTrace(id));
  }
  if (url.pathname === '/irl/admin/audit-log') {
    const limit = Math.min(Number(url.searchParams.get('limit')) || 50, 500);
    const rows = AUDIT.slice(0, limit);
    return json(res, 200, { count: rows.length, entries: rows, next_cursor: null });
  }

  return json(res, 404, { error: 'not found' });
}).listen(PORT, () => {
  console.log(`Mock IRL Engine on http://localhost:${PORT}  (token: ${TOKEN})`);
});
