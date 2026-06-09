import type { TraceStats } from '../lib/traceStats';
import { formatCount, formatPercent } from '../lib/format';
import { Skeleton } from './ui';

interface StatsRowProps {
  stats: TraceStats | null;
  loading: boolean;
}

interface StatDef {
  key: keyof TraceStats | 'authorizedPct';
  label: string;
  accent: string;
  format: (s: TraceStats) => string;
  hint?: (s: TraceStats) => string | undefined;
}

const STATS: StatDef[] = [
  {
    key: 'total',
    label: 'Total Traces',
    accent: 'text-ink',
    format: (s) => formatCount(s.total),
    hint: (s) => `${s.total.toLocaleString()} sealed`,
  },
  {
    key: 'authorizedPct',
    label: 'Authorized',
    accent: 'text-ok',
    format: (s) => formatPercent(s.authorizedPct),
    hint: (s) => `${formatCount(s.authorized)} matched`,
  },
  {
    key: 'shadowBlocked',
    label: 'Shadow Halted',
    accent: 'text-warn',
    format: (s) => formatCount(s.shadowBlocked),
    hint: () => 'policy intercepts',
  },
  {
    key: 'pending',
    label: 'Pending Bind',
    accent: 'text-info',
    format: (s) => formatCount(s.pending),
    hint: () => 'awaiting execution',
  },
];

export function StatsRow({ stats, loading }: StatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {STATS.map((def, i) => (
        <div
          key={def.label}
          className="group relative overflow-hidden rounded-xl border border-line bg-surface p-4 shadow-card transition-colors hover:border-line-bright"
        >
          {/* Left accent rule */}
          <span
            className={`absolute inset-y-3 left-0 w-[2px] rounded-full ${def.accent.replace(
              'text-',
              'bg-',
            )} opacity-60`}
          />
          <div className="pl-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-dim">
              {def.label}
            </div>
            {loading && !stats ? (
              <Skeleton className="mt-2 h-7 w-16" />
            ) : (
              <>
                <div className={`tnum mt-1.5 text-[28px] font-bold leading-none ${def.accent}`}>
                  {stats ? def.format(stats) : '—'}
                </div>
                <div className="mt-1.5 text-[11px] text-ink-muted">
                  {stats && def.hint ? def.hint(stats) : ' '}
                </div>
              </>
            )}
          </div>
          {/* Index marker, terminal flavor */}
          <span className="absolute right-3 top-3 font-mono text-[10px] text-ink-faint">
            {String(i + 1).padStart(2, '0')}
          </span>
        </div>
      ))}
    </div>
  );
}
