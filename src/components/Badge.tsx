import type { Tone } from '../lib/status';
import { TONE_STYLES } from '../lib/status';

interface BadgeProps {
  tone: Tone;
  children: React.ReactNode;
  dot?: boolean;
  uppercase?: boolean;
}

/** Compact semantic pill used for every status across the console. */
export function Badge({ tone, children, dot = true, uppercase = true }: BadgeProps) {
  const s = TONE_STYLES[tone];
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-[5px] border px-2 py-[3px]',
        'font-mono text-[10.5px] font-medium leading-none tracking-wide',
        uppercase ? 'uppercase' : '',
        s.text,
        s.bg,
        s.border,
      ].join(' ')}
    >
      {dot && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} />}
      {children}
    </span>
  );
}
