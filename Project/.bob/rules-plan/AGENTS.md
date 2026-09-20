# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Non-obvious architectural constraints

- **No test suite.** There are no test files, no test runner, and no testing dependencies anywhere in the workspace. Plan accordingly — validation is typecheck + manual.
- **Single-file frontend.** All pages, components, and utilities live in `artifacts/treeid/src/App.tsx` by design. Adding separate page files (other than `not-found.tsx`) breaks from the established pattern.
- **API contract is the single source of truth.** `lib/api-spec/openapi.yaml` → codegen → `@workspace/api-zod` + `@workspace/api-client-react`. Any schema change must start in the YAML and flow through codegen; changing generated files directly causes drift.
- **Demo repository is the only persistence.** There is no database connection wired. The Drizzle schema exists but has no adapter. Plans involving "saving to the database" must either wire the adapter first or clearly scope to the demo store.
- **API server `dev` script always rebuilds** via esbuild before starting. Hot-reload is not available — every server-side change requires restarting the dev workflow.
- **`PORT` and `BASE_PATH` are hard requirements** injected by the Replit workflow. Any plan that runs the Vite dev server outside of Replit must explicitly provide these env vars.
- **Gemini is optional and fail-safe.** When `GEMINI_API_KEY` is absent or the call fails, the server falls back to `createDemoAnalysis()` silently. Plans that assume real AI output must confirm the key is configured and valid.
- **DB schema migrations are forward-only** (`pnpm --filter @workspace/db run push`). There is no rollback mechanism — plan schema changes carefully.
- **Orval codegen is tied to Zod v3.** Upgrading `zod` past v3 in any workspace package will break the generated validators until `orval.config.ts` is updated.
