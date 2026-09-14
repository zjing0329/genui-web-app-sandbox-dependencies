/**
 * Per-app Supabase config for mini-apps.
 *
 * Source of truth: the MCP server injects this as ``window.__DEEPDIVER_CONFIG__``
 * at preview serve time, or the mini-app fetches an equivalent payload from
 * ``/api/preview/<app>/config`` when running in active Vite mode.
 *
 * All app tables live in the shared ``app_data`` schema with an
 * app-scoped physical prefix. App-backed runtimes inject ``appId`` and,
 * when available, ``appPrefix`` explicitly.
 */
export interface DeepDiverConfig {
    /**
     * Kong URL for the Agent Supabase stack, e.g.
     * ``http://localhost:8000`` or ``https://supabase.yourdomain.com``.
     * Used by ``@supabase/supabase-js`` as its ``supabaseUrl``.
     */
    supabaseUrl: string;
    /**
     * Supabase anon key — safe to embed in browsers. RLS + JWT do the real
     * access control; this key only gets the mini-app past Kong.
     */
    supabaseAnonKey: string;
    /** Stable long-lived app id for this runtime. */
    appId?: string;
    /**
     * Deprecated compatibility alias for appId. New config producers must emit
     * appId; the SDK only accepts this to keep older generated apps running.
     */
    workspaceId?: string;
    /**
     * Physical table/bucket prefix, e.g. ``app_deadbeefcafe_``. When omitted,
     * the SDK derives it from ``appId``.
     */
    appPrefix?: string;
    /**
     * Postgres schema holding this app's tables — the value sent as
     * ``Accept-Profile`` / ``Content-Profile`` on every request.
     *
     * Unsharded deployments leave this unset and everything lives in the single
     * ``app_data`` schema. Under sharding the server places each app on one
     * ``app_data_NN`` schema, served by its own PostgREST process behind the
     * same public origin, and names it here. Kong routes on the profile header,
     * so shard topology never reaches the app's URL and published apps stay
     * portable across renumbering.
     *
     * Omitting it when the app IS sharded is a silent, per-app failure: the
     * request falls through Kong to the unsharded fallback route and the app
     * reads an empty schema rather than erroring. Producers must emit it.
     */
    supabaseSchema?: string;
    /**
     * Short-lived viewer JWT minted by the MCP server (signed with
     * ``SUPABASE_JWT_SECRET``). Valid for 1h by default; the SDK refreshes
     * it against ``/api/preview/<app>/config`` before expiry.
     *
     * Carries a ``ws`` claim that every table's RLS policy checks — a JWT
     * issued for workspace A cannot read or write workspace B's tables.
     *
     * Optional: when absent the SDK runs as anon, which in practice means
     * RLS denies every row. Useful for the brief window before the first
     * refresh completes; apps should wait for ``onAuthReady()`` before
     * firing queries if they care.
     */
    viewerToken?: string;
    /**
     * Original preview credential used to mint/refresh ``viewerToken`` in active
     * preview mode. Exactly one of these is usually present.
     */
    previewToken?: string;
    viewerLinkToken?: string;
    platformUserJwt?: string;
    /**
     * Credential for trading a still-valid ``viewerToken`` for a fresh one.
     *
     * A published app served from ``/a/<app>/`` has none of the three
     * credentials above — they are all null once the app is no longer running
     * behind a preview session — so this is its only way to stay alive past the
     * token's one-hour lifetime. The server caps how long a single page load can
     * keep renewing; past that cap the page must reload.
     */
    renewToken?: string;
    /**
     * Base URL for the external share-link API, e.g.
     * ``/api/preview/<app>/share``. Used by ``db.share.create(...)`` to mint
     * anonymous share links scoped to a single resource.
     *
     * Optional: when absent (older server builds or Vite-env config paths
     * that don't inject it), the SDK falls back to
     * ``/api/preview/<appId>/share`` which is the current canonical
     * route shape. See ``skills/data_layer/.../share_sdk_api.md``.
     */
    shareApiUrl?: string;
}
export type RLSMode = 'private' | 'shared_read' | 'shared';
/**
 * Payload emitted by ``subscribe(table, event, cb)`` callbacks. Matches
 * Supabase Realtime's postgres_changes shape — we expose it directly
 * instead of wrapping it so mini-app authors can reuse existing docs.
 */
export interface ChangeEvent<TRow = Record<string, unknown>> {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: TRow;
    old: Partial<TRow>;
    /** Logical table name (un-prefixed), matching what the agent created. */
    table: string;
    /** The app's data schema: ``app_data``, or its ``app_data_NN`` shard. */
    schema: string;
    commit_timestamp: string;
}
//# sourceMappingURL=types.d.ts.map