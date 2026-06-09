import type { RegimeSnapshot, TraceDetail } from '../types';

/**
 * Extract an MTA regime snapshot from a full trace JSON.
 *
 * The engine nests the MTA state under various keys depending on schema version
 * (e.g. `mta`, `mta_state`, `regime`, or fields at the snapshot root). We probe a
 * set of candidate locations and validate the shape before trusting it.
 */
export function extractRegime(trace: TraceDetail | null): RegimeSnapshot | null {
  if (!trace || typeof trace !== 'object') return null;

  const candidates: unknown[] = [
    trace,
    (trace as Record<string, unknown>).mta,
    (trace as Record<string, unknown>).mta_state,
    (trace as Record<string, unknown>).regime,
    (trace as Record<string, unknown>).snapshot,
    deepGet(trace, ['snapshot', 'mta']),
    deepGet(trace, ['market', 'mta_state']),
  ];

  for (const c of candidates) {
    const parsed = parseRegime(c);
    if (parsed) return parsed;
  }
  return null;
}

function deepGet(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;
  for (const key of path) {
    if (!cur || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

function parseRegime(value: unknown): RegimeSnapshot | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;

  const regimeId = numOrNull(v.regime_id);
  const regimeLabel = strOrNull(v.regime_label);
  // Require at least an id + label to consider this a regime snapshot.
  if (regimeId === null || regimeLabel === null) return null;

  const sides = Array.isArray(v.allowed_sides)
    ? (v.allowed_sides.filter((s) => typeof s === 'string') as string[])
    : [];

  return {
    regime_id: regimeId,
    regime_label: regimeLabel,
    risk_level: numOrNull(v.risk_level) ?? 0,
    max_notional_scale: numOrNull(v.max_notional_scale) ?? 1,
    allowed_sides: sides,
    version: strOrNull(v.version) ?? undefined,
    hash: strOrNull(v.hash) ?? undefined,
  };
}

function numOrNull(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function strOrNull(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}
