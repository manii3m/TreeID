---
name: TreeID data layer
description: Why TreeID keeps a demo repository alongside its PostgreSQL schema.
---

TreeID keeps a deterministic, memory-backed demo repository as the default runtime path while the Drizzle PostgreSQL schema remains the persistence boundary for a future repository adapter.

**Why:** The product must be fully demonstrable without an AI provider or external setup, and demo records make the dashboard, history, comparison, map, and assistant immediately usable after a workflow restart.

**How to apply:** Preserve the structured API contract and the same record shapes when replacing the demo repository with PostgreSQL and object storage; keep demo mode available for offline presentations.

Image analysis requests use bounded data URLs in demo mode; keep the JSON body limit large enough for normal phone photos and never duplicate the base64 image inside the provider prompt.