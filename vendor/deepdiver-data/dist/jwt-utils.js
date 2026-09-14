// Copyright (c) 2025 DeepDiver Team. All rights reserved.
//
// Tiny JWT helpers used by the SDK client for viewer-token introspection.
// Extracted into their own module so unit tests can import them without
// pulling in ``@supabase/supabase-js`` (a peer dep that is not necessarily
// available in the test environment).
//
// These helpers do **not** verify signatures — they only decode the public
// payload section. Verification happens on the server side; we just need
// to read ``sub`` and ``exp`` to drive UI display and refresh scheduling.
/**
 * Decode the ``sub`` claim from a JWT payload. Returns ``null`` for any
 * malformed input (wrong segment count, bad base64, non-JSON, no ``sub``,
 * or non-string ``sub``).
 */
export function parseSubClaim(jwt) {
    const parts = jwt.split('.');
    if (parts.length !== 3)
        return null;
    try {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        const sub = payload.sub;
        return typeof sub === 'string' ? sub : null;
    }
    catch {
        return null;
    }
}
/**
 * Milliseconds until ``exp`` (UNIX seconds) elapses. Returns 0 for any
 * malformed input — callers treat 0 as "needs refresh now".
 */
export function tokenRemainingMs(jwt) {
    const parts = jwt.split('.');
    if (parts.length !== 3)
        return 0;
    try {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (typeof payload.exp !== 'number')
            return 0;
        return payload.exp * 1000 - Date.now();
    }
    catch {
        return 0;
    }
}
//# sourceMappingURL=jwt-utils.js.map