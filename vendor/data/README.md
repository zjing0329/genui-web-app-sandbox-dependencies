# @openclaw-webapp-kit/data

A local Dexie/IndexedDB SDK replacing the role of `@deepdiver-build/data` in generated offline apps. It deliberately exposes typed Dexie tables rather than emulating Supabase query builders.

`createDatabase<Schema>({appId, versions})` creates an origin-local database named `webapp-kit:<appId>`. Define every record with a stable string `id`; the schema uses Dexie index syntax. `table(name)` returns the real typed Dexie table. `seedOnce(key, callback)` commits initial records and the seed marker in one transaction. `transaction(tables, callback)` commits related writes atomically. `open()` and `close()` manage the connection; `native` provides the explicit Dexie escape hatch. React reads use `useLiveQuery` from `@openclaw-webapp-kit/data/react`.

Create one instance in a module. Await initialization before rendering, surface storage failures, and preserve the appId and serving origin. Schema changes append a numbered version and optional upgrade callback; don't rename the database to bypass migration. Seeds never overwrite user changes or repopulate user-deleted content. IndexedDB can be cleared by the user/browser; no cross-device sync or cloud durability is promised.

This directory contains the compiled SDK and its runtime package metadata. Its TypeScript sources and build tests remain in the upstream development branch. The SDK does not need a separate build in this delivery repository. Generated projects receive their own `vendor/data` copy referenced by a relative `file:` dependency; no registry publication or repo symlink is required.

Primary references: [Dexie API](https://dexie.org/docs/API-Reference), [React live queries](https://dexie.org/docs/dexie-react-hooks/useLiveQuery%28%29).
