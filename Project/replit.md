# TreeID

TreeID is an AI-assisted tree identification and health monitoring system for campus and community sustainability teams.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/treeid run dev` — run the TreeID web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 with an OpenAPI-first contract
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/treeid` — TreeID React + Vite web application
- `artifacts/api-server/src/lib/tree-data.ts` — demo repository, seed records, analysis fallback, dashboard and assistant logic
- `artifacts/api-server/src/routes` — API handlers
- `lib/api-spec/openapi.yaml` — source of truth for the REST contract
- `lib/db/src/schema/treeid.ts` — PostgreSQL/Drizzle schema

## Architecture decisions

- Demo mode is the default so the complete identification-to-monitoring flow works without a vision provider.
- AI output is structured and framed as an assisted visual assessment; concerning records always recommend physical inspection.
- The frontend uses generated React Query hooks from the OpenAPI contract rather than hand-written API types.
- The first build uses a memory-backed demo repository for reliable offline presentation while keeping a PostgreSQL schema ready for the persistent adapter.

## Product

Users can identify a tree, save a profile, add observations, compare historical images, explore campus health, search/filter records, and ask questions grounded in the current monitoring data.

## User preferences

The user asked for a complete working TreeID prototype with a calm, professional, nature-inspired product surface and explicit responsible-AI language.

## Gotchas

- Run API codegen after changing `lib/api-spec/openapi.yaml`.
- The web workflow supplies `PORT` and `BASE_PATH`; do not start the Vite app from the workspace root.
- Demo data is process-local and resets when the API workflow restarts.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
