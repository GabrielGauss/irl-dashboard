import { Fragment, useState } from 'react';
import type { AuditEntry } from '../types';
import { Badge } from './Badge';
import { CopyId, Skeleton } from './ui';
import { auditActionTone } from '../lib/status';
import { formatTimestamp, truncateId } from '../lib/format';
import { JsonViewer } from './JsonViewer';

interface AuditLogTableProps {
  entries: AuditEntry[];
  loading: boolean;
}

const COLS = 'grid grid-cols-[1.3fr_1.4fr_1.1fr_0.9fr_1.1fr_0.4fr] gap-4 items-center';

/** Humanize SCREAMING_SNAKE / PascalCase action names. */
function prettyAction(action: string): string {
  return action
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AuditLogTable({ entries, loading }: AuditLogTableProps) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <div
        className={`${COLS} border-b border-line bg-surface-raised px-5 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-dim`}
      >
        <span>Timestamp</span>
        <span>Action</span>
        <span>Operator</span>
        <span>Target Type</span>
        <span>Target ID</span>
        <span />
      </div>

      {loading && entries.length === 0 ? (
        <SkeletonRows />
      ) : entries.length === 0 ? (
        <div className="px-5 py-12 text-center text-[13px] text-ink-muted">
          No audit events recorded.
        </div>
      ) : (
        <div className="divide-y divide-line/70">
          {entries.map((e) => {
            const isOpen = open === e.id;
            const hasDetail = e.details_json && Object.keys(e.details_json).length > 0;
            return (
              <Fragment key={e.id}>
                <button
                  type="button"
                  onClick={() => hasDetail && setOpen(isOpen ? null : e.id)}
                  className={`${COLS} w-full px-5 py-3 text-left transition-colors ${
                    hasDetail ? 'hover:bg-surface-hover focus:bg-surface-hover' : 'cursor-default'
                  } focus:outline-none ${isOpen ? 'bg-surface-hover' : ''}`}
                >
                  <span className="font-mono text-[11.5px] text-ink-muted">
                    {formatTimestamp(e.created_at)}
                  </span>
                  <span>
                    <Badge tone={auditActionTone(e.action)} dot uppercase={false}>
                      {prettyAction(e.action)}
                    </Badge>
                  </span>
                  <span className="truncate text-[12.5px] text-ink">{e.operator_id}</span>
                  <span className="font-mono text-[11.5px] text-ink-muted">
                    {e.target_type ?? '—'}
                  </span>
                  <span className="font-mono text-[11.5px] text-ink-dim">
                    {e.target_id ? truncateId(e.target_id, 8, 4) : '—'}
                  </span>
                  <span className="flex justify-end">
                    {hasDetail && (
                      <svg
                        viewBox="0 0 24 24"
                        className={`h-4 w-4 text-ink-dim transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    )}
                  </span>
                </button>

                {isOpen && hasDetail && (
                  <div className="animate-fade-up border-t border-line bg-void/40 px-5 py-4">
                    <div className="mb-3 grid gap-4 md:grid-cols-2">
                      {e.target_id && (
                        <div>
                          <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-dim">
                            Full Target ID
                          </div>
                          <CopyId value={e.target_id} display={e.target_id} />
                        </div>
                      )}
                      {e.ip_address && (
                        <div>
                          <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-dim">
                            Source IP
                          </div>
                          <span className="font-mono text-[12px] text-ink-muted">
                            {e.ip_address}
                          </span>
                        </div>
                      )}
                    </div>
                    <JsonViewer data={e.details_json} />
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="divide-y divide-line/70">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className={`${COLS} px-5 py-3.5`}>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <span />
        </div>
      ))}
    </div>
  );
}
