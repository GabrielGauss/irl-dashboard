# Generator State — Iteration 001

## What Was Built

A read-only IRL Engine compliance dashboard (Vite + React + TypeScript + Tailwind),
single-page app with tab navigation, talking directly to the IRL Engine HTTP API.

### Views
- **Overview** (default): active regime card, 4-stat band (total traces, authorized %,
  shadow halted, pending bind), 24h authorize-activity sparkline, system-health panel
  with live probe latency + TLS cert status.
- **Agents**: Multi-Agent Registry table, expandable rows (full agent_id, full model_hash,
  policy module, venues, leverage, MTA pubkey allowlist), semantic status badges
  (active=green, suspended=amber, revoked=red).
- **Traces**: filterable ledger (asset / status / agent), colored policy + verification
  badges, click row → right slide-over with full syntax-highlighted trace JSON.
- **Audit Log**: operator action log, severity-colored action badges, expandable
  detail JSON + source IP + full target id.

### Cross-cutting
- Settings modal (gear): engine URL + Bearer token, persisted to localStorage only,
  show/hide token, URL validation. Auto-opens when unconfigured.
- Auto-refresh every 30s; abortable fetches; per-view error boundaries.
- Loading skeletons, real empty states with copy, helpful error states.
- Dark-luxury palette: #0a0a0f base, #6366f1 indigo accent, JetBrains Mono for
  hashes/IDs, Inter for labels, atmospheric radial glow, custom tokens (no template look).

## Design Notes / Deviations from Spec
- The real `/irl/health` returns only `{"status":"ok"}` (+ optional cert status), NOT
  regime data. Regime (regime_id, label, risk_level, allowed_sides, max_notional_scale)
  lives in the MTA snapshot embedded in each full trace JSON. The Overview therefore
  derives the current regime from the most recent trace's `/irl/trace/:id` detail
  (`src/lib/regime.ts` probes known nesting locations) and degrades gracefully when
  absent. Health card uses `/irl/health` for status + measured round-trip latency.
- Wire formats verified against the engine's Rust handlers in
  `c:/Users/gabri/OneDrive/Documentos/code/claude/irl-engine/src/routes/` and `db.rs`:
  traces use `execution_asset` / `execution_notional` / `verification_status` /
  `policy_result` / `txn_time`; audit-log returns `{ entries: [...] }` with
  `created_at` / `operator_id` / `details_json` / `ip_address`.

## Known Issues
- Traces/audit pagination is client-side over a single fetched page (limit 200 / 150);
  no cursor "load more" wired yet (engine supports `before_id` / `next_cursor`).
- Sparkline buckets by client clock; assumes engine timestamps are UTC ISO (they are).

## Verification
- `npm run build` passes with zero TypeScript errors (strict mode).
- Visually verified all 4 tabs + trace drawer + settings + error state + 1024px width
  via Playwright against a bundled mock engine (`mock/server.mjs`). No console errors.

## Dev Server
- URL: http://localhost:3000
- Status: running (`npm run dev`)
- Mock engine: `node mock/server.mjs` → http://localhost:4000 (token: demo-read-token)
