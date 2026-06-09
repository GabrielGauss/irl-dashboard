import { useCallback, useState } from 'react';
import { Navbar, type ConnState, type TabId } from './components/Navbar';
import { SettingsModal } from './components/SettingsModal';
import { EmptyState } from './components/EmptyState';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OverviewView } from './views/OverviewView';
import { AgentsView } from './views/AgentsView';
import { TracesView } from './views/TracesView';
import { AuditView } from './views/AuditView';
import { useSettings } from './hooks/useSettings';

export default function App() {
  const { settings, save, isConfigured } = useSettings();
  const [tab, setTab] = useState<TabId>('overview');
  const [settingsOpen, setSettingsOpen] = useState(!isConfigured);
  const [conn, setConn] = useState<ConnState>(isConfigured ? 'connecting' : 'idle');
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const reportConn = useCallback((state: 'live' | 'error') => setConn(state), []);
  const reportLastUpdated = useCallback((ts: number | null) => setLastUpdated(ts), []);

  const enabled = isConfigured;

  return (
    <div className="min-h-screen">
      <Navbar
        active={tab}
        onSelect={setTab}
        onOpenSettings={() => setSettingsOpen(true)}
        conn={enabled ? conn : 'idle'}
        baseUrl={settings.baseUrl}
        lastUpdated={lastUpdated}
      />

      <main className="mx-auto max-w-[1600px] px-5 py-6 min-[1024px]:min-w-[1024px]">
        {!enabled ? (
          <div className="rounded-2xl border border-line bg-surface shadow-card">
            <EmptyState variant="unconfigured" onConfigure={() => setSettingsOpen(true)} />
          </div>
        ) : (
          <ErrorBoundary resetKey={tab}>
            {tab === 'overview' && (
              <OverviewView
                settings={settings}
                enabled={enabled}
                onReportConn={reportConn}
                onLastUpdated={reportLastUpdated}
              />
            )}
            {tab === 'agents' && (
              <AgentsView settings={settings} enabled={enabled} onReportConn={reportConn} />
            )}
            {tab === 'traces' && (
              <TracesView settings={settings} enabled={enabled} onReportConn={reportConn} />
            )}
            {tab === 'audit' && (
              <AuditView settings={settings} enabled={enabled} onReportConn={reportConn} />
            )}
          </ErrorBoundary>
        )}
      </main>

      <footer className="mx-auto max-w-[1600px] px-5 pb-8 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 font-mono text-[10.5px] text-ink-faint">
          <span>IRL ENGINE · COMPLIANCE CONSOLE · READ-ONLY</span>
          <span>Tokens stored in localStorage · never transmitted in URLs</span>
        </div>
      </footer>

      <SettingsModal
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onSave={(next) => {
          save(next);
          setConn('connecting');
          setLastUpdated(null);
        }}
      />
    </div>
  );
}
