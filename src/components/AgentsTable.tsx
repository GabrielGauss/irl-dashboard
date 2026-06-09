import { Fragment, useState } from 'react';
import type { AgentProfile } from '../types';
import { Badge } from './Badge';
import { CopyId, Skeleton } from './ui';
import { agentStatusTone } from '../lib/status';
import { formatNotional, truncateId } from '../lib/format';

interface AgentsTableProps {
  agents: AgentProfile[];
  loading: boolean;
}

const COLS = 'grid grid-cols-[1.6fr_0.9fr_1.4fr_1.2fr_0.9fr_0.4fr] gap-4';

export function AgentsTable({ agents, loading }: AgentsTableProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      {/* Header */}
      <div
        className={`${COLS} border-b border-line bg-surface-raised px-5 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-dim`}
      >
        <span>Agent</span>
        <span>Status</span>
        <span>Model Hash</span>
        <span>Regimes</span>
        <span className="text-right">Max Notional</span>
        <span />
      </div>

      {loading && agents.length === 0 ? (
        <SkeletonRows />
      ) : (
        <div className="divide-y divide-line/70">
          {agents.map((agent) => {
            const isOpen = expanded === agent.agent_id;
            return (
              <Fragment key={agent.agent_id}>
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : agent.agent_id)}
                  aria-expanded={isOpen}
                  className={`${COLS} w-full items-center px-5 py-3.5 text-left transition-colors hover:bg-surface-hover focus:bg-surface-hover focus:outline-none ${
                    isOpen ? 'bg-surface-hover' : ''
                  }`}
                >
                  {/* Agent name + id */}
                  <div className="min-w-0">
                    <div className="truncate text-[13.5px] font-medium text-ink">{agent.name}</div>
                    <div className="mt-0.5 font-mono text-[11px] text-ink-dim">
                      {truncateId(agent.agent_id, 8, 6)}
                    </div>
                  </div>

                  <div>
                    <Badge tone={agentStatusTone(agent.status)}>{agent.status}</Badge>
                  </div>

                  <div className="font-mono text-[12px] text-ink-muted">
                    {truncateId(agent.model_hash_hex, 8, 6)}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {agent.allowed_regimes === null ? (
                      <span className="rounded border border-line-bright bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10.5px] text-ink-muted">
                        ALL
                      </span>
                    ) : agent.allowed_regimes.length === 0 ? (
                      <span className="font-mono text-[11px] text-ink-dim">none</span>
                    ) : (
                      agent.allowed_regimes.slice(0, 6).map((r) => (
                        <span
                          key={r}
                          className="rounded border border-accent/25 bg-accent/10 px-1.5 py-0.5 font-mono text-[10.5px] text-accent-bright"
                        >
                          {r}
                        </span>
                      ))
                    )}
                  </div>

                  <div className="tnum text-right font-mono text-[12.5px] text-ink">
                    {formatNotional(agent.max_notional)}
                  </div>

                  <div className="flex justify-end">
                    <svg
                      viewBox="0 0 24 24"
                      className={`h-4 w-4 text-ink-dim transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </button>

                {isOpen && <ExpandedAgent agent={agent} />}
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ExpandedAgent({ agent }: { agent: AgentProfile }) {
  return (
    <div className="animate-fade-up border-t border-line bg-void/40 px-5 py-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full Agent ID">
          <CopyId value={agent.agent_id} display={agent.agent_id} />
        </Field>
        <Field label="Policy Module">
          <span className="font-mono text-[12px] text-ink-muted">{agent.policy_module_id}</span>
        </Field>
        <Field label="Full Model Hash (SHA-256)">
          <CopyId value={agent.model_hash_hex} display={agent.model_hash_hex} className="break-all" />
        </Field>
        <Field label="Max Leverage">
          <span className="font-mono text-[12px] text-ink">{agent.max_leverage}×</span>
        </Field>
        <Field label="Allowed Venues">
          {agent.allowed_venues === null ? (
            <span className="font-mono text-[12px] text-ink-muted">any venue</span>
          ) : agent.allowed_venues.length === 0 ? (
            <span className="font-mono text-[12px] text-ink-dim">none</span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {agent.allowed_venues.map((v) => (
                <span
                  key={v}
                  className="rounded border border-line-bright bg-surface px-1.5 py-0.5 font-mono text-[11px] text-ink-muted"
                >
                  {v}
                </span>
              ))}
            </div>
          )}
        </Field>
        <Field label="MTA Pubkey Allowlist">
          <span className="font-mono text-[12px] text-ink-muted">
            {agent.allowed_mta_pubkeys === null
              ? 'accept any operator'
              : `${agent.allowed_mta_pubkeys.length} pinned`}
          </span>
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-dim">
        {label}
      </div>
      {children}
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="divide-y divide-line/70">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`${COLS} items-center px-5 py-4`}>
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-4 w-16 justify-self-end" />
          <span />
        </div>
      ))}
    </div>
  );
}
