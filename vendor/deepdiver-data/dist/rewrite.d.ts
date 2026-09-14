/**
 * Derive the ``app_<12hex>_`` physical-table prefix from an app id.
 *
 * Mirrors ``SupabaseService.app_prefix`` in Python: sha1(appId), lowercased,
 * then the first 12 hex chars. The SDK only uses this as a last-resort
 * fallback when the server didn't inject ``appPrefix`` explicitly.
 */
export declare function appPrefixFromId(appId: string): string;
/**
 * Rewrite PostgREST embed grammar in a ``select()`` columns string so bare
 * relation references like ``moment_assets(*)`` become
 * ``app_<hex>_moment_assets(*)``. Also rewrites the target of the aliased
 * form — ``author:profiles!user_id(*)`` → ``author:app_<hex>_profiles!user_id(*)`` —
 * since PostgREST always expects a real table name on the right of ``:``.
 *
 * Exported for unit tests; mini-app code should not call this directly.
 */
export declare function rewriteSelectEmbeds(columns: string, prefix: string): string;
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
export declare function wrapBuilderSelects(qb: any, prefix: string): any;
//# sourceMappingURL=rewrite.d.ts.map