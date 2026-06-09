import type { TraceSummary } from '../types';

export interface TraceStats {
  total: number;
  authorized: number;
  authorizedPct: number;
  shadowBlocked: number;
  pending: number;
  divergent: number;
}

const AUTHORIZED = new Set(['MATCHED']);
const PENDING = new Set(['PENDING']);
const SHADOW = new Set(['SHADOW_HALTED']);
const DIVERGENT = new Set(['DIVERGENT', 'ORPHAN', 'EXPIRED']);

/** Derive Overview headline numbers from a trace page. */
export function computeTraceStats(traces: TraceSummary[]): TraceStats {
  let authorized = 0;
  let shadowBlocked = 0;
  let pending = 0;
  let divergent = 0;

  for (const t of traces) {
    const v = (t.verification_status ?? '').toUpperCase();
    const p = (t.policy_result ?? '').toUpperCase();
    if (AUTHORIZED.has(v) || p.includes('AUTHORIZED')) authorized += 1;
    if (SHADOW.has(v) || p.includes('SHADOW')) shadowBlocked += 1;
    if (PENDING.has(v)) pending += 1;
    if (DIVERGENT.has(v)) divergent += 1;
  }

  const total = traces.length;
  const authorizedPct = total > 0 ? (authorized / total) * 100 : 0;

  return { total, authorized, authorizedPct, shadowBlocked, pending, divergent };
}

/**
 * Bucket trace counts into the last 24 hours (24 hourly buckets, oldest → newest).
 * Counts authorize activity by txn_time.
 */
export function hourlyActivity(traces: TraceSummary[], hours = 24): number[] {
  const now = Date.now();
  const buckets = new Array<number>(hours).fill(0);
  const hourMs = 3_600_000;

  for (const t of traces) {
    const ts = new Date(t.txn_time).getTime();
    if (Number.isNaN(ts)) continue;
    const age = now - ts;
    if (age < 0 || age >= hours * hourMs) continue;
    const idx = hours - 1 - Math.floor(age / hourMs);
    if (idx >= 0 && idx < hours) buckets[idx] += 1;
  }
  return buckets;
}
