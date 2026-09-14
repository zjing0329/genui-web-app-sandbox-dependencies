# Bundled SDK packages

These are complete, prebuilt local packages used by the scaffold's `file:`
dependencies. Keep this directory alongside `package.json`, the lockfile, and
`node_modules` when delivering the scaffold. Installing these packages does not
require GitHub Packages credentials or a build step in the task sandbox.

| Directory | Package and version | Purpose | Source |
| --- | --- | --- | --- |
| `deepdiver-data` | `@deepdiver-build/data@1.3.0` | DeepDiver workspace configuration and Supabase data, storage, and sharing APIs | `deepdiver-server/dev_env_module/deepdiver-data-sdk` |
| `ascf-web-sdk` | `@deepdiver-build/ascf-web-sdk@1.0.0` | HarmonyOS atomic service container APIs; installed under the existing `@atomicservice/ascf-web-sdk` import name | `deepdiver-server/dev_env_module/ascf-web-sdk` |
| `data` | `@openclaw-webapp-kit/data@0.1.0` | Browser-local IndexedDB persistence through Dexie, including React hooks | `openclaw-webapp-kit/sandbox-image-deps/vendor/data` |

The two data SDKs provide different storage models and APIs. They are separate
packages and must not be substituted for one another or aliased to the same
implementation. The ASCF package retains its actual package name in its own
metadata; the scaffold's dependency key preserves the established import name.

Only package metadata, built `dist` assets, upstream README files, and available
license files are included. Consumer manifests are marked private and omit
development dependencies, lifecycle/build scripts, and publishing configuration.
Runtime dependencies, peer dependencies, entry points, and exports are preserved.
No `.npmrc`, credentials, source checkout, or nested `node_modules` is included.

## Provenance and validation

Prepared on 2026-09-14 from the local source checkouts. The DeepDiver checkout was
based on `e8dcfad7828cea75076d1b6be74e4746dfc75ee5`; the OpenClaw kit checkout was
based on `c9af087a2286f3b98f05606aac0e69e9ad743494`.

`deepdiver-data/dist` was generated from its real TypeScript source in an isolated
temporary directory, using the source package's public development dependencies.
Installation disabled lifecycle scripts; the original build was then run
explicitly. The build used Node 26.0.0, TypeScript 5.9.3, esbuild 0.25.12, and
`@supabase/supabase-js` 2.116.0. Its JavaScript and type declaration outputs are
platform independent; no native build dependencies are included here.

Validation completed before copying the generated assets:

- `npm run build`: TypeScript declarations, ESM browser bundle, and IIFE browser
  bundle all generated successfully.
- `npm test`: all 60 tests across the SDK's three existing test files passed,
  using Vitest 3.2.7 and jsdom 26.1.0.
- `node scripts/smoke-browser-bundle.mjs`: the standalone browser bundle loaded,
  exposed the SDK API, and reported the expected missing-configuration error.
- `npm pack --dry-run --json --ignore-scripts`: succeeded for all three vendored
  packages and included their actual entry points and assets.

The ASCF and OpenClaw `dist` files were copied unchanged from the source paths
listed above. The data SDK's browser bundles include Supabase; its regular module
entry retains the upstream Supabase peer dependency. OpenClaw data retains its
Dexie dependencies and React peer dependency, which the scaffold install resolves.

To update a package, rebuild or obtain its real upstream distribution, replace
the corresponding directory, and regenerate the scaffold lockfile and installed
dependencies. Remove consumer-side lifecycle scripts and publishing configuration
again, retain runtime metadata, and repeat build/import checks. The package-level
README files describe upstream development and publishing workflows; use this
local vendoring workflow for the scaffold.
