// Copyright (c) 2025 DeepDiver Team. All rights reserved.
//
// createClient() — the public entry point mini-apps import.
//
// Thin wrapper around @supabase/supabase-js that:
//   1. Resolves DeepDiverConfig from the host environment (window / Vite
//      env / meta tag / REST fallback).
//   2. Constructs a Supabase client pinned to the shared ``app_data``
//      schema, with the viewer JWT attached.
//   3. Transparently prefixes every ``from(name)`` / ``channel(name)`` with
//      the app's physical table prefix so mini-app code calls logical table
//      names without caring about storage naming.
//   4. Exposes the primitives mini-apps actually need — CRUD, realtime,
//      presence, broadcast — without dragging in the full Supabase surface
//      area. When you need something advanced, ``rawClient()`` hands you
//      back the underlying supabase-js client.
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { fetchConfigFromServer, resolveConfigSync } from './config.js';
import { parseSubClaim as _parseSubClaim, tokenRemainingMs as _tokenRemainingMs } from './jwt-utils.js';
import { createStorage } from './storage.js';
import { createShare } from './share.js';
import { appPrefixFromId, wrapBuilderSelects } from './rewrite.js';
export { appPrefixFromId, rewriteSelectEmbeds, wrapBuilderSelects } from './rewrite.js';
/** The shared schema every workspace's tables live in. Matches
 *  ``SHARED_SCHEMA`` in supabase_service.py and ``PGRST_DB_SCHEMAS``. */
const SHARED_SCHEMA = 'app_data';
/** The app's data schema: its shard when the server named one, else the
 *  single unsharded ``app_data``. Older servers emit no ``supabaseSchema``,
 *  and unsharded deployments never will, so the fallback is the norm rather
 *  than an error path. */
function schemaOf(config) {
    return config.supabaseSchema || SHARED_SCHEMA;
}
// Refresh the viewer token this far before it expires. One minute of slack.
const REFRESH_SLACK_MS = 60000;
/**
 * Create the client. Most mini-apps call ``createClient()`` with no args —
 * the SDK picks up the injected config automatically. Pass ``overrides``
 * to replace specific fields (useful for tests and embeds).
 */
export function createClient(overrides) {
    const sync = resolveConfigSync();
    if (!sync && !(overrides && overrides.supabaseUrl)) {
        throw new Error('[deepdiver/data] no config found. Ensure window.__DEEPDIVER_CONFIG__ or VITE_DEEPDIVER_* env vars are set.');
    }
    const resolvedConfigAppId = overrides?.appId ?? sync?.appId ?? overrides?.workspaceId ?? sync?.workspaceId;
    const config = {
        supabaseUrl: overrides?.supabaseUrl ?? sync.supabaseUrl,
        supabaseAnonKey: overrides?.supabaseAnonKey ?? sync?.supabaseAnonKey ?? '',
        appId: resolvedConfigAppId,
        workspaceId: overrides?.workspaceId ?? sync?.workspaceId,
        appPrefix: overrides?.appPrefix ?? sync?.appPrefix,
        supabaseSchema: overrides?.supabaseSchema ?? sync?.supabaseSchema,
        viewerToken: overrides?.viewerToken ?? sync?.viewerToken,
        previewToken: overrides?.previewToken ?? sync?.previewToken,
        viewerLinkToken: overrides?.viewerLinkToken ?? sync?.viewerLinkToken,
        platformUserJwt: overrides?.platformUserJwt ?? sync?.platformUserJwt,
        // Older server builds don't emit ``renewToken``; the initial viewer token
        // is an equally valid renewal credential, so fall back to it.
        renewToken: overrides?.renewToken ??
            sync?.renewToken ??
            overrides?.viewerToken ??
            sync?.viewerToken,
        // Fall back to the canonical server route so older injections (before
        // ``shareApiUrl`` was emitted) still work. New server builds include it.
        shareApiUrl: overrides?.shareApiUrl ??
            sync?.shareApiUrl ??
            `/api/preview/${resolvedConfigAppId}/share`,
    };
    const appId = config.appId;
    if (!appId) {
        throw new Error('[deepdiver/data] config missing appId.');
    }
    const resolvedAppId = appId;
    // App-backed previews should inject appPrefix directly. When omitted,
    // derive the physical ``app_<12hex>_`` prefix from the app id. ``let``:
    // a token-less boot config may not carry the prefix, in which case the
    // first successful config refresh adopts the server's authoritative value.
    let prefix = config.appPrefix ?? appPrefixFromId(appId);
    const physical = (name) => `${prefix}${name}`;
    // Swappable: a client built from a partial source (sandbox boot file /
    // Vite env — recognizable by the missing viewer token) is pinned to a
    // possibly-relative URL and the default schema. The first successful config
    // fetch adopts the server payload and rebuilds this client ONCE; it never
    // swaps again afterwards. All realtime channel creation is gated behind
    // ``realtimeReady`` (resolved after that single swap), so every channel is
    // created on the final client — nothing needs re-subscribing across the
    // swap, and the pre-swap client never owns a channel.
    let supabase = buildSupabase(config);
    let currentToken = config.viewerToken;
    // True while the construction config is presumed partial. A config source
    // that ships a viewer token (published injection, web-demo proxy injection)
    // is complete by contract, so no adoption happens and realtime is ready
    // immediately.
    let needsAdoption = !config.viewerToken;
    let resolveRealtimeReady = null;
    const realtimeReady = needsAdoption
        ? new Promise((resolve) => {
            resolveRealtimeReady = resolve;
        })
        : Promise.resolve();
    /**
     * Adopt the authoritative server config after a token-less construction.
     *
     * The boot-file/Vite sources omit ``supabaseSchema`` (a sharded app pinned
     * to the ``app_data`` fallback silently reads an EMPTY schema — a data-loss
     * lookalike), may omit ``appPrefix``, and carry a root-relative
     * ``supabaseUrl``/``shareApiUrl`` that resolve against the sandbox origin.
     * The ``/config`` payload carries all four in browser-reachable absolute
     * form, so adopt them and rebuild the pinned supabase-js client once.
     */
    function adoptServerConfig(fresh) {
        needsAdoption = false;
        if (fresh.supabaseUrl)
            config.supabaseUrl = fresh.supabaseUrl;
        if (fresh.supabaseAnonKey)
            config.supabaseAnonKey = fresh.supabaseAnonKey;
        if (fresh.supabaseSchema)
            config.supabaseSchema = fresh.supabaseSchema;
        if (fresh.appPrefix) {
            config.appPrefix = fresh.appPrefix;
            prefix = fresh.appPrefix;
        }
        if (fresh.shareApiUrl)
            config.shareApiUrl = fresh.shareApiUrl;
        if (fresh.renewToken)
            config.renewToken = fresh.renewToken;
        const rebuilt = buildSupabase({
            ...config,
            viewerToken: fresh.viewerToken ?? currentToken,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rebuilt.__deepdiverTimer = supabase.__deepdiverTimer;
        supabase = rebuilt;
        // Unblock realtime AFTER the swap so every channel binds to the final
        // client, with the final schema and a browser-reachable websocket URL.
        resolveRealtimeReady?.();
        resolveRealtimeReady = null;
    }
    // Per-client caches for stable-name channels. Presence and broadcast
    // semantics require cross-client agreement on the channel name, so we
    // can't uniqueify them like ``subscribe()`` does; instead we reuse a
    // single supabase channel per logical name and fan out locally.
    const presenceCache = new Map();
    const broadcastCache = new Map();
    // supabase-js accepts a bearer JWT for REST via ``global.headers`` but
    // the realtime websocket is a separate auth channel. Without this call the
    // first connection runs as ``anon``, so RLS-filtered ``postgres_changes``
    // events arrive with columns redacted (you see the INSERT, but ``new``
    // only has the primary key — mini-app UIs render blank until a reload).
    if (currentToken) {
        supabase.realtime.setAuth(currentToken);
    }
    /**
     * Point the realtime socket's *handshake* URL at the new token.
     *
     * ``setAuth`` only updates the token sent in-band after the socket is up.
     * Our websocket proxy authorizes at the handshake, off the ``viewer_token``
     * query param, and supabase-js freezes that URL when the client is built —
     * so without this a reconnect an hour later replays the expired token and
     * the proxy closes it. Written defensively: if realtime-js changes shape,
     * this quietly does nothing rather than breaking the refresh.
     */
    function retargetRealtimeToken(token) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rt = supabase.realtime;
        if (!rt || typeof rt.endPoint !== 'string')
            return;
        try {
            const origin = typeof window !== 'undefined' && window.location?.origin
                ? window.location.origin
                : 'http://localhost';
            const next = new URL(rt.endPoint, origin);
            if (!next.searchParams.has('viewer_token'))
                return;
            next.searchParams.set('viewer_token', token);
            rt.endPoint = next.toString();
        }
        catch {
            // Non-fatal: REST keeps working on the refreshed token either way.
        }
    }
    async function ensureToken() {
        // If we already have a token and it's still fresh, short-circuit.
        if (currentToken && tokenRemainingMs(currentToken) > REFRESH_SLACK_MS)
            return;
        const refreshed = await fetchConfigFromServer(resolvedAppId, {
            previewToken: config.previewToken,
            viewerLinkToken: config.viewerLinkToken,
            platformUserJwt: config.platformUserJwt,
            // The freshest token we hold, not the one from the original page load —
            // that keeps the renewal chain moving instead of re-presenting a
            // credential that has already been traded in.
            renewToken: currentToken ?? config.renewToken,
        });
        if (refreshed && needsAdoption) {
            adoptServerConfig(refreshed);
        }
        if (refreshed?.viewerToken) {
            currentToken = refreshed.viewerToken;
            supabase.realtime.setAuth(currentToken);
            retargetRealtimeToken(currentToken);
            // supabase-js keeps per-request auth in its global headers; we need
            // to reset them so subsequent ``from()`` calls use the new token.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            supabase.rest.headers = {
                ...(supabase.rest.headers ?? {}),
                Authorization: `Bearer ${currentToken}`,
                apikey: config.supabaseAnonKey,
            };
        }
    }
    // Kick off an initial refresh so the first real query has a JWT even if
    // the config resolver (e.g. Vite env path) didn't come with one. We
    // deliberately don't ``await`` it — the consumer's first query races
    // against the refresh, and RLS will simply deny until it completes.
    if (!currentToken) {
        void ensureToken();
    }
    // Background refresh: 1-minute poll, cheap because most calls just no-op
    // on the "still fresh" branch.
    if (typeof window !== 'undefined') {
        const timer = window.setInterval(() => void ensureToken(), 60000);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        supabase.__deepdiverTimer = timer;
    }
    // Publish-on-subscribe: tables join the ``supabase_realtime`` publication
    // lazily via an idempotent SECURITY DEFINER RPC that derives the physical
    // name from the JWT ``ws`` claim (a caller can only enable its own
    // tables). Cached per table so repeat subscribes don't re-fire. On error
    // we log and fall through to the join attempt — against an older server
    // (schema-level publication) the join still works without the RPC.
    const realtimeEnabled = new Map();
    const enableRealtime = (table) => {
        let pending = realtimeEnabled.get(table);
        if (!pending) {
            pending = (async () => {
                // Wait out the one-time config adoption first (no-op when the client
                // was built from a complete source): the RPC must run on the final
                // client or it targets the wrong origin/schema.
                await realtimeReady;
                await ensureToken();
                const { error } = await supabase.rpc('deepdiver_enable_realtime', { tbl: table });
                if (error) {
                    console.warn(`[deepdiver/data] enable_realtime(${table}): ${error.message}`);
                }
            })().catch((err) => {
                console.warn(`[deepdiver/data] enable_realtime(${table}) failed`, err);
            });
            realtimeEnabled.set(table, pending);
        }
        return pending;
    };
    // Build a wrapped query builder whose ``.select()`` rewrites embed-grammar
    // references for the caller — including the ``.select()`` chained after
    // ``insert``/``upsert``/``update``/``delete``, which lives on a different
    // builder object in supabase-js. Filters, order, range … pass through
    // untouched.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wrappedFrom = (table) => wrapBuilderSelects(supabase.from(physical(table)), prefix);
    return {
        getConfig: () => Object.freeze({ ...config, viewerToken: currentToken }),
        from: wrappedFrom,
        profiles: () => wrappedFrom('profiles'),
        async currentProfile() {
            const id = currentToken ? parseSubClaim(currentToken) : null;
            if (!id)
                return null;
            const { data, error } = await supabase
                .from(`${prefix}profiles`)
                .select('*')
                .eq('id', id)
                .maybeSingle();
            if (error)
                throw error;
            return data ?? null;
        },
        subscribe(table, event, callback) {
            const physicalTable = physical(table);
            let disposed = false;
            let channel = null;
            // Enable-then-join: with the per-table publication, the table must be
            // published before the websocket join or realtime rejects the
            // ``postgres_changes`` subscription. ``enableRealtime`` never rejects
            // (errors are logged and swallowed) so the join always proceeds.
            void enableRealtime(table).then(() => {
                if (disposed)
                    return;
                // supabase-js's ``.channel(name)`` returns an existing channel if one
                // already exists under that name. Mini-apps commonly re-subscribe to
                // the same table from different components or after a remount; the
                // reused channel is already in the SUBSCRIBED state, so a fresh
                // ``.on('postgres_changes', ...)`` against it throws. Suffix with a
                // unique token so every subscribe() call gets its own channel.
                channel = supabase.channel(`${prefix}${table}:${uniqueChannelSuffix()}`);
                channel.on(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                'postgres_changes', 
                // Realtime filters by physical schema too: a subscription naming
                // ``app_data`` never fires for a table that lives on a shard.
                { event, schema: schemaOf(config), table: physicalTable }, (payload) => {
                    // Supabase emits the physical table name; rewrite it to the
                    // logical one so mini-app code sees what it asked for.
                    const p = payload;
                    callback({ ...p, table });
                });
                channel.subscribe();
            });
            return () => {
                disposed = true;
                if (channel)
                    void supabase.removeChannel(channel);
            };
        },
        presence(channelName) {
            // Cache presence channels by logical name. Cross-client routing
            // requires stable channel names on the wire, and supabase-js refuses
            // a second ``.channel(sameName)`` that's already subscribed, so we
            // return the SAME handle for every call. All ``onSync`` listeners in
            // the process share one fan-out list. The underlying channel is created
            // lazily behind ``realtimeReady`` so it always binds to the final
            // (post-adoption) client.
            return getOrCreatePresenceHandle(() => supabase, realtimeReady, `${prefix}presence:${channelName}`, presenceCache);
        },
        async broadcast(channelName, event, payload) {
            const bundle = getOrCreateBroadcast(() => supabase, realtimeReady, `${prefix}broadcast:${channelName}`, broadcastCache);
            const channel = await bundle.channelReady;
            // All broadcasts go out under a single wire event so receivers only
            // need one ``.on('broadcast', ...)`` binding (registered eagerly, pre-
            // subscribe). The logical event name travels inside the envelope.
            await channel.send({
                type: 'broadcast',
                event: BROADCAST_WIRE_EVENT,
                payload: { _e: event, _p: payload },
            });
        },
        onBroadcast(channelName, event, callback) {
            const bundle = getOrCreateBroadcast(() => supabase, realtimeReady, `${prefix}broadcast:${channelName}`, broadcastCache);
            const list = bundle.handlers.get(event) ?? [];
            list.push(callback);
            bundle.handlers.set(event, list);
            return () => {
                const arr = bundle.handlers.get(event);
                if (!arr)
                    return;
                const idx = arr.indexOf(callback);
                if (idx >= 0)
                    arr.splice(idx, 1);
            };
        },
        currentUser() {
            return { id: currentToken ? parseSubClaim(currentToken) : null };
        },
        // Accessor-based so both survive the one-time adoption swap: the storage
        // namespace always talks to the current client with the current prefix,
        // and share re-reads ``shareApiUrl`` per request (adoption replaces the
        // relative default with the server's absolute URL — required in static
        // sandbox previews, whose origin has no /api/preview routes).
        storage: createStorage(() => supabase, () => prefix),
        share: createShare({
            getShareApiUrl: () => config.shareApiUrl ?? `/api/preview/${resolvedAppId}/share`,
            getToken: () => currentToken,
        }),
        rawClient: () => supabase,
    };
}
// --- helpers ---------------------------------------------------------------
// Per-process counter → collision-free channel names without pulling in a
// uuid dependency. Suffix pattern: ``{ms}-{counter}-{rand}``. Used by
// ``subscribe()`` because supabase-js reuses channels by name, and mini-apps
// routinely mount the same subscription twice (dev StrictMode, remounts,
// multiple components listening to one table).
let _channelCounter = 0;
function uniqueChannelSuffix() {
    _channelCounter = (_channelCounter + 1) | 0;
    const rand = Math.random().toString(36).slice(2, 8);
    return `${Date.now().toString(36)}-${_channelCounter}-${rand}`;
}
// Wire-level event name used by ``broadcast()``. Every logical event the
// mini-app sends is wrapped in an envelope under this single wire name, so
// a subscriber only needs one ``.on('broadcast', {event: WIRE}, ...)``
// binding that can be registered once (pre-subscribe) and never needs
// re-registration when a new logical event is added. Also keeps
// ``onBroadcast(…, logical, cb)`` race-free on remount.
const BROADCAST_WIRE_EVENT = '__ddt_bcast__';
function getOrCreateBroadcast(getClient, gate, topic, cache) {
    const existing = cache.get(topic);
    if (existing)
        return existing;
    const handlers = new Map();
    const channelReady = (async () => {
        await gate;
        const channel = getClient().channel(topic);
        // Single pre-subscribe binding; dispatch to logical handlers from the
        // envelope. Registering here guarantees ``.on`` is never called after
        // ``.subscribe()`` on a reused channel.
        channel.on('broadcast', { event: BROADCAST_WIRE_EVENT }, ({ payload }) => {
            if (!payload || typeof payload._e !== 'string')
                return;
            const list = handlers.get(payload._e);
            if (!list)
                return;
            for (const cb of list)
                cb(payload._p ?? {});
        });
        await new Promise((resolve) => {
            channel.subscribe((status) => {
                if (status === 'SUBSCRIBED')
                    resolve();
            });
        });
        return channel;
    })();
    const bundle = { channelReady, handlers };
    cache.set(topic, bundle);
    return bundle;
}
function getOrCreatePresenceHandle(getClient, gate, topic, cache) {
    const existing = cache.get(topic);
    if (existing)
        return existing;
    const syncCallbacks = [];
    // Deferred behind the gate like broadcast/subscribe channels. ``live`` is
    // the created-channel escape hatch for the synchronous ``list()``.
    let live = null;
    const channelReady = (async () => {
        await gate;
        const channel = getClient().channel(topic, { config: { presence: { key: '' } } });
        channel.on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState();
            for (const cb of syncCallbacks)
                cb(state);
        });
        live = channel;
        return channel;
    })();
    let subscribed = false;
    const ensureSubscribed = async () => {
        const channel = await channelReady;
        if (subscribed)
            return;
        await new Promise((resolve) => {
            channel.subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    subscribed = true;
                    resolve();
                }
            });
        });
    };
    const handle = {
        async track(state) {
            await ensureSubscribed();
            const channel = await channelReady;
            await channel.track(state);
        },
        onSync(callback) {
            syncCallbacks.push(callback);
        },
        async untrack() {
            const channel = await channelReady;
            await channel.untrack();
        },
        async unsubscribe() {
            const channel = await channelReady;
            await getClient().removeChannel(channel);
            subscribed = false;
            cache.delete(topic);
        },
        list() {
            // Empty until the gate opens and the channel exists — mirrors the
            // pre-SUBSCRIBED behaviour the eager implementation had.
            if (!live)
                return {};
            return live.presenceState();
        },
    };
    cache.set(topic, handle);
    return handle;
}
// Every query goes against exactly one schema, fixed for the lifetime of the
// client: the app's shard, or ``app_data`` when the deployment is unsharded.
// Isolation between apps is still per-table RLS on the JWT claims, never schema
// switching — the schema only selects which PostgREST behind Kong answers, so
// it is pinned once here rather than varied per call.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildSupabase(config) {
    const baseUrl = resolveSupabaseUrl(config.supabaseUrl, config.viewerToken);
    return createSupabaseClient(baseUrl, config.supabaseAnonKey, {
        db: { schema: schemaOf(config) },
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
        global: {
            headers: config.viewerToken
                ? { Authorization: `Bearer ${config.viewerToken}` }
                : undefined,
        },
    });
}
function resolveSupabaseUrl(rawUrl, viewerToken) {
    if (!rawUrl.startsWith('/'))
        return rawUrl;
    const origin = typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : '';
    const url = new URL(rawUrl, origin || 'http://localhost');
    if (viewerToken && url.pathname.includes('/supabase/realtime/')) {
        url.searchParams.set('viewer_token', viewerToken);
    }
    if (viewerToken && url.pathname.endsWith('/supabase')) {
        // Realtime websocket derivation inside supabase-js starts from the base URL.
        // Keep the token discoverable when it expands to /realtime/v1/websocket.
        url.searchParams.set('viewer_token', viewerToken);
    }
    return origin ? url.toString() : `${url.pathname}${url.search}`;
}
// Re-exports so existing imports of these helpers from ``@deepdiver-build/data``
// (and the SDK's own internal references) stay unchanged. Implementations
// live in ``./jwt-utils`` so they can be unit-tested without dragging in
// the supabase-js dependency.
export const parseSubClaim = _parseSubClaim;
export const tokenRemainingMs = _tokenRemainingMs;
//# sourceMappingURL=client.js.map