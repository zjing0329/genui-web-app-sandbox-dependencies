import type { SupabaseClient } from '@supabase/supabase-js';
/**
 * The per-bucket API handle — everything ``@supabase/supabase-js``'s
 * ``storage.from(bucket)`` returns. Typed loosely because supabase-js exposes
 * this as an internal class; the public shape (upload, download, remove, list,
 * createSignedUrl, createSignedUploadUrl, getPublicUrl, etc.) is stable.
 */
export type StorageBucket = any;
export interface DeepDiverStorage {
    /**
     * Open the workspace's ``bucket`` for reads/writes. The SDK prepends the
     * ``app_<12hex>_`` prefix — you just pass the logical name you created
     * (e.g. ``'avatars'``, not ``'app_abc123_avatars'``).
     *
     * Returns the raw supabase-js StorageFileApi — upload, download, list,
     * remove, move, copy, createSignedUrl, createSignedUploadUrl,
     * getPublicUrl, etc. See supabase-js docs for full API.
     */
    from(bucket: string): StorageBucket;
}
/**
 * Build the storage namespace bound to one workspace. Accessor-based so the
 * namespace survives ``createClient``'s one-time config-adoption swap: both
 * the underlying supabase-js client and the app prefix are re-read on every
 * call instead of being captured at construction.
 */
export declare function createStorage(getClient: () => SupabaseClient, getPrefix: () => string): DeepDiverStorage;
//# sourceMappingURL=storage.d.ts.map