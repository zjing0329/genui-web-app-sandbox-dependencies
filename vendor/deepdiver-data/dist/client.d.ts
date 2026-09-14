import { type SupabaseClient } from '@supabase/supabase-js';
import type { DeepDiverConfig, ChangeEvent } from './types.js';
import { parseSubClaim as _parseSubClaim, tokenRemainingMs as _tokenRemainingMs } from './jwt-utils.js';
import { type DeepDiverStorage } from './storage.js';
import { type DeepDiverShare } from './share.js';
export type { DeepDiverConfig, ChangeEvent } from './types.js';
export { appPrefixFromId, rewriteSelectEmbeds, wrapBuilderSelects } from './rewrite.js';
/**
 * Row shape of the managed ``profiles`` table. Columns mirror the DDL
 * emitted by ``SupabaseService._install_profiles_sql`` — ``id`` is a UUID
 * (same as ``currentUser().id``); ``display_name`` and ``avatar_url`` are
 * nullable identity hints the server upserts from the auth-bridge response.
 */
export interface ProfileRow {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}
export interface DeepDiverClient {
    /** The resolved config the client was built from (read-only). */
    getConfig(): Readonly<DeepDiverConfig>;
    /**
     * Start a Supabase query builder for ``table``. The SDK prepends the
     * workspace prefix so you just write the logical name your agent created
     * (e.g. ``client.from('moments')``). Returns the raw supabase-js query
     * builder — full CRUD surface (``select``, ``insert``, ``update``,
     * ``delete``, ``upsert``, filters, order, range, …). ``user_id`` is
     * auto-filled by the DB on insert; omit it.
     *
     * Embed grammar inside ``.select()`` is rewritten for you: bare relation
     * references like ``moment_assets(*)`` become ``app_<hex>_moment_assets(*)``.
     * Aliased embeds like ``profiles:user_id(*)`` are left alone — PostgREST
     * resolves them through the auto-installed ``user_id → profiles(id)`` FK.
     */
    from(table: string): any;
    /**
     * Shortcut for the workspace's managed ``profiles`` table. Equivalent to
     * ``from('profiles')`` but always points at the managed table and keeps
     * mini-app code readable (``db.profiles().select('*')``). Rows are
     * upserted server-side every time a viewer JWT is minted, so you can rely
     * on the row existing before the first query runs.
     */
    profiles(): any;
    /**
     * Fetch the current viewer's profile row. Resolves to ``null`` when the
     * viewer JWT hasn't loaded yet or the row isn't there (the latter should
     * not happen — upsert is part of the JWT mint — but we handle it defensively).
     * Throws on DB errors so callers can surface a proper failure state.
     */
    currentProfile(): Promise<ProfileRow | null>;
    /**
     * Subscribe to a realtime event on a workspace table. The SDK enables
     * realtime for the table on first subscribe (an idempotent, workspace-
     * scoped RPC) before joining the channel — no manual opt-in step, and
     * mini-app code needs no changes.
     *
     * @returns unsubscribe function — call it to tear down the subscription.
     */
    subscribe<TRow = Record<string, unknown>>(table: string, event: 'INSERT' | 'UPDATE' | 'DELETE' | '*', callback: (payload: ChangeEvent<TRow>) => void): () => void;
    /**
     * Presence channel — who's currently in ``channelName``. Track + list online
     * peers; events fire on sync.
     */
    presence(channelName: string): PresenceChannel;
    /**
     * Broadcast channel — ephemeral peer-to-peer events, not stored in the DB.
     * Useful for cursor positions, typing indicators, game moves.
     */
    broadcast(channelName: string, event: string, payload: Record<string, unknown>): Promise<void>;
    /**
     * Subscribe to broadcast events on ``channelName``. Returns unsubscribe fn.
     */
    onBroadcast(channelName: string, event: string, callback: (payload: Record<string, unknown>) => void): () => void;
    /**
     * The current viewer's identity, parsed from the JWT's ``sub`` claim.
     * Returns ``{ id: string | null }``. The id is always a UUID string when
     * present — a platform user UUID for creators and email-invite viewers, or
     * the viewer_link's UUID for anonymous share-link viewers. Returns null
     * until the viewer JWT has loaded (a brief race on first mount when no
     * token was injected up-front — mini-apps that key queries off ``myId``
     * should treat the null case as "loading"). Do not use for authorization —
     * RLS is the server-side gate; this is purely for UI display.
     */
    currentUser(): {
        id: string | null;
    };
    /**
     * Storage buckets for this workspace. Use ``db.storage.from('avatars').upload(...)``
     * etc. The SDK prefixes bucket names with ``app_<12hex>_`` transparently — you
     * pass the logical name the agent created, not the physical bucket id. Buckets
     * must be created server-side by the agent via the Storage MCP tool; the
     * mini-app only reads/writes existing buckets.
     */
    storage: DeepDiverStorage;
    /**
     * External share links — ``db.share.create({...})``. Creates an
     * anonymous, scope-restricted URL anyone can open (outside the workspace's
     * up-to-16 viewers). Does NOT consume a viewer seat. See
     * ``share_sdk_api.md`` for usage. For within-the-workspace sharing, use
     * RLS on ``user_id`` instead — share links are strictly for external
     * recipients.
     */
    share: DeepDiverShare;
    /** Escape hatch — the raw supabase-js client, in case you need something exotic. */
    rawClient(): SupabaseClient;
}
export interface PresenceChannel {
    /** Publish this viewer's state; receivers see it in ``onSync``. */
    track(state: Record<string, unknown>): Promise<void>;
    /** Register a callback that fires on every membership update. */
    onSync(callback: (state: Record<string, Record<string, unknown>[]>) => void): void;
    /** Remove this viewer from the channel. */
    untrack(): Promise<void>;
    /** Tear down the channel. */
    unsubscribe(): Promise<void>;
    /** Snapshot the current membership state. */
    list(): Record<string, Record<string, unknown>[]>;
}
/**
 * Create the client. Most mini-apps call ``createClient()`` with no args —
 * the SDK picks up the injected config automatically. Pass ``overrides``
 * to replace specific fields (useful for tests and embeds).
 */
export declare function createClient(overrides?: Partial<DeepDiverConfig>): DeepDiverClient;
export declare const parseSubClaim: typeof _parseSubClaim;
export declare const tokenRemainingMs: typeof _tokenRemainingMs;
//# sourceMappingURL=client.d.ts.map