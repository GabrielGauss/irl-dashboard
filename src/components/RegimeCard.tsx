import type { RegimeSnapshot } from '../types';
import { Skeleton } from './ui';

interface RegimeCardProps {
  regime: RegimeSnapshot | null;
  loading: boolean;
  /** True when traces exist but none carried an MTA snapshot. */
  unavailable?: boolean;
}

/** Risk level → tone + label band. */
function riskBand(risk: number): { label: string; color: string; track: string } {
  if (risk >= 0.66) return { label: 'Risk-On', color: 'text-ok', track: 'bg-ok' };
  if (risk >= 0.33) return { label: 'Neutral', color: 'text-warn', track: 'bg-warn' };
  return { label: 'Defensive', color: 'text-danger', track: 'bg-danger' };
}

const SIDE_TONE: Record<string, string> = {
  long: 'border-ok/30 bg-ok/10 text-ok',
  short: 'border-danger/30 bg-danger/10 text-danger',
  neutral: 'border-ink-dim/40 bg-white/[0.03] text-ink-muted',
};

export function RegimeCard({ regime, loading, unavailable }: RegimeCardProps) {
  if (loading && !regime) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-card">
        <Skeleton className="mb-3 h-3 w-24" />
        <Skeleton className="mb-5 h-8 w-48" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      </div>
    );
  }

  if (!regime) {
    return (
      <div className="relative flex flex-col justify-center overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-card">
        <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright/80">
          Active Regime
        </div>
        <div className="text-[15px] font-semibold text-ink">No regime broadcast</div>
        <p className="mt-1 max-w-xs text-[12.5px] leading-relaxed text-ink-muted">
          {unavailable
            ? 'Recent traces did not carry an MTA snapshot. The regime updates on the next authorized intent.'
            : 'Waiting for the first authorized intent to surface the current market regime.'}
        </p>
      </div>
    );
  }

  const band = riskBand(regime.risk_level);
  const riskPct = Math.round(regime.risk_level * 100);
  const scalePct = Math.round(regime.max_notional_scale * 100);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-card">
      {/* Ambient glow keyed to risk band */}
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full opacity-[0.18] blur-3xl transition-opacity group-hover:opacity-30"
        style={{ background: 'rgb(99,102,241)' }}
      />

      <div className="flex items-start justify-between">
        <div>
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright/80">
            Active Regime
          </div>
          <div className="flex items-baseline gap-3">
            <h2 className="text-[26px] font-bold tracking-tightest text-ink">
              {regime.regime_label}
            </h2>
            <span className="font-mono text-[12px] text-ink-dim">
              id:{String(regime.regime_id).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className={`flex flex-col items-end ${band.color}`}>
          <span className="font-mono text-[10px] uppercase tracking-wide text-ink-dim">Risk</span>
          <span className="text-[15px] font-semibold leading-none">{band.label}</span>
        </div>
      </div>

      {/* Risk meter */}
      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between font-mono text-[10.5px] text-ink-muted">
          <span>RISK LEVEL</span>
          <span className={band.color}>{riskPct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-void">
          <div
            className={`h-full rounded-full ${band.track} transition-[width] duration-700`}
            style={{ width: `${Math.max(2, riskPct)}%` }}
          />
        </div>
      </div>

      {/* Metrics row */}
      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
        <Metric label="Max Notional Scale" value={`${scalePct}%`} sub="of agent cap" />
        <div className="bg-surface p-4">
          <div className="font-mono text-[10px] uppercase tracking-wide text-ink-dim">
            Allowed Sides
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {regime.allowed_sides.length === 0 ? (
              <span className="text-[13px] text-ink-muted">— none —</span>
            ) : (
              regime.allowed_sides.map((side) => {
                const key = side.toLowerCase();
                return (
                  <span
                    key={side}
                    className={`rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium uppercase ${
                      SIDE_TONE[key] ?? SIDE_TONE.neutral
                    }`}
                  >
                    {side}
                  </span>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-surface p-4">
      <div className="font-mono text-[10px] uppercase tracking-wide text-ink-dim">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className="tnum text-[22px] font-semibold leading-none text-ink">{value}</span>
        {sub && <span className="text-[11px] text-ink-muted">{sub}</span>}
      </div>
    </div>
  );
}
