import { useEffect, useState } from 'react';
import type { Settings } from '../types';

interface SettingsModalProps {
  open: boolean;
  settings: Settings;
  onClose: () => void;
  onSave: (next: Settings) => void;
}

export function SettingsModal({ open, settings, onClose, onSave }: SettingsModalProps) {
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl);
  const [token, setToken] = useState(settings.token);
  const [showToken, setShowToken] = useState(false);

  // Re-sync local form when reopened.
  useEffect(() => {
    if (open) {
      setBaseUrl(settings.baseUrl);
      setToken(settings.token);
      setShowToken(false);
    }
  }, [open, settings]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const urlValid = /^https?:\/\/.+/i.test(baseUrl.trim());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlValid) return;
    onSave({ baseUrl: baseUrl.trim(), token: token.trim() });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/65 px-4 py-[10vh] backdrop-blur-sm animate-fade-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-line-bright bg-surface shadow-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 id="settings-title" className="text-[15px] font-semibold tracking-tight text-ink">
              Engine Connection
            </h2>
            <p className="mt-0.5 text-[12px] text-ink-muted">
              Stored locally in your browser only.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-dim transition-colors hover:bg-surface-hover hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 px-5 py-5">
          {/* URL */}
          <div>
            <label
              htmlFor="engine-url"
              className="mb-1.5 block font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted"
            >
              IRL Engine URL
            </label>
            <input
              id="engine-url"
              type="url"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="http://localhost:4000"
              className="w-full rounded-lg border border-line-bright bg-void px-3 py-2.5 font-mono text-[13px] text-ink placeholder:text-ink-faint focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            {!urlValid && baseUrl.length > 0 && (
              <p className="mt-1.5 text-[11.5px] text-danger">
                Must start with http:// or https://
              </p>
            )}
          </div>

          {/* Token */}
          <div>
            <label
              htmlFor="api-token"
              className="mb-1.5 block font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-muted"
            >
              API Token <span className="text-ink-faint">(Bearer)</span>
            </label>
            <div className="relative">
              <input
                id="api-token"
                type={showToken ? 'text' : 'password'}
                autoComplete="off"
                spellCheck={false}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="paste read-access token"
                className="w-full rounded-lg border border-line-bright bg-void px-3 py-2.5 pr-11 font-mono text-[13px] text-ink placeholder:text-ink-faint focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                aria-label={showToken ? 'Hide token' : 'Show token'}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-dim transition-colors hover:text-ink-muted"
              >
                {showToken ? <EyeOff /> : <Eye />}
              </button>
            </div>
            <p className="mt-1.5 text-[11.5px] text-ink-dim">
              Sent as <span className="font-mono text-ink-muted">Authorization: Bearer …</span> on
              every request. Never placed in the URL.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-line-bright px-3.5 py-2 text-[12.5px] font-medium text-ink-muted transition-colors hover:border-line-bright hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!urlValid}
              className="rounded-lg bg-accent px-4 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              Save & connect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Eye() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.43M6.6 6.6A13.3 13.3 0 0 0 2 11s3.5 7 10 7a9.1 9.1 0 0 0 4.4-1.1M1 1l22 22" />
    </svg>
  );
}
