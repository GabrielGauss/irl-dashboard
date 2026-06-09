import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../api';

export interface ApiState<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
  /** True only on the very first load — used to distinguish skeleton vs. background refresh. */
  initialLoading: boolean;
  lastUpdated: number | null;
  refetch: () => void;
}

const DEFAULT_REFRESH_MS = 30_000;

/**
 * Generic data hook with auto-refresh and abortable fetches.
 *
 * @param fetcher  Stable function that performs the request. Recreate it (via useCallback
 *                 in the caller, keyed on dependencies) to trigger a fresh load.
 * @param enabled  When false, no fetching occurs (e.g. engine not configured).
 */
export function useApi<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  enabled = true,
  refreshMs = DEFAULT_REFRESH_MS,
): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(enabled);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const hasLoadedRef = useRef(false);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current(signal);
      if (signal.aborted) return;
      setData(result);
      setLastUpdated(Date.now());
      hasLoadedRef.current = true;
    } catch (err) {
      if (signal.aborted) return;
      const apiErr =
        err instanceof ApiError
          ? err
          : new ApiError((err as Error).message ?? 'Unknown error', 0, 'network');
      setError(apiErr);
    } finally {
      if (!signal.aborted) {
        setLoading(false);
        setInitialLoading(false);
      }
    }
  }, []);

  const [tick, setTick] = useState(0);
  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!enabled) {
      setInitialLoading(false);
      return;
    }

    const controller = new AbortController();
    void run(controller.signal);

    const interval = window.setInterval(() => {
      const c = new AbortController();
      void run(c.signal);
    }, refreshMs);

    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, refreshMs, run, tick, fetcher]);

  return {
    data,
    error,
    loading,
    initialLoading: initialLoading && !hasLoadedRef.current,
    lastUpdated,
    refetch,
  };
}
