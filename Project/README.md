# 🌿 TreeID

**AI-assisted tree identification and health monitoring for campus and community sustainability teams.**

TreeID gives field teams a clear, defensible view of urban canopy health — one observation at a time. Upload a photo, get an assisted visual assessment, build a living profile, and track change over time.

> Supports **SDG 15 — Life on Land** by making urban and campus biodiversity easier to observe, document, and care for.

---

## Features

| Feature | Description |
|---|---|
| **Tree identification** | Drag-and-drop image upload with AI-assisted species recognition (JPG, PNG, WebP) |
| **Health assessment** | Structured analysis of visible indicators, potential concerns, and confidence scores |
| **Tree profiles** | Per-tree records with location, monitoring status, observation count, and image history |
| **Observation timeline** | Chronological field log with status changes across visits |
| **Before & after comparison** | Side-by-side observation diff with explicit visual-analysis limitations |
| **Dashboard** | Inventory statistics, species distribution, field activity chart, search, filters, sort |
| **Campus tree map** | Spatial view with health-coloured markers derived from real coordinates |
| **Ask TreeID** | Assistant grounded in current tree and observation records |
| **Responsible AI page** | Transparency, fairness, privacy, human oversight, limitations |
| **Knowledge base** | Sustainability reference documents (RAG-ready surface) |

---

## Architecture

```
artifacts/treeid          React 19 + Vite 7 + Tailwind CSS 4 + wouter
  ↓ typed React Query hooks (generated from OpenAPI)
artifacts/api-server      Express 5 + pino logging
  ├── POST /api/trees/analyze    ← Gemini 2.5 Flash vision (or demo fallback)
  ├── CRUD /api/trees            ← tree profiles & observations
  ├── GET  /api/dashboard/stats  ← aggregated inventory view
  ├── POST /api/assistant        ← record-grounded Q&A
  └── GET  /api/knowledge        ← sustainability knowledge documents
  ↓
lib/db (Drizzle + PostgreSQL schema — demo mode uses in-memory repository)
```

### Workspace packages

| Package | Path | Role |
|---|---|---|
| `@workspace/treeid` | `artifacts/treeid` | React frontend |
| `@workspace/api-server` | `artifacts/api-server` | Express REST API |
| `@workspace/api-client-react` | `lib/api-client-react` | Generated React Query hooks |
| `@workspace/api-zod` | `lib/api-zod` | Generated Zod validators & TypeScript types |
| `@workspace/db` | `lib/db` | Drizzle ORM PostgreSQL schema |
| `@workspace/api-spec` | `lib/api-spec` | OpenAPI source of truth + Orval codegen config |

---

## Getting started

### Prerequisites

- **Node.js 24+**
- **pnpm 9+**

### Install

```bash
pnpm install
```

### Environment variables

Copy the example and fill in your values:

```bash
cp artifacts/treeid/.env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | For PostgreSQL | Postgres connection string for Drizzle |
| `GEMINI_API_KEY` | Optional | Enables real Gemini 2.5 Flash vision analysis |
| `AI_MODEL` | Optional | Override model name (default: `gemini-2.5-flash`) |
| `DEMO_MODE` | Optional | Set `true` to force demo mode even with a key |
| `PORT` | **Required for frontend** | Port for the Vite dev server |
| `BASE_PATH` | **Required for frontend** | Base URL path for Vite (e.g. `/`) |

> **Demo mode is the default.** The app is fully functional without a Gemini key or database — it seeds realistic in-memory records on startup and falls back gracefully on every failure path.

### Run locally

```bash
# 1. Start the API server (rebuilds on each run via esbuild)
pnpm --filter @workspace/api-server run dev

# 2. Start the frontend (in a separate terminal)
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/treeid run dev
```

The API is available at `http://localhost:3000/api`.  
The frontend is available at `http://localhost:5173`.

### Build for production

```bash
pnpm run build          # typecheck + build all packages
```

---

## Development

### Commands

| Command | What it does |
|---|---|
| `pnpm run typecheck` | Full TypeScript check across all packages |
| `pnpm run build` | Typecheck + build all packages |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate React Query hooks and Zod validators from `lib/api-spec/openapi.yaml` |
| `pnpm --filter @workspace/db run push` | Push Drizzle schema changes to PostgreSQL (dev only, forward-only) |

### Changing the API contract

The API contract lives in **`lib/api-spec/openapi.yaml`** and is the single source of truth. After any change:

```bash
pnpm --filter @workspace/api-spec run codegen
```

This regenerates `lib/api-client-react/src/generated/` and `lib/api-zod/src/generated/`. **Never edit generated files directly** — they will be overwritten.

### Project structure (frontend)

```
artifacts/treeid/src/
├── App.tsx              # Entire application — all pages live as inline functions here
├── pages/
│   └── not-found.tsx
├── components/
│   ├── error-boundary.tsx
│   └── ui/              # shadcn/ui component library (Radix UI + Tailwind)
├── hooks/
│   ├── use-toast.ts
│   └── use-mobile.tsx
├── lib/
│   └── utils.ts
├── index.css            # Tailwind v4 theme — nature-inspired palette (DM Sans, Fraunces, DM Mono)
└── main.tsx
```

### Project structure (API server)

```
artifacts/api-server/src/
├── app.ts               # Express app setup, CORS, pino-http, 8 MB JSON limit
├── index.ts             # Server entry point
├── routes/
│   ├── trees.ts         # Tree CRUD, image analysis, observations, comparison
│   ├── dashboard.ts     # Aggregated stats
│   ├── assistant.ts     # Q&A endpoint
│   ├── knowledge.ts     # Knowledge documents
│   └── health.ts        # GET /healthz
└── lib/
    ├── tree-data.ts     # In-memory demo repository + all business logic
    └── gemini.ts        # Gemini 2.5 Flash vision provider
```

---

## AI workflow

```
User uploads image
       ↓
POST /api/trees/analyze
       ↓
GEMINI_API_KEY set? ──yes──→ Gemini 2.5 Flash (30s timeout)
       │                           ↓
       no              Structured JSON (species, health, confidence,
       │               visible indicators, concerns, recommendations)
       ↓                           ↓
createDemoAnalysis()    provider call failed?
       ↓                     ↓ yes
Demo result ←────────────────┘
(mode: "demo")         (mode: "provider")
       ↓
Review signal in UI → Save tree profile
```

Analysis output is always framed as an **assisted visual assessment**, never a definitive diagnosis. Concerning results always recommend physical inspection. API keys are never returned to the browser.

---

## Health status levels

| Status | Meaning |
|---|---|
| ✅ **Healthy** | No visible concerns in the current observation |
| 🟡 **Needs Monitoring** | Minor visible changes — revisit recommended |
| 🟠 **Potential Concern** | Noticeable visible indicators — closer observation needed |
| 🔴 **Inspection Recommended** | Physical inspection by a qualified person is warranted |

---

## REST API reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/healthz` | Health check |
| `GET` | `/api/trees` | List trees (search, healthStatus, species, sort) |
| `POST` | `/api/trees` | Create a tree profile |
| `GET` | `/api/trees/:id` | Get a tree profile |
| `PATCH` | `/api/trees/:id` | Update a tree profile |
| `DELETE` | `/api/trees/:id` | Delete a tree profile |
| `POST` | `/api/trees/analyze` | Analyze an uploaded image |
| `POST` | `/api/trees/compare` | Compare two observations |
| `GET` | `/api/trees/:id/observations` | List observations for a tree |
| `POST` | `/api/trees/:id/observations` | Add an observation |
| `GET` | `/api/dashboard/stats` | Dashboard statistics |
| `POST` | `/api/assistant` | Ask a record-grounded question |
| `GET` | `/api/knowledge` | List knowledge documents |

Full schema: [`lib/api-spec/openapi.yaml`](lib/api-spec/openapi.yaml)

---

## Responsible AI

TreeID is designed around the principle that **AI output is a prompt for human review, not an automated decision**.

- **Transparency** — every analysis includes its mode (`demo` / `provider`), confidence score, visible indicators, and explicit limitations.
- **Uncertainty is visible** — confidence values are always shown so teams know when to inspect.
- **No definitive diagnosis** — the app uses language like "visible indicator", "possible concern", and "recommended for inspection".
- **Human oversight** — inspection recommendations must be confirmed in person by a qualified facilities, horticulture, or arborist team.
- **Privacy by design** — TreeID is built around tree records, not people.

---

## Limitations & future scope

- Demo records are memory-backed and reset on server restart. The Drizzle schema in `lib/db/src/schema/treeid.ts` is ready for a PostgreSQL repository adapter.
- The knowledge base uses local documents today. It is structured for RAG (chunking, embeddings, vector search).
- Image uploads are accepted and analyzed in demo mode; persistent object storage can be added behind the same `imageUrl` field.
- Future work: authenticated users, real map tiles (Leaflet/Mapbox), object storage, vector embeddings, scheduling/alerting, CSV export, and multi-provider AI adapters.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 4, wouter, TanStack Query v5 |
| UI components | shadcn/ui (Radix UI primitives) |
| API | Express 5, OpenAPI 3.1, pino |
| Validation | Zod v3, drizzle-zod |
| Codegen | Orval (OpenAPI → React Query hooks + Zod validators) |
| Database | PostgreSQL, Drizzle ORM |
| AI | Google Gemini 2.5 Flash (optional) |
| Build | esbuild (API), Vite (frontend) |
| Package manager | pnpm workspaces, Node.js 24, TypeScript 5.9 |

---

<p align="center">
  <sub>TreeID · v0.4.2 · MIT License</sub>
</p>
