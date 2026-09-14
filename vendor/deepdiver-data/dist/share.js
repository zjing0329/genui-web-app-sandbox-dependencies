// Copyright (c) 2025 DeepDiver Team. All rights reserved.
//
// External share links — ``db.share.create(...)``.
//
// Share links are a sibling primitive to viewer links: anonymous,
// scope-restricted, and explicitly NOT consuming a viewer seat. They're
// meant for giving people *outside* the workspace's 16 viewers a URL to
// download / view one specific resource. See
// ``skills/data_layer/data/reference/share_sdk_api.md`` for usage and
// ``docs/share-links.md`` for the HTTP contract.
//
// The factory here just wraps the POST /mint endpoint. Resolution happens
// server-side — share URLs are consumed by browsers, not by app code, so
// there's no ``get(code)`` method on the client.
/**
 * Build a ``DeepDiverShare`` that POSTs to ``{shareApiUrl}/mint`` with
 * ``Authorization: Bearer <viewerToken>``. The token is required — the
 * server will 401 if it's missing. We surface that as a local throw when
 * we can see ahead of time that there's no token, to save a round-trip.
 */
export function createShare(opts) {
    return {
        async create(req) {
            const token = opts.getToken();
            if (!token) {
                throw new Error('[deepdiver/data] db.share.create requires a viewer token — none loaded yet. ' +
                    'Await db.currentProfile() (or any DB query) before calling share.create.');
            }
            const mintUrl = `${opts.getShareApiUrl().replace(/\/$/, '')}/mint`;
            let resp;
            try {
                resp = await fetch(mintUrl, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(req),
                });
            }
            catch (err) {
                throw new Error(`[deepdiver/data] db.share.create network error: ${err.message}`);
            }
            if (!resp.ok) {
                let detail = `HTTP ${resp.status}`;
                try {
                    const body = await resp.json();
                    if (body && typeof body === 'object' && typeof body.error === 'string') {
                        detail = body.error;
                    }
                }
                catch {
                    /* ignore JSON parse errors — keep the HTTP-status fallback */
                }
                throw new Error(`[deepdiver/data] db.share.create failed (${resp.status}): ${detail}`);
            }
            const raw = (await resp.json());
            // The server returns a path-only ``share_url`` (e.g.
            // ``/preview/<ws>/?share=<code>``). Absolutize it against the page
            // origin — which is the *only* reliable source of truth for the
            // public host. Request-header inference on the server breaks when
            // the request path routes through an httpx proxy that doesn't
            // preserve Host / X-Forwarded-*.
            const toAbsolute = (url) => {
                if (/^https?:/i.test(url))
                    return url; // already absolute
                if (typeof window === 'undefined' || !window.location)
                    return url;
                if (url.startsWith('/'))
                    return `${window.location.origin}${url}`;
                return url;
            };
            return { ...raw, share_url: toAbsolute(raw.share_url) };
        },
    };
}
//# sourceMappingURL=share.js.map