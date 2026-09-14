import type { DeepDiverConfig } from './types.js';
declare global {
    interface Window {
        __DEEPDIVER_CONFIG__?: DeepDiverConfig;
    }
}
export declare function normalizeConfig(cfg: DeepDiverConfig | null | undefined): DeepDiverConfig | null;
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
export declare function readConfigFromWindow(): DeepDiverConfig | null;
/**
 * Parse VITE_DEEPDIVER_* env vars into a config. Defaults to reading from
 * the runtime ``import.meta.env``; callers may pass an explicit ``env``
 * mapping (used by unit tests, since ``import.meta.env`` is frozen at
 * test-runner startup and cannot be mutated per-test).
 */
export declare function readConfigFromViteEnv(env?: Record<string, string | undefined>): DeepDiverConfig | null;
export declare function readConfigFromMetaTag(): DeepDiverConfig | null;
export declare function readConfigFromPreviewEndpointSync(): DeepDiverConfig | null;
/**
 * Async refresh of the viewer token from the MCP server. Called by the
 * client when the in-memory token is missing or within 5 min of expiring.
 *
 * Returns a ``DeepDiverConfig`` with a fresh ``viewerToken``, or ``null``
 * if the endpoint isn't reachable / Supabase isn't enabled on the server.
 */
export declare function fetchConfigFromServer(appId: string, auth?: {
    previewToken?: string;
    viewerLinkToken?: string;
    platformUserJwt?: string;
    renewToken?: string;
}): Promise<DeepDiverConfig | null>;
/**
 * Resolve the first available synchronous config source. Returns ``null``
 * when nothing matched — the caller typically follows up with
 * ``fetchConfigFromServer`` if an ``appId`` is discoverable elsewhere.
 */
export declare function resolveConfigSync(): DeepDiverConfig | null;
//# sourceMappingURL=config.d.ts.map