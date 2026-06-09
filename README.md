# IRL Engine · Compliance Console

A read-only, single-page compliance dashboard for the **IRL Engine** — the cryptographic
pre-execution compliance gateway. Operators and auditors use it to monitor the active market
regime, registered agents, reasoning traces, and the immutable operator audit log.

No backend. The SPA talks directly to the IRL Engine HTTP API using a Bearer token stored in
`localStorage`.

## Stack

- Vite + React + TypeScript (strict)
- Tailwind CSS (custom dark-luxury design tokens, no UI library)
- Zero runtime dependencies beyond React

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # type-check + production bundle
```

On first load a settings modal asks for:

- **IRL Engine URL** — default `http://localhost:4000`
- **API Token** — sent as `Authorization: Bearer <token>` on every request

Both persist to `localStorage` only and are never placed in the URL.

## Views

| Tab | Source endpoint(s) |
| --- | --- |
| **Overview** | `/irl/health`, `/irl/traces?limit=1000`, latest `/irl/trace/:id` (regime) |
| **Agents** | `/irl/agents` |
| **Traces** | `/irl/traces`, `/irl/trace/:id` |
| **Audit Log** | `/irl/admin/audit-log` |

Data auto-refreshes every 30 s. Each view is wrapped in an error boundary so one broken
panel cannot take down the console.

### Regime card

The real engine exposes the MTA regime snapshot embedded inside each full trace JSON rather
than on `/irl/health`. The Overview derives the current regime from the most recent trace's
detail (`extractRegime` probes the known nesting locations) and degrades gracefully when no
snapshot is present.

## Local mock engine

`mock/server.mjs` is a dependency-free Node server that serves the exact IRL wire format with
realistic seeded data — handy for development and screenshots.

```bash
node mock/server.mjs        # http://localhost:4000, token: demo-read-token
```

Point the dashboard at `http://localhost:4000` with token `demo-read-token`.
