import { useState } from 'react';

/** Monospace ID/hash with click-to-copy. */
export function CopyId({
  value,
  display,
  className = '',
}: {
  value: string;
  display: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard may be blocked; silently ignore.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={`${value}  ·  click to copy`}
      className={`group/copy inline-flex items-center gap-1.5 font-mono text-[12px] text-ink-muted transition-colors hover:text-accent-bright focus:text-accent-bright focus:outline-none ${className}`}
    >
      <span>{copied ? 'copied' : display}</span>
      <svg
        viewBox="0 0 24 24"
        className="h-3 w-3 opacity-0 transition-opacity group-hover/copy:opacity-60"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M5 15V5a2 2 0 0 1 2-2h10" />
      </svg>
    </button>
  );
}

/** Loading shimmer block. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded ${className}`} />;
}

/** Section header used above panels. */
export function PanelHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow?: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent-bright/80">
            {eyebrow}
          </div>
        )}
        <h2 className="text-[15px] font-semibold tracking-tight text-ink">{title}</h2>
      </div>
      {right}
    </div>
  );
}
