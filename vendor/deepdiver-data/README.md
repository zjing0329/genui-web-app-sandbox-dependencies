# @deepdiver-build/data

Thin TypeScript wrapper around
[`@supabase/supabase-js`](https://supabase.com/docs/reference/javascript)
that auto-resolves per-workspace config for DeepDiver mini-apps. Published
to GitHub Packages so the fundamental-template (and every workspace cloned
from it) can `import { createClient } from '@deepdiver-build/data'` without
any explicit install step.

See `skills/data_layer/SKILL.md` for the agent-facing docs; this README
covers SDK maintenance (building, releasing, and consuming from the
template).

## Build

```bash
cd dev_env_module/deepdiver-data-sdk
pnpm install               # devDeps: typescript, esbuild, vitest (+jsdom), supabase-js
pnpm run build             # tsc (dist/ with d.ts) + esbuild (dist/browser/)
pnpm test                  # vitest unit suite
node scripts/smoke-browser-bundle.mjs   # after build: IIFE loads standalone
```

`dist/browser/` holds the **zero-build browser bundles** — single-file ESM
(`deepdiver-data.esm.js`) and IIFE (`deepdiver-data.global.js`, global name
`DeepDiverData`) with `@supabase/supabase-js` inlined (~200 KB minified each;
CI fails above 400 KB). They ship in the npm tarball at the same semver, get
baked into the sandbox image via the fundamental-template install, and are
vendored into every workspace as `vendor/deepdiver-data.*.js` at hydration so
plain-HTML apps can use the data layer without a bundler. For npm consumers
`@supabase/supabase-js` remains a peerDependency — never bundled in `dist/`.

## Release

The SDK is published to GitHub Packages under the `deepdiver-build` org.
A push of a tag matching `sdk-v*` triggers `.github/workflows/release-sdk.yml`,
which builds and publishes `@deepdiver-build/data` at the version pinned in
`package.json`.

```bash
# bump the version in package.json, then:
git tag sdk-v1.x.y
git push origin sdk-v1.x.y
```

## Consumption

`fundamental-template/package.json` lists `@deepdiver-build/data` as a
normal dependency:

```jsonc
{
  "dependencies": {
    "@deepdiver-build/data": "^1.0.0",
    "@supabase/supabase-js": "^2.49.0"
  }
}
```

The template's `.npmrc` routes the `@deepdiver-build` scope to
`https://npm.pkg.github.com` and reads `${GITHUB_PACKAGES_TOKEN}` for auth.
Workspaces cloned from the template via
`session.py:_clone_template_node_modules` inherit the SDK immediately —
no `pnpm add` needed inside the workspace.

To pick up a new release in the template:

```bash
cd ../fundamental-template
pnpm update @deepdiver-build/data
```

## File map

```
src/
  index.ts       # public exports
  client.ts      # createClient() — main entry point
  config.ts      # DeepDiverConfig resolution (window / Vite env / meta / REST)
  types.ts       # DeepDiverConfig, ChangeEvent, RLSMode
```

## Testing

No test harness yet — the SDK is thin enough that manual verification in a
real mini-app covers every path. If we outgrow that, add vitest + jsdom +
a mock of `window.__DEEPDIVER_CONFIG__` / `fetch`.
