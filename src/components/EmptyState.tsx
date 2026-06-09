import type { ApiError } from '../api';

type Variant = 'error' | 'empty' | 'unconfigured';

interface EmptyStateProps {
  variant: Variant;
  title?: string;
  message?: string;
  error?: ApiError | null;
  onRetry?: () => void;
  onConfigure?: () => void;
}

const ICONS: Record<Variant, React.ReactNode> = {
  error: (
    <path d="M12 9v4m0 4h.01M10.3 3.86l-8.18 14.2A1.5 1.5 0 0 0 3.42 21h17.16a1.5 1.5 0 0 0 1.3-2.94L13.7 3.86a1.5 1.5 0 0 0-2.6 0z" />
  ),
  empty: <path d="M3 7h18M3 12h18M3 17h10" />,
  unconfigured: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),
};

const DEFAULTS: Record<Variant, { title: string; message: string }> = {
  error: {
    title: 'Could not load data',
    message: 'The IRL Engine returned an error.',
  },
  empty: {
    title: 'Nothing here yet',
    message: 'No records match the current view.',
  },
  unconfigured: {
    title: 'Connect to an IRL Engine',
    message: 'Set the engine URL and an API token to begin monitoring.',
  },
};

const accentByVariant: Record<Variant, string> = {
  error: 'text-danger',
  empty: 'text-ink-dim',
  unconfigured: 'text-accent-bright',
};

export function EmptyState({
  variant,
  title,
  message,
  error,
  onRetry,
  onConfigure,
}: EmptyStateProps) {
  const heading = title ?? DEFAULTS[variant].title;
  const body = message ?? error?.message ?? DEFAULTS[variant].message;

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-surface ${accentByVariant[variant]}`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          {ICONS[variant]}
        </svg>
      </div>
      <h3 className="text-[15px] font-semibold text-ink">{heading}</h3>
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-ink-muted">{body}</p>

      {error?.status ? (
        <code className="mt-3 rounded border border-line bg-surface px-2 py-1 font-mono text-[11px] text-ink-dim">
          HTTP {error.status} · {error.kind}
        </code>
      ) : null}

      <div className="mt-5 flex items-center gap-2">
        {onConfigure && (
          <button
            type="button"
            onClick={onConfigure}
            className="rounded-md bg-accent px-3.5 py-1.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-accent-dim focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            Open settings
          </button>
        )}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md border border-line-bright px-3.5 py-1.5 text-[12.5px] font-medium text-ink-muted transition-colors hover:border-accent/50 hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
