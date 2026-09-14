// Copyright (c) 2025 DeepDiver Team. All rights reserved.
//
// Pure-string helpers for the workspace prefix + PostgREST embed-grammar
// rewriter. Lives in its own file so unit tests can import it without
// pulling in ``@supabase/supabase-js``.
/**
 * Derive the ``app_<12hex>_`` physical-table prefix from an app id.
 *
 * Mirrors ``SupabaseService.app_prefix`` in Python: sha1(appId), lowercased,
 * then the first 12 hex chars. The SDK only uses this as a last-resort
 * fallback when the server didn't inject ``appPrefix`` explicitly.
 */
export function appPrefixFromId(appId) {
    let h0 = 0x67452301;
    let h1 = 0xefcdab89;
    let h2 = 0x98badcfe;
    let h3 = 0x10325476;
    let h4 = 0xc3d2e1f0;
    const bytes = new TextEncoder().encode(appId);
    const bitLen = bytes.length * 8;
    const withPadding = new Uint8Array((((bytes.length + 9 + 63) >> 6) << 6));
    withPadding.set(bytes);
    withPadding[bytes.length] = 0x80;
    const view = new DataView(withPadding.buffer);
    view.setUint32(withPadding.length - 4, bitLen >>> 0, false);
    const words = new Uint32Array(80);
    for (let offset = 0; offset < withPadding.length; offset += 64) {
        for (let i = 0; i < 16; i += 1) {
            words[i] = view.getUint32(offset + i * 4, false);
        }
        for (let i = 16; i < 80; i += 1) {
            const value = words[i - 3] ^ words[i - 8] ^ words[i - 14] ^ words[i - 16];
            words[i] = ((value << 1) | (value >>> 31)) >>> 0;
        }
        let a = h0;
        let b = h1;
        let c = h2;
        let d = h3;
        let e = h4;
        for (let i = 0; i < 80; i += 1) {
            let f = 0;
            let k = 0;
            if (i < 20) {
                f = (b & c) | (~b & d);
                k = 0x5a827999;
            }
            else if (i < 40) {
                f = b ^ c ^ d;
                k = 0x6ed9eba1;
            }
            else if (i < 60) {
                f = (b & c) | (b & d) | (c & d);
                k = 0x8f1bbcdc;
            }
            else {
                f = b ^ c ^ d;
                k = 0xca62c1d6;
            }
            const temp = ((((a << 5) | (a >>> 27)) >>> 0) + f + e + k + words[i]) >>> 0;
            e = d;
            d = c;
            c = ((b << 30) | (b >>> 2)) >>> 0;
            b = a;
            a = temp;
        }
        h0 = (h0 + a) >>> 0;
        h1 = (h1 + b) >>> 0;
        h2 = (h2 + c) >>> 0;
        h3 = (h3 + d) >>> 0;
        h4 = (h4 + e) >>> 0;
    }
    const hex = [h0, h1, h2, h3, h4]
        .map((n) => n.toString(16).padStart(8, '0'))
        .join('');
    return `app_${hex.slice(0, 12)}_`;
}
/**
 * Rewrite PostgREST embed grammar in a ``select()`` columns string so bare
 * relation references like ``moment_assets(*)`` become
 * ``app_<hex>_moment_assets(*)``. Also rewrites the target of the aliased
 * form — ``author:profiles!user_id(*)`` → ``author:app_<hex>_profiles!user_id(*)`` —
 * since PostgREST always expects a real table name on the right of ``:``.
 *
 * Exported for unit tests; mini-app code should not call this directly.
 */
export function rewriteSelectEmbeds(columns, prefix) {
    // Match: boundary (start / whitespace / ``,`` / ``(`` / ``:``), identifier,
    // optional ``!fk_hint``, optional whitespace, and ``(`` — i.e. anything that
    // looks like a PostgREST embed target. The boundary is a *lookbehind* so
    // adjacent nested embeds like ``posts(comments(*))`` both match — a capturing
    // group would consume the ``(`` and starve the next iteration.
    return columns.replace(/(?<=^|[\s,(:])([a-z_][a-z0-9_]*)(![a-z_][a-z0-9_]*)?(\s*\()/g, (match, ident, fkHint, paren) => {
        if (ident.startsWith(prefix))
            return match;
        return `${prefix}${ident}${fkHint ?? ''}${paren}`;
    });
}
/**
 * Patch ``.select()`` on a PostgREST builder so its columns string goes
 * through ``rewriteSelectEmbeds``. Applied to the query builder returned by
 * ``supabase.from()`` AND to the builders returned by its ``insert`` /
 * ``upsert`` / ``update`` / ``delete`` — supabase-js hands back a *different*
 * object there (a PostgrestFilterBuilder), whose own ``.select()`` (the
 * ``return=representation`` column list) would otherwise bypass the rewrite
 * and send unprefixed embeds like ``*, profiles(*)`` to PostgREST (PGRST200).
 *
 * Exported for unit tests; mini-app code should not call this directly.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function wrapBuilderSelects(qb, prefix) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wrapSelect = (builder) => {
        if (typeof builder?.select !== 'function')
            return builder;
        const origSelect = builder.select.bind(builder);
        builder.select = (columns, options) => {
            const rewritten = typeof columns === 'string' ? rewriteSelectEmbeds(columns, prefix) : columns;
            return origSelect(rewritten, options);
        };
        return builder;
    };
    wrapSelect(qb);
    for (const method of ['insert', 'upsert', 'update', 'delete']) {
        if (typeof qb[method] !== 'function')
            continue;
        const orig = qb[method].bind(qb);
        qb[method] = (...args) => wrapSelect(orig(...args));
    }
    return qb;
}
//# sourceMappingURL=rewrite.js.map