import { useCallback, useEffect, useState } from 'react';
import type { Settings } from '../types';

const STORAGE_KEY = 'irl-dashboard.settings.v1';

const DEFAULT_SETTINGS: Settings = {
  baseUrl: 'http://localhost:4000',
  token: '',
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      baseUrl: typeof parsed.baseUrl === 'string' ? parsed.baseUrl : DEFAULT_SETTINGS.baseUrl,
      token: typeof parsed.token === 'string' ? parsed.token : DEFAULT_SETTINGS.token,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Settings persisted to localStorage only — tokens never touch the URL.
 * Returns the current settings, a saver, and whether the engine is configured.
 */
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  const save = useCallback((next: Settings) => {
    const cleaned: Settings = {
      baseUrl: next.baseUrl.trim(),
      token: next.token.trim(),
    };
    setSettings(cleaned);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    } catch {
      // localStorage may be unavailable (private mode); keep in-memory state.
    }
  }, []);

  // Keep tabs in sync if settings change in another window.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setSettings(loadSettings());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const isConfigured = settings.baseUrl.trim().length > 0;

  return { settings, save, isConfigured };
}
