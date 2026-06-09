import { useEffect } from 'react';
import type { ApiError } from '../api';
import type { TraceDetail } from '../types';
import { JsonViewer } from './JsonViewer';
import { CopyId, Skeleton } from './ui';
import { EmptyState } from './EmptyState';
import { truncateId } from '../lib/format';

interface TraceDrawerProps {
  traceId: string | null;
  data: TraceDetail | null;
  loading: boolean;
  error: ApiError | null;
  onClose: () => void;
  onRetry: () => void;
}

/** Right-hand slide-over showing the full forensic trace JSON. */
export function TraceDrawer({
  traceId,
  data,
  loading,
  error,
  onClose,
  onRetry,
}: TraceDrawerProps) {
  useEffect(() => {
    if (!traceId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [traceId, onClose]);

  if (!traceId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px] animate-fade-up"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="relative flex h-full w-full max-w-2xl flex-col border-l border-line-bright bg-surface shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Trace detail"
        style={{ animation: 'fade-up 0.3s cubic-bezier(0.16,1,0.3,1)' }}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent-bright/80">
              Reasoning Trace
            </div>
            <div className="mt-1">
              <CopyId value={traceId} display={truncateId(traceId, 10, 8)} className="text-[13px]" />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close trace detail"
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-dim transition-colors hover:bg-surface-hover hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="scroll-thin flex-1 overflow-auto p-5">
          {loading && !data ? (
            <div className="space-y-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-4" />
              ))}
            </div>
          ) : error ? (
            <EmptyState variant="error" error={error} onRetry={onRetry} />
          ) : data ? (
            <JsonViewer data={data} />
          ) : (
            <EmptyState variant="empty" title="No trace body" message="The engine returned no detail for this trace." />
          )}
        </div>
      </aside>
    </div>
  );
}
