import { useMemo, useState } from 'react';
import type { TraceSummary } from '../types';
import { Badge } from './Badge';
import { Skeleton } from './ui';
import { policyTone, verificationTone } from '../lib/status';
import { formatNotional, formatRelative, truncateId } from '../lib/format';

interface TracesTableProps {
  traces: TraceSummary[];
  loading: boolean;
  onSelect: (traceId: string) => void;
}

const COLS =
  'grid grid-cols-[1.2fr_1.1fr_0.9fr_0.9fr_1.1fr_1.1fr_0.9fr] gap-4 items-center';

const VERIFICATION_OPTIONS = [
  'PENDING',
  'MATCHED',
  'DIVERGENT',
  'ORPHAN',
  'EXPIRED',
  'SHADOW_HALTED',
];

export function TracesTable({ traces, loading, onSelect }: TracesTableProps) {
  const [asset, setAsset] = useState('');
  const [status, setStatus] = useState('');
  const [agent, setAgent] = useState('');

  const assets = useMemo(
    () => Array.from(new Set(traces.map((t) => t.execution_asset).filter(Boolean))).sort(),
    [traces],
  );
  const agents = useMemo(
    () => Array.from(new Set(traces.map((t) => t.agent_id).filter(Boolean) as string[])).sort(),
    [traces],
  );

  const filtered = useMemo(
    () =>
      traces.filter((t) => {
        if (asset && t.execution_asset !== asset) return false;
        if (status && (t.verification_status ?? '').toUpperCase() !== status) return false;
        if (agent && t.agent_id !== agent) return false;
        return true;
      }),
    [traces, asset, status, agent],
  );

  const hasFilters = Boolean(asset || status || agent);

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <FilterSelect label="Asset" value={asset} onChange={setAsset} options={assets} />
        <FilterSelect
          label="Status"
          value={status}
          onChange={setStatus}
          options={VERIFICATION_OPTIONS}
        />
        <FilterSelect
          label="Agent"
          value={agent}
          onChange={setAgent}
          options={agents}
          renderOption={(o) => truncateId(o, 8, 6)}
        />
        <div className="ml-auto flex items-center gap-3">
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setAsset('');
                setStatus('');
                setAgent('');
              }}
              className="font-mono text-[11px] text-ink-dim transition-colors hover:text-accent-bright"
            >
              clear filters
            </button>
          )}
          <span className="font-mono text-[11px] text-ink-dim">
            {filtered.length} / {traces.length} rows
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <div
          className={`${COLS} border-b border-line bg-surface-raised px-5 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-dim`}
        >
          <span>Trace</span>
          <span>Agent</span>
          <span>Asset</span>
          <span className="text-right">Notional</span>
          <span>Policy</span>
          <span>Verification</span>
          <span className="text-right">Time</span>
        </div>

        {loading && traces.length === 0 ? (
          <SkeletonRows />
        ) : filtered.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-ink-muted">
            {hasFilters ? 'No traces match these filters.' : 'No traces recorded yet.'}
          </div>
        ) : (
          <div className="divide-y divide-line/70">
            {filtered.map((t) => (
              <button
                key={t.trace_id}
                type="button"
                onClick={() => onSelect(t.trace_id)}
                className={`${COLS} w-full px-5 py-3 text-left transition-colors hover:bg-surface-hover focus:bg-surface-hover focus:outline-none`}
              >
                <span className="font-mono text-[12px] text-accent-bright/90">
                  {truncateId(t.trace_id, 8, 4)}
                </span>
                <span className="font-mono text-[11.5px] text-ink-muted">
                  {truncateId(t.agent_id, 6, 4)}
                </span>
                <span className="text-[12.5px] font-medium text-ink">{t.execution_asset}</span>
                <span className="tnum text-right font-mono text-[12px] text-ink">
                  {formatNotional(t.execution_notional)}
                </span>
                <span>
                  <Badge tone={policyTone(t.policy_result)} dot={false}>
                    {t.policy_result}
                  </Badge>
                </span>
                <span>
                  <Badge tone={verificationTone(t.verification_status)}>
                    {t.verification_status}
                  </Badge>
                </span>
                <span className="text-right font-mono text-[11px] text-ink-dim">
                  {formatRelative(t.txn_time)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  renderOption,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  renderOption?: (o: string) => string;
}) {
  return (
    <label className="group relative flex items-center">
      <span className="pointer-events-none absolute left-3 font-mono text-[10px] uppercase tracking-wide text-ink-dim">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none rounded-lg border bg-surface py-2 pl-[4.5rem] pr-8 text-[12.5px] transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30 ${
          value
            ? 'border-accent/40 text-ink'
            : 'border-line-bright text-ink-muted hover:border-line-bright'
        }`}
      >
        <option value="">all</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {renderOption ? renderOption(o) : o}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 24 24"
        className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-ink-dim"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </label>
  );
}

function SkeletonRows() {
  return (
    <div className="divide-y divide-line/70">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={`${COLS} px-5 py-3.5`}>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-16 justify-self-end" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-12 justify-self-end" />
        </div>
      ))}
    </div>
  );
}
