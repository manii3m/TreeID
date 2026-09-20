# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Monorepo structure

| Package | Path | Purpose |
|---|---|---|
| `@workspace/treeid` | `artifacts/treeid` | React + Vite frontend |
| `@workspace/api-server` | `artifacts/api-server` | Express 5 API server |
| `@workspace/api-client-react` | `lib/api-client-react` | Generated React Query hooks (do not hand-edit) |
| `@workspace/api-zod` | `lib/api-zod` | Generated Zod validators + TypeScript types (do not hand-edit) |
| `@workspace/db` | `lib/db` | Drizzle PostgreSQL schema |

## Essential commands

```bash
# Run everything
pnpm --filter @workspace/api-server run dev   # builds then starts API
pnpm --filter @workspace/treeid run dev        # Vite frontend

# After changing lib/api-spec/openapi.yaml — MUST re-run or types will be stale
pnpm --filter @workspace/api-spec run codegen

# Full typecheck across all packages
pnpm run typecheck

# Push DB schema changes (dev only, no rollback — forward-only)
pnpm --filter @workspace/db run push
```

## Critical gotchas

- **`PORT` and `BASE_PATH` env vars are required** by `artifacts/treeid/vite.config.ts` — Vite throws at startup without them. These are injected by the Replit workflow; set them manually for local dev.
- **API server `dev` script rebuilds before starting** (`esbuild` → `dist/`). The `start` script runs the dist directly — always use `dev` during development.
- **Orval codegen is pinned to Zod v3** (`version: 3` in `lib/api-spec/orval.config.ts`). The workspace catalog installs `zod ^3.x` — do not upgrade to Zod v4 in any package without updating orval config.
- **`@workspace/api-client-react` and `@workspace/api-zod` are fully generated** from `lib/api-spec/openapi.yaml`. Any manual edits to `src/generated/` will be overwritten by the next codegen run. The only safe customisation point is `lib/api-client-react/src/custom-fetch.ts`.
- **Demo data is process-local** — it resets on every API server restart. The Drizzle schema in `lib/db/src/schema/treeid.ts` is wired but no repository adapter connects it to the demo in-memory store yet.
- **Image uploads are base64 data URLs** sent in JSON. The API body limit is `8mb` (`app.ts`). Keep images under ~6 MB raw (encodes to ~8 MB base64).
- **No test suite exists yet** — there are no test files or test runner configured anywhere in the workspace.

## API contract

All route validation uses Zod schemas from `@workspace/api-zod` (e.g. `ListTreesQueryParams`, `CreateTreeBody`). Never add ad-hoc `req.body` casting in routes — always `.safeParse()` first and return `400` on failure.

## Frontend patterns

- All API calls use generated React Query hooks from `@workspace/api-client-react`. Import hooks, types, and query-key helpers from that package — do not write manual `fetch` calls.
- Routing uses **wouter**, not React Router.
- The entire app lives in a single file: `artifacts/treeid/src/App.tsx`. Pages are inline functions, not separate files (except `pages/not-found.tsx`).
- UI path alias `@/` resolves to `artifacts/treeid/src/`. Asset alias `@assets/` resolves to `attached_assets/` at the workspace root.
