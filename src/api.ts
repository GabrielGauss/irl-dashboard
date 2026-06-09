/**
 * IRL Engine API client.
 *
 * Every call is read-only and attaches `Authorization: Bearer <token>`.
 * Errors are normalized into ApiError so views can render a precise empty state
 * (network failure vs. 401 vs. 404 vs. server fault) rather than a generic toast.
 */

import type {
  AgentsResponse,
  AuditLogResponse,
  HealthResponse,
  Settings,
  TraceDetail,
  TracesResponse,
} from './types';

export class ApiError extends Error {
  readonly status: number;
  readonly kind: 'network' | 'auth' | 'not_found' | 'server' | 'parse' | 'config';

  constructor(message: string, status: number, kind: ApiError['kind']) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind;
  }
}

const REQUEST_TIMEOUT_MS = 12_000;

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, '');
}

async function request<T>(settings: Settings, path: string, signal?: AbortSignal): Promise<T> {
  const base = normalizeBaseUrl(settings.baseUrl);
  if (!base) {
    throw new ApiError('No IRL Engine URL configured. Open settings to set one.', 0, 'config');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  // Chain an external abort signal (e.g. component unmount) into ours.
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (settings.token.trim()) {
    headers.Authorization = `Bearer ${settings.token.trim()}`;
  }

  let res: Response;
  try {
    res = await fetch(`${base}${path}`, { headers, signal: controller.signal });
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new ApiError('Request timed out or was cancelled.', 0, 'network');
    }
    throw new ApiError(
      `Cannot reach IRL Engine at ${base}. Check the URL and that the engine is running.`,
      0,
      'network',
    );
  } finally {
    clearTimeout(timeout);
  }

  if (res.status === 401 || res.status === 403) {
    throw new ApiError(
      'Authorization rejected. Verify the API token in settings has read access.',
      res.status,
      'auth',
    );
  }
  if (res.status === 404) {
    throw new ApiError(`Endpoint not found: ${path}`, 404, 'not_found');
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(
      `Engine returned ${res.status}${body ? `: ${body.slice(0, 200)}` : ''}`,
      res.status,
      'server',
    );
  }

  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiError('Engine returned a malformed JSON response.', res.status, 'parse');
  }
}

export const api = {
  health: (s: Settings, signal?: AbortSignal) =>
    request<HealthResponse>(s, '/irl/health', signal),

  agents: (s: Settings, signal?: AbortSignal) =>
    request<AgentsResponse>(s, '/irl/agents', signal),

  traces: (
    s: Settings,
    params: { limit?: number; agent_id?: string; status?: string } = {},
    signal?: AbortSignal,
  ) => {
    const q = new URLSearchParams();
    if (params.limit) q.set('limit', String(params.limit));
    if (params.agent_id) q.set('agent_id', params.agent_id);
    if (params.status) q.set('status', params.status);
    const qs = q.toString();
    return request<TracesResponse>(s, `/irl/traces${qs ? `?${qs}` : ''}`, signal);
  },

  trace: (s: Settings, id: string, signal?: AbortSignal) =>
    request<TraceDetail>(s, `/irl/trace/${encodeURIComponent(id)}`, signal),

  auditLog: (s: Settings, limit = 100, signal?: AbortSignal) =>
    request<AuditLogResponse>(s, `/irl/admin/audit-log?limit=${limit}`, signal),
};
