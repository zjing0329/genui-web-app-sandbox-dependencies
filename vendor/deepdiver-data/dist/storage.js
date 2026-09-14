// Copyright (c) 2025 DeepDiver Team. All rights reserved.
//
// Storage namespace — thin wrapper around ``supabase.storage`` that prepends
// the workspace's ``app_<12hex>_`` prefix to every bucket name, so mini-app
// code writes ``db.storage.from('avatars')`` without knowing the physical
// bucket id. Mirrors how ``db.from('profiles')`` transparently prefixes
// table names in client.ts.
//
// We intentionally DO NOT wrap the per-file surface (upload, download,
// createSignedUrl, …). Supabase's StorageFileApi changes across versions and
// wrapping every method forces us to chase its upstream; returning
// ``supabase.storage.from(physical)`` directly gives mini-apps the full
// StorageFileApi without a wrapper layer to debug.
/**
 * Build the storage namespace bound to one workspace. Accessor-based so the
 * namespace survives ``createClient``'s one-time config-adoption swap: both
 * the underlying supabase-js client and the app prefix are re-read on every
 * call instead of being captured at construction.
 */
export function createStorage(getClient, getPrefix) {
    return {
        from(bucket) {
            return getClient().storage.from(`${getPrefix()}${bucket}`);
        },
    };
}
//# sourceMappingURL=storage.js.map