import { formatRelative } from '../lib/format';

export type TabId = 'overview' | 'agents' | 'traces' | 'audit';

export const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'agents', label: 'Agents' },
  { id: 'traces', label: 'Traces' },
  { id: 'audit', label: 'Audit Log' },
];

export type ConnState = 'live' | 'error' | 'idle' | 'connecting';

interface NavbarProps {
  active: TabId;
  onSelect: (tab: TabId) => void;
  onOpenSettings: () => void;
  conn: ConnState;
  baseUrl: string;
  lastUpdated: number | null;
}

const CONN_META: Record<ConnState, { label: string; dot: string; text: string }> = {
  live: { label: 'Live', dot: 'bg-ok shadow-[0_0_8px] shadow-ok/60', text: 'text-ok' },
  connecting: { label: 'Connecting', dot: 'bg-info animate-pulse-dot', text: 'text-info' },
  error: { label: 'Unreachable', dot: 'bg-danger shadow-[0_0_8px] shadow-danger/60', text: 'text-danger' },
  idle: { label: 'Not connected', dot: 'bg-ink-dim', text: 'text-ink-dim' },
};

export function Navbar({
  active,
  onSelect,
  onOpenSettings,
  conn,
  baseUrl,
  lastUpdated,
}: NavbarProps) {
  const meta = CONN_META[conn];
  const host = baseUrl.replace(/^https?:\/\//, '') || 'no engine';

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-void/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-6 px-5">
        {/* Brand */}
        <div className="flex items-center gap-2.5 pr-2">
          <BrandMark />
          <div className="leading-none">
            <div className="text-[13.5px] font-semibold tracking-tight text-ink">
              IRL <span className="text-ink-muted">Console</span>
            </div>
            <div className="mt-[3px] font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-dim">
              Compliance
            </div>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex items-center gap-1" aria-label="Primary">
          {TABS.map((tab) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelect(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'relative rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
                  isActive ? 'text-ink' : 'text-ink-muted hover:text-ink',
                ].join(' ')}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute inset-x-2.5 -bottom-[1px] h-[2px] rounded-full bg-accent shadow-[0_0_10px] shadow-accent/70" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          {/* Connection pill */}
          <div className="hidden items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 sm:flex">
            <span className={`h-[7px] w-[7px] rounded-full ${meta.dot}`} />
            <div className="leading-none">
              <span className={`text-[11px] font-medium ${meta.text}`}>{meta.label}</span>
              <span className="ml-2 font-mono text-[10.5px] text-ink-dim">{host}</span>
            </div>
            {lastUpdated && conn === 'live' && (
              <span className="ml-1 font-mono text-[10px] text-ink-faint">
                · {formatRelative(lastUpdated)}
              </span>
            )}
          </div>

          {/* Settings gear */}
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Open settings"
            className="group flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted transition-all hover:border-accent/40 hover:text-accent-bright focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[15px] w-[15px] transition-transform duration-500 group-hover:rotate-90"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

function BrandMark() {
  return (
    <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-accent/30 bg-accent/10">
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] text-accent-bright" fill="none">
        {/* Stylized seal/lock glyph */}
        <path
          d="M12 2 4 5.5v6c0 4.6 3.2 8.4 8 10.5 4.8-2.1 8-5.9 8-10.5v-6L12 2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M9 11.5l2 2 4-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
