# TreeID

TreeID is an AI-assisted tree identification and health monitoring system for campus and community sustainability teams. It creates a digital profile for each tree, records observations over time, highlights visible signs that may need attention, and turns the monitoring history into practical next steps.

## Why it exists

Tree species are often recorded once and then forgotten. TreeID combines assisted visual identification, a living tree profile, historical observations, and data-grounded decision support so teams can monitor a shared landscape over time.

TreeID supports **SDG 15 — Life on Land** by making urban and campus biodiversity easier to observe, document, and care for.

## Features

- Drag-and-drop tree image upload with JPG, JPEG, PNG, and WebP validation
- Demo AI analysis with species, confidence, visible indicators, recommendations, and inspection guidance
- Tree profiles with location, monitoring status, current image, and observation count
- Historical observation timeline with status changes
- Before-and-after observation comparison with explicit visual-analysis limitations
- Dashboard statistics, species distribution, recent activity, search, filters, and sort
- Campus tree map visualization with health-colored markers
- Ask TreeID assistant grounded in current tree and observation records
- Responsible AI page covering fairness, transparency, privacy, safety, limitations, and human oversight
- RAG-ready knowledge document surface for future chunking, embeddings, and vector search

## Architecture

```text
React + Vite
  ↓ typed REST client generated from OpenAPI
Express API server
  ├── demo AI analysis service
  ├── tree and observation service
  ├── dashboard aggregation
  ├── comparison service
  └── record-grounded assistant
  ↓
PostgreSQL schema (Drizzle) + demo-mode seed repository
```

The workspace template uses Express and Drizzle rather than the Python/FastAPI stack in the original brief. The API contract remains framework-neutral and is generated into typed React Query hooks and Zod validators.

## Run locally

From the workspace root:

```bash
pnpm install
pnpm --filter @workspace/api-spec run codegen
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/treeid run dev
```

The managed workflows provide `PORT` and `BASE_PATH`. The API is available under `/api`.

## Environment variables

Copy `artifacts/treeid/.env.example` into your local environment:

- `DATABASE_URL` — PostgreSQL connection string for the Drizzle schema
- `GEMINI_API_KEY` — optional Gemini vision provider credential; omit it to use demo mode
- `AI_MODEL` — optional provider model name, defaulting to `gemini-2.5-flash`
- `DEMO_MODE=true` — keeps the application fully usable without a vision provider

The current first-build repository seeds a realistic in-memory demo repository on server start so the offline demonstration is immediate. The Drizzle schema in `lib/db/src/schema/treeid.ts` is ready for wiring the repository to PostgreSQL.

## AI workflow

The analysis response is structured JSON. It reports species and health as an **assisted visual assessment**. The application intentionally uses phrases such as “visible indicator,” “possible concern,” and “recommended for inspection”; it does not claim a definitive disease diagnosis.

When `GEMINI_API_KEY` is configured, the analyze endpoint sends the image to Gemini 2.5 Flash for real vision analysis. API keys are never hard-coded or returned to the browser. If the provider call fails, the response is explicitly marked as `demo` so the UI does not present fallback output as a real scan.

## Responsible AI

Performance may vary across species, image quality, lighting, occlusion, and environments. Confidence is shown to make uncertainty visible. Potential concerns should be verified by physical inspection by an appropriate facilities, horticulture, or arborist team.

## Limitations and future scope

- Demo records are memory-backed until the repository adapter is connected to PostgreSQL.
- Uploaded images are accepted and analyzed in demo mode; persistent object storage can be added behind the same image URL field.
- The knowledge base is RAG-ready but uses local documents today.
- Future work can add authenticated users, object storage, provider adapters, vector embeddings, and Leaflet/Mapbox tiles.
