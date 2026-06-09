import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api';
import type { HealthResponse, RegimeSnapshot, Settings } from '../types';
import { useApi } from '../hooks/useApi';
import { computeTraceStats, hourlyActivity } from '../lib/traceStats';
import { extractRegime } from '../lib/regime';
import { RegimeCard } from '../components/RegimeCard';
import { StatsRow } from '../components/StatsRow';
import { SystemHealth } from '../components/SystemHealth';
import { Sparkline } from '../components/Sparkline';
import { SmallStat } from '../components/SmallStat';
import { EmptyState } from '../components/EmptyState';

interface OverviewViewProps {
  settings: Settings;
  enabled: boolean;
  onReportConn: (state: 'live' | 'error') => void;
  onLastUpdated: (ts: number | null) => void;
}

export function OverviewView({ settings, enabled, onReportConn, onLastUpdated }: OverviewViewProps) {
  // --- Health with latency measurement ---
  const [latency, setLatency] = useState<number | null>(null);
  const healthFetcher = useCallback(
    async (signal: AbortSignal): Promise<HealthResponse> => {
      const start = performance.now();
      const res = await api.health(settings, signal);
      setLatency(Math.round(performance.now() - start));
      return res;
    },
    [settings],
  );
  const health = useApi<HealthResponse>(healthFetcher, enabled);

  // --- Traces (large page for stats + activity) ---
  const tracesFetcher = useCallback(
    (signal: AbortSignal) => api.traces(settings, { limit: 1000 }, signal),
    [settings],
  );
  const traces = useApi(tracesFetcher, enabled);

  const traceList = traces.data?.traces ?? [];
  const stats = useMemo(
    () => (traces.data ? computeTraceStats(traceList) : null),
    [traces.data, traceList],
  );
  const activity = useMemo(() => hourlyActivity(traceList), [traceList]);

  // --- Regime: derive from the most recent trace's full detail ---
  const latestTraceId = traceList[0]?.trace_id ?? null;
  const [regime, setRegime] = useState<RegimeSnapshot | null>(null);
  const [regimeProbed, setRegimeProbed] = useState(false);
  const probedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !latestTraceId) return;
    if (probedIdRef.current === latestTraceId) return;
    probedIdRef.current = latestTraceId;

    const controller = new AbortController();
    void (async () => {
      try {
        const detail = await api.trace(settings, latestTraceId, controller.signal);
        if (controller.signal.aborted) return;
        setRegime(extractRegime(detail));
      } catch {
        if (!controller.signal.aborted) setRegime(null);
      } finally {
        if (!controller.signal.aborted) setRegimeProbed(true);
      }
    })();
    return () => controller.abort();
  }, [enabled, latestTraceId, settings]);

  // --- Bubble connection + freshness up to the shell ---
  useEffect(() => {
    if (health.error && traces.error) onReportConn('error');
    else if (health.data || traces.data) onReportConn('live');
  }, [health.error, health.data, traces.error, traces.data, onReportConn]);

  useEffect(() => {
    const ts = [health.lastUpdated, traces.lastUpdated].filter(Boolean) as number[];
    onLastUpdated(ts.length ? Math.max(...ts) : null);
  }, [health.lastUpdated, traces.lastUpdated, onLastUpdated]);

  // Hard failure on both core calls → full empty state.
  if (health.error && traces.error && !health.data && !traces.data) {
    return (
      <EmptyState
        variant="error"
        title="IRL Engine unreachable"
        error={traces.error}
        onRetry={() => {
          health.refetch();
          traces.refetch();
        }}
      />
    );
  }

  const peakHour = Math.max(0, ...activity);
  const last24hTotal = activity.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-3 animate-fade-up">
      {/* Stats band */}
      <StatsRow stats={stats} loading={traces.initialLoading} />

      {/* Bento grid: regime (wide) + health (narrow) */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RegimeCard
            regime={regime}
            loading={traces.initialLoading || (!regimeProbed && latestTraceId !== null)}
            unavailable={regimeProbed && regime === null && latestTraceId !== null}
          />
        </div>
        <div>
          <SystemHealth
            health={health.data}
            error={health.error}
            loading={health.initialLoading}
            latencyMs={latency}
          />
        </div>
      </div>

      {/* Activity sparkline panel */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright/80">
              Authorize Activity
            </div>
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Last 24 hours</h2>
          </div>
          <div className="flex gap-6">
            <SmallStat label="24h Volume" value={last24hTotal.toLocaleString()} />
            <SmallStat label="Peak / hr" value={peakHour.toLocaleString()} accent="text-accent-bright" />
            <SmallStat
              label="Divergent"
              value={(stats?.divergent ?? 0).toLocaleString()}
              accent={stats && stats.divergent > 0 ? 'text-danger' : 'text-ink'}
            />
          </div>
        </div>

        <div className="mt-5">
          {traces.initialLoading ? (
            <div className="skeleton h-16 rounded-lg" />
          ) : last24hTotal === 0 ? (
            <div className="flex h-16 items-center justify-center text-[12.5px] text-ink-dim">
              No authorize activity in the last 24 hours.
            </div>
          ) : (
            <Sparkline values={activity} height={72} />
          )}
          <div className="mt-2 flex justify-between font-mono text-[10px] text-ink-faint">
            <span>−24h</span>
            <span>−12h</span>
            <span>now</span>
          </div>
        </div>
      </div>
    </div>
  );
}
