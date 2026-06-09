/**
 * TypeScript interfaces mirroring the IRL Engine wire format.
 *
 * Sourced from the engine's Rust route handlers:
 *  - GET /irl/health            → { status, cert_expiry_status? }
 *  - GET /irl/agents            → { agents: AgentProfile[] }
 *  - GET /irl/traces            → { count, traces: TraceSummary[] }
 *  - GET /irl/trace/:id         → full Reasoning_Trace_v1 JSON (arbitrary shape)
 *  - GET /irl/admin/audit-log   → { count, entries: AuditEntry[], next_cursor }
 */

export interface HealthResponse {
  status: string;
  cert_expiry_status?: 'ok' | 'expired' | { warning: string };
}

/** Matches registry::AgentProfile in the engine. */
export interface AgentProfile {
  agent_id: string;
  name: string;
  model_hash_hex: string;
  policy_module_id: string;
  /** null = all regimes permitted. */
  allowed_regimes: number[] | null;
  max_notional: number;
  max_leverage: number;
  allowed_venues: string[] | null;
  status: string;
  allowed_mta_pubkeys: string[] | null;
}

export interface AgentsResponse {
  agents: AgentProfile[];
}

/** verification_status enum from the engine. */
export type VerificationStatus =
  | 'PENDING'
  | 'MATCHED'
  | 'DIVERGENT'
  | 'ORPHAN'
  | 'EXPIRED'
  | 'SHADOW_HALTED';

/** Trace summary row returned by GET /irl/traces. */
export interface TraceSummary {
  trace_id: string;
  agent_id: string | null;
  txn_time: string;
  policy_result: string;
  verification_status: string;
  execution_asset: string;
  execution_notional: number | null;
  reasoning_hash: string;
}

export interface TracesResponse {
  count: number;
  traces: TraceSummary[];
}

/** Full forensic trace from GET /irl/trace/:id — shape is operator-defined JSON. */
export type TraceDetail = Record<string, unknown>;

/** Audit log entry from GET /irl/admin/audit-log. */
export interface AuditEntry {
  id: string;
  operator_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details_json: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface AuditLogResponse {
  count: number;
  entries: AuditEntry[];
  next_cursor: string | null;
}

/**
 * MTA regime snapshot — embedded inside each full trace JSON.
 * The Overview's regime card derives current regime from the most recent trace.
 */
export interface RegimeSnapshot {
  regime_id: number;
  regime_label: string;
  risk_level: number;
  max_notional_scale: number;
  allowed_sides: string[];
  version?: string;
  hash?: string;
}

export interface Settings {
  baseUrl: string;
  token: string;
}
