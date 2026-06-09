import type { HealthResponse } from '../types';
import type { ApiError } from '../api';
import { Skeleton } from './ui';

interface SystemHealthProps {
  health: HealthResponse | null;
  error: ApiError | null;
  loading: boolean;
  /** Round-trip latency of the last /irl/health probe, ms. */
  latencyMs: number | null;
}

function certLabel(status: HealthResponse['cert_expiry_status']): {
  text: string;
  tone: string;
} {
  if (status == null) return { text: 'n/a', tone: 'text-ink-dim' };
  if (status === 'ok') return { text: 'valid', tone: 'text-ok' };
  if (status === 'expired') return { text: 'expired', tone: 'text-danger' };
  if (typeof status === 'object' && 'warning' in status)
    return { text: status.warning, tone: 'text-warn' };
  return { text: 'unknown', tone: 'text-ink-dim' };
}

function latencyTone(ms: number | null): string {
  if (ms == null) return 'text-ink-dim';
  if (ms < 80) return 'text-ok';
  if (ms < 250) return 'text-warn';
  return 'text-danger';
}

export function SystemHealth({ health, error, loading, latencyMs }: SystemHealthProps) {
  const online = !error && health?.status === 'ok';
  const cert = certLabel(health?.cert_expiry_status);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright/80">
          System Health
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              error ? 'bg-danger' : online ? 'bg-ok shadow-[0_0_8px] shadow-ok/60' : 'bg-ink-dim'
            } ${online ? 'animate-pulse-dot' : ''}`}
          />
          <span
            className={`font-mono text-[11px] font-medium ${
              error ? 'text-danger' : online ? 'text-ok' : 'text-ink-dim'
            }`}
          >
            {error ? 'OFFLINE' : online ? 'OPERATIONAL' : 'UNKNOWN'}
          </span>
        </div>
      </div>

      <div className="mt-5 grid flex-1 grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
        <HealthCell label="API Status" loading={loading && !health}>
          <span className={online ? 'text-ok' : 'text-danger'}>
            {error ? 'unreachable' : (health?.status ?? '—')}
          </span>
        </HealthCell>

        <HealthCell label="Probe Latency" loading={loading && latencyMs === null}>
          <span className={`tnum ${latencyTone(latencyMs)}`}>
            {latencyMs != null ? `${latencyMs} ms` : '—'}
          </span>
        </HealthCell>

        <HealthCell label="TLS Certificate" loading={loading && !health}>
          <span className={cert.tone}>{cert.text}</span>
        </HealthCell>

        <HealthCell label="Refresh Cycle" loading={false}>
          <span className="text-ink-muted">30 s</span>
        </HealthCell>
      </div>

      <p className="mt-4 text-[11.5px] leading-relaxed text-ink-dim">
        {error
          ? 'Engine health probe failed. Verify the URL and token in settings.'
          : 'Liveness probe against /irl/health. Latency is the round-trip of the last poll.'}
      </p>
    </div>
  );
}

function HealthCell({
  label,
  children,
  loading,
}: {
  label: string;
  children: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div className="bg-surface p-3.5">
      <div className="font-mono text-[9.5px] uppercase tracking-wide text-ink-dim">{label}</div>
      {loading ? (
        <Skeleton className="mt-2 h-4 w-16" />
      ) : (
        <div className="mt-1.5 font-mono text-[14px] font-medium">{children}</div>
      )}
    </div>
  );
}
