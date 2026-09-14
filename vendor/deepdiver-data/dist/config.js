// Copyright (c) 2025 DeepDiver Team. All rights reserved.
//
// Config resolution — assembles DeepDiverConfig from whichever source the
// host environment provides. Ordered so the most-specific / freshest source
// wins.
export function normalizeConfig(cfg) {
    if (!cfg || !cfg.supabaseUrl)
        return null;
    const appId = cfg.appId ?? cfg.workspaceId;
    if (!appId)
        return null;
    return {
        ...cfg,
        appId,
    };
}
/**
 * Source ordering (first hit wins):
 *
 *   1. ``window.__DEEPDIVER_CONFIG__`` — injected server-side into the HTML.
 *      Two producers, one per serving surface: the MCP server injects it into
 *      *published* ``/a/<app>/`` pages, and the client web-demo backend's
 *      preview proxy injects it into every ``/preview/<id>/…`` HTML response
 *      it proxies (it holds the persisted creator token server-side). Both
 *      ship a viewer token already scoped to the opener, so this source is
 *      complete and always wins. Also written token-less by the sandbox boot
 *      file (``vendor/deepdiver-data.boot.js``) on the *native* sandbox
 *      origin, guarded with ``||`` so an injected config stays authoritative.
 *
 *   2. ``import.meta.env.VITE_DEEPDIVER_*`` — Vite active dev mode reads
 *      these from ``<workspace>/.env.local`` (written by the MCP server
 *      during workspace creation). No JWT in this layer; the SDK does a
 *      REST fetch below to get one.
 *
 *   3. ``<meta name="deepdiver-config" content="base64-json">`` — fallback
 *      for HTML templates that can't run inline scripts (CSP-strict).
 *      Emits the same shape.
 *
 *   4. REST — sync probe + async refresh, whose target depends on the
 *      serving surface:
 *      * client web-demo proxy surface (path ``/preview/<id>/…``):
 *        ``__deepdiver_config__.json`` served by that proxy, which attaches
 *        the creator credential server-side. Live and load-bearing — do not
 *        remove the ``inferPreviewConfigUrl`` matching.
 *      * native sandbox origin root (Daytona port-forward) and published
 *        pages: same-origin ``/api/preview/<app>/config``. In native preview
 *        the browser holds no credential at all; the in-sandbox dev-server /
 *        static-server proxy authenticates the forwarded request with a
 *        sandbox-held bootstrap token, so the SDK sends it credential-less.
 *
 * Synchronous paths (1, 2, 3) give us enough to build the Supabase client
 * immediately; the async refresh keeps the viewer token valid over time.
 */
export function readConfigFromWindow() {
    if (typeof window === 'undefined')
        return null;
    const cfg = window.__DEEPDIVER_CONFIG__;
    return normalizeConfig(cfg);
}
/**
 * Parse VITE_DEEPDIVER_* env vars into a config. Defaults to reading from
 * the runtime ``import.meta.env``; callers may pass an explicit ``env``
 * mapping (used by unit tests, since ``import.meta.env`` is frozen at
 * test-runner startup and cannot be mutated per-test).
 */
export function readConfigFromViteEnv(env) {
    // ``import.meta.env`` only exists under Vite. Using ``as any`` because
    // the SDK is built with tsc (no Vite plugin), so we can't rely on the
    // vite/client types; mini-app consumers keep their own.
    const resolved = env ??
        (typeof import.meta !== 'undefined'
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                import.meta.env
            : undefined);
    if (!resolved)
        return null;
    const url = resolved.VITE_DEEPDIVER_SUPABASE_URL;
    const anonKey = resolved.VITE_DEEPDIVER_SUPABASE_ANON_KEY;
    const appId = resolved.VITE_DEEPDIVER_APP_ID ?? resolved.VITE_DEEPDIVER_WORKSPACE_ID;
    const appPrefix = resolved.VITE_DEEPDIVER_APP_PREFIX;
    if (!url || !appId)
        return null;
    return {
        supabaseUrl: url,
        supabaseAnonKey: anonKey || '',
        appId,
        appPrefix,
        // The app's shard schema. Omitting it on a sharded app makes every query
        // silently target the unsharded fallback (an empty schema), so servers
        // that know the shard write it into .env.local; older .env.local files
        // simply leave it undefined and the first config refresh adopts it.
        supabaseSchema: resolved.VITE_DEEPDIVER_SUPABASE_SCHEMA,
        viewerToken: undefined, // refreshed via REST
        previewToken: resolved.VITE_DEEPDIVER_PREVIEW_TOKEN,
        viewerLinkToken: resolved.VITE_DEEPDIVER_VIEWER_TOKEN,
        platformUserJwt: resolved.VITE_DEEPDIVER_PLATFORM_USER_JWT,
    };
}
export function readConfigFromMetaTag() {
    if (typeof document === 'undefined')
        return null;
    const meta = document.querySelector('meta[name="deepdiver-config"]');
    if (!meta)
        return null;
    const raw = meta.getAttribute('content');
    if (!raw)
        return null;
    try {
        const decoded = atob(raw);
        const parsed = JSON.parse(decoded);
        return normalizeConfig(parsed);
    }
    catch (err) {
        // Silent — mini-apps should not crash on a malformed meta tag.
        // eslint-disable-next-line no-console
        console.warn('[deepdiver/data] failed to parse meta[name=deepdiver-config]:', err);
    }
    return null;
}
function inferPreviewConfigUrl() {
    // Matches the client web-demo proxy surface only: that backend serves the
    // app under ``/preview/<id>/…`` and answers
    // ``/preview/<id>/__deepdiver_config__.json`` itself, attaching the
    // persisted creator credential server-side. On the native sandbox origin
    // (Daytona port-forward, app at ``/``) this never matches and callers fall
    // through to ``/api/preview/<app>/config`` — which is correct, because no
    // ``__deepdiver_config__.json`` route exists there.
    if (typeof window === 'undefined' || !window.location)
        return null;
    const pathname = window.location.pathname || '';
    const match = pathname.match(/^(.*\/(?:preview-static|preview)\/[^/]+)(?:\/.*)?$/);
    if (!match)
        return null;
    return `${match[1]}/__deepdiver_config__.json${window.location.search || ''}`;
}
export function readConfigFromPreviewEndpointSync() {
    if (typeof XMLHttpRequest === 'undefined')
        return null;
    const url = inferPreviewConfigUrl();
    if (!url)
        return null;
    try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send();
        if (xhr.status < 200 || xhr.status >= 300)
            return null;
        const parsed = JSON.parse(xhr.responseText);
        return normalizeConfig(parsed);
    }
    catch (err) {
        // Silent — this is a last-resort preview fallback. If it fails, callers
        // should see the normal "no config found" error with the expected sources.
    }
    return null;
}
/**
 * Async refresh of the viewer token from the MCP server. Called by the
 * client when the in-memory token is missing or within 5 min of expiring.
 *
 * Returns a ``DeepDiverConfig`` with a fresh ``viewerToken``, or ``null``
 * if the endpoint isn't reachable / Supabase isn't enabled on the server.
 */
export async function fetchConfigFromServer(appId, auth) {
    if (typeof fetch === 'undefined')
        return null;
    const sameOriginPreviewUrl = inferPreviewConfigUrl();
    const url = sameOriginPreviewUrl ?? `/api/preview/${encodeURIComponent(appId)}/config`;
    try {
        const headers = {};
        const params = new URLSearchParams();
        // Always offer the current token when we have one. On the published
        // ``/a/<app>/`` path it is the only credential in existence, and on the
        // preview path it rescues the case where the browser URL carries no query
        // credential (a same-origin config fetch would otherwise be rejected).
        if (auth?.renewToken) {
            headers.Authorization = `Bearer ${auth.renewToken}`;
        }
        if (sameOriginPreviewUrl) {
            // The preview endpoint already carries the browser's current query
            // credentials, and the backend can fall back to the creator token.
        }
        else if (auth?.previewToken) {
            params.set('token', auth.previewToken);
        }
        else if (auth?.viewerLinkToken) {
            params.set('viewer', auth.viewerLinkToken);
        }
        else if (auth?.platformUserJwt) {
            headers['X-Platform-JWT'] = auth.platformUserJwt;
        }
        // No client-side bail when the browser holds no credential at all. On the
        // native sandbox preview origin the request is deliberately credential-less:
        // it goes same-origin to the in-sandbox dev-server / static-server proxy,
        // which attaches the sandbox-held bootstrap token (X-Preview-Token,
        // typ=preview) before forwarding to the platform. Bailing here was the
        // reason preview refreshes never even reached HTTP.
        const query = params.toString(); // NOT URLSearchParams.size — Chrome 113+/Safari 17 only
        const fullUrl = query !== '' ? `${url}?${query}` : url;
        const resp = await fetch(fullUrl, {
            method: 'GET',
            credentials: 'same-origin',
            headers,
        });
        if (!resp.ok)
            return null;
        const body = (await resp.json());
        return normalizeConfig(body);
    }
    catch {
        return null;
    }
}
/**
 * Resolve the first available synchronous config source. Returns ``null``
 * when nothing matched — the caller typically follows up with
 * ``fetchConfigFromServer`` if an ``appId`` is discoverable elsewhere.
 */
export function resolveConfigSync() {
    return (readConfigFromWindow() ??
        readConfigFromViteEnv() ??
        readConfigFromMetaTag() ??
        readConfigFromPreviewEndpointSync() ??
        null);
}
//# sourceMappingURL=config.js.map