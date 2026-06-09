import { useCallback, useEffect } from 'react';
import { api } from '../api';
import type { Settings } from '../types';
import { useApi } from '../hooks/useApi';
import { AgentsTable } from '../components/AgentsTable';
import { EmptyState } from '../components/EmptyState';
import { PanelHeader } from '../components/ui';
import { agentStatusTone } from '../lib/status';

interface AgentsViewProps {
  settings: Settings;
  enabled: boolean;
  onReportConn: (state: 'live' | 'error') => void;
}

export function AgentsView({ settings, enabled, onReportConn }: AgentsViewProps) {
  const fetcher = useCallback((signal: AbortSignal) => api.agents(settings, signal), [settings]);
  const { data, error, initialLoading, refetch } = useApi(fetcher, enabled);

  useEffect(() => {
    if (error) onReportConn('error');
    else if (data) onReportConn('live');
  }, [error, data, onReportConn]);

  const agents = data?.agents ?? [];

  if (error && !data) {
    return <EmptyState variant="error" error={error} onRetry={refetch} />;
  }
  if (!initialLoading && agents.length === 0) {
    return (
      <EmptyState
        variant="empty"
        title="No registered agents"
        message="The Multi-Agent Registry is empty. Register an agent via POST /irl/agents to see it here."
        onRetry={refetch}
      />
    );
  }

  const counts = agents.reduce<Record<string, number>>((acc, a) => {
    const tone = agentStatusTone(a.status);
    acc[tone] = (acc[tone] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4 animate-fade-up">
      <PanelHeader
        eyebrow="Multi-Agent Registry"
        title="Registered Agents"
        right={
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <Legend tone="text-ok" label="active" count={counts.ok ?? 0} />
            <Legend tone="text-warn" label="suspended" count={counts.warn ?? 0} />
            <Legend tone="text-danger" label="revoked" count={counts.danger ?? 0} />
          </div>
        }
      />
      <AgentsTable agents={agents} loading={initialLoading} />
    </div>
  );
}

function Legend({ tone, label, count }: { tone: string; label: string; count: number }) {
  return (
    <span className="flex items-center gap-1.5 text-ink-dim">
      <span className={`h-1.5 w-1.5 rounded-full ${tone.replace('text-', 'bg-')}`} />
      <span className={tone}>{count}</span>
      <span>{label}</span>
    </span>
  );
}
