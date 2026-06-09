interface SmallStatProps {
  label: string;
  value: string;
  accent?: string;
}

/** Inline metric used in panel headers. */
export function SmallStat({ label, value, accent = 'text-ink' }: SmallStatProps) {
  return (
    <div className="text-right">
      <div className="font-mono text-[9.5px] uppercase tracking-wide text-ink-dim">{label}</div>
      <div className={`tnum mt-1 text-[18px] font-semibold leading-none ${accent}`}>{value}</div>
    </div>
  );
}
