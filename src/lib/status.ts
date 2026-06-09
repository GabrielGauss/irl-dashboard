/** Maps engine enum strings to semantic visual tones. */

export type Tone = 'ok' | 'warn' | 'danger' | 'info' | 'neutral' | 'accent';

export interface ToneStyle {
  text: string;
  bg: string;
  border: string;
  dot: string;
}

export const TONE_STYLES: Record<Tone, ToneStyle> = {
  ok: {
    text: 'text-ok',
    bg: 'bg-ok/10',
    border: 'border-ok/25',
    dot: 'bg-ok',
  },
  warn: {
    text: 'text-warn',
    bg: 'bg-warn/10',
    border: 'border-warn/25',
    dot: 'bg-warn',
  },
  danger: {
    text: 'text-danger',
    bg: 'bg-danger/10',
    border: 'border-danger/25',
    dot: 'bg-danger',
  },
  info: {
    text: 'text-info',
    bg: 'bg-info/10',
    border: 'border-info/25',
    dot: 'bg-info',
  },
  accent: {
    text: 'text-accent-bright',
    bg: 'bg-accent/10',
    border: 'border-accent/25',
    dot: 'bg-accent',
  },
  neutral: {
    text: 'text-ink-muted',
    bg: 'bg-white/[0.04]',
    border: 'border-line-bright',
    dot: 'bg-ink-dim',
  },
};

/** Agent status → tone. active=green, suspended=amber, revoked/deregistered=red. */
export function agentStatusTone(status: string): Tone {
  switch (status.toLowerCase()) {
    case 'active':
      return 'ok';
    case 'suspended':
      return 'warn';
    case 'revoked':
    case 'deregistered':
      return 'danger';
    default:
      return 'neutral';
  }
}

/** verification_status → tone. */
export function verificationTone(status: string): Tone {
  switch (status.toUpperCase()) {
    case 'MATCHED':
      return 'ok';
    case 'PENDING':
      return 'info';
    case 'SHADOW_HALTED':
      return 'warn';
    case 'DIVERGENT':
    case 'ORPHAN':
    case 'EXPIRED':
      return 'danger';
    default:
      return 'neutral';
  }
}

/** policy_result → tone. AUTHORIZED=green, SHADOW_*=amber, BLOCKED/DENIED=red. */
export function policyTone(result: string): Tone {
  const r = result.toUpperCase();
  if (r.includes('AUTHORIZED') || r === 'ALLOW' || r === 'PASS') return 'ok';
  if (r.includes('SHADOW')) return 'warn';
  if (r.includes('BLOCK') || r.includes('DENY') || r.includes('DENIED') || r.includes('REJECT'))
    return 'danger';
  return 'neutral';
}

/** Audit action → tone by destructiveness. */
export function auditActionTone(action: string): Tone {
  const a = action.toLowerCase();
  if (a.includes('revoke') || a.includes('erase') || a.includes('delete') || a.includes('suspend'))
    return 'danger';
  if (a.includes('shadow') || a.includes('status') || a.includes('update') || a.includes('change'))
    return 'warn';
  if (a.includes('register') || a.includes('activate') || a.includes('create')) return 'ok';
  return 'info';
}
