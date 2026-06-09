import { useCallback, useEffect } from 'react';
import { api } from '../api';
import type { Settings } from '../types';
import { useApi } from '../hooks/useApi';
import { AuditLogTable } from '../components/AuditLogTable';
import { EmptyState } from '../components/EmptyState';
import { PanelHeader } from '../components/ui';

interface AuditViewProps {
  settings: Settings;
  enabled: boolean;
  onReportConn: (state: 'live' | 'error') => void;
}

export function AuditView({ settings, enabled, onReportConn }: AuditViewProps) {
  const fetcher = useCallback((signal: AbortSignal) => api.auditLog(settings, 150, signal), [settings]);
  const { data, error, initialLoading, refetch } = useApi(fetcher, enabled);

  useEffect(() => {
    if (error) onReportConn('error');
    else if (data) onReportConn('live');
  }, [error, data, onReportConn]);

  const entries = data?.entries ?? [];

  if (error && !data) {
    return <EmptyState variant="error" error={error} onRetry={refetch} />;
  }
  if (!initialLoading && entries.length === 0) {
    return (
      <EmptyState
        variant="empty"
        title="Audit log is empty"
        message="No operator actions have been recorded yet. Agent registrations, status changes, and shadow-mode toggles will appear here."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <PanelHeader
        eyebrow="Immutable Record"
        title="Operator Audit Log"
        right={
          <span className="font-mono text-[11px] text-ink-dim">{entries.length} events</span>
        }
      />
      <AuditLogTable entries={entries} loading={initialLoading} />
    </div>
  );
}
