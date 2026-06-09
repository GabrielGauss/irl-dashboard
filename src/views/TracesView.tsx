import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../api';
import type { Settings, TraceDetail } from '../types';
import { useApi } from '../hooks/useApi';
import { TracesTable } from '../components/TracesTable';
import { TraceDrawer } from '../components/TraceDrawer';
import { EmptyState } from '../components/EmptyState';
import { PanelHeader } from '../components/ui';

interface TracesViewProps {
  settings: Settings;
  enabled: boolean;
  onReportConn: (state: 'live' | 'error') => void;
}

export function TracesView({ settings, enabled, onReportConn }: TracesViewProps) {
  const fetcher = useCallback(
    (signal: AbortSignal) => api.traces(settings, { limit: 200 }, signal),
    [settings],
  );
  const { data, error, initialLoading, refetch } = useApi(fetcher, enabled);

  useEffect(() => {
    if (error) onReportConn('error');
    else if (data) onReportConn('live');
  }, [error, data, onReportConn]);

  // --- Selected trace detail (lazy, on row click) ---
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<TraceDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<ApiError | null>(null);

  const loadDetail = useCallback(
    (id: string) => {
      setSelectedId(id);
      setDetail(null);
      setDetailError(null);
      setDetailLoading(true);
      const controller = new AbortController();
      void (async () => {
        try {
          const d = await api.trace(settings, id, controller.signal);
          if (!controller.signal.aborted) setDetail(d);
        } catch (e) {
          if (!controller.signal.aborted) {
            setDetailError(
              e instanceof ApiError ? e : new ApiError('Failed to load trace', 0, 'network'),
            );
          }
        } finally {
          if (!controller.signal.aborted) setDetailLoading(false);
        }
      })();
    },
    [settings],
  );

  const traces = data?.traces ?? [];

  if (error && !data) {
    return <EmptyState variant="error" error={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <PanelHeader
        eyebrow="Reasoning Traces"
        title="Compliance Trace Ledger"
        right={
          <span className="font-mono text-[11px] text-ink-dim">
            showing latest {traces.length}
          </span>
        }
      />

      <TracesTable traces={traces} loading={initialLoading} onSelect={loadDetail} />

      <TraceDrawer
        traceId={selectedId}
        data={detail}
        loading={detailLoading}
        error={detailError}
        onClose={() => setSelectedId(null)}
        onRetry={() => selectedId && loadDetail(selectedId)}
      />
    </div>
  );
}
