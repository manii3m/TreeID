# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Non-obvious coding rules

### API server
- All routes validate with `.safeParse()` from `@workspace/api-zod` and return `400` on failure — never cast `req.body` directly.
- The API server is bundled by esbuild into a single ESM file (`dist/index.mjs`). Native/dynamic modules that can't be bundled must be added to the `external` list in `artifacts/api-server/build.mjs`, not imported normally.
- Pino logging is handled via `esbuild-plugin-pino` — do not replace with `console.log`. Use `req.log` inside route handlers (injected by `pino-http`).
- When adding a new route file, register it in `artifacts/api-server/src/routes/index.ts` with `router.use(...)`.

### Generated code — never edit directly
- `lib/api-client-react/src/generated/` and `lib/api-zod/src/generated/` are overwritten by `pnpm --filter @workspace/api-spec run codegen`. Only edit `lib/api-spec/openapi.yaml` and run codegen.
- Orval is pinned to **Zod v3** syntax (`version: 3` in `lib/api-spec/orval.config.ts`). The workspace uses `zod ^3.x` from the catalog; do not upgrade to v4.

### Frontend
- The entire frontend is one file (`artifacts/treeid/src/App.tsx`). Add new pages as inline functions in that file, not as separate page files (only `not-found.tsx` is external).
- Use `queryClient.invalidateQueries({ queryKey: get<X>QueryKey(...) })` after mutations to refresh dependent views — all query key helpers are exported from `@workspace/api-client-react`.
- `cn()` is defined locally in `App.tsx` (a simple filter-join, not `clsx`/`tailwind-merge`). Do not import from `lib/utils`.
- `@/` alias → `artifacts/treeid/src/`; `@assets/` alias → `attached_assets/` at workspace root.

### Data layer
- The demo repository (`artifacts/api-server/src/lib/tree-data.ts`) exports mutable arrays (`trees`, `observations`). Mutations operate directly on these arrays with `unshift`/`splice` — no ORM or async involved.
- `makeDashboardStats()` and `answerAssistant()` compute results live from those arrays every request; there is no cache.
- When wiring PostgreSQL, replace only the repository functions (`getTree`, `addTree`, `addObservation`, etc.) — keep the same return shapes to avoid breaking the API contract.
