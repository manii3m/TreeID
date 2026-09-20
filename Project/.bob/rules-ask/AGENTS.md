# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Non-obvious documentation context

- **`artifacts/mockup-sandbox/`** is a Replit-only UI component preview harness, not part of the shipping app. Its `mockup-components.ts` registry is empty. Ignore it when answering questions about the product.
- **`lib/api-client-react/src/custom-fetch.ts`** is the only hand-authored file in that package. It is the canonical reference for how API errors (`ApiError`) and auth tokens work client-side — the generated hooks delegate to it.
- **`lib/db/src/schema/treeid.ts`** defines the *intended* PostgreSQL schema but is not connected to the running app. The live data source is the in-memory arrays in `artifacts/api-server/src/lib/tree-data.ts`.
- **`replit.md`** and **`artifacts/treeid/README.md`** are the primary human-facing docs. They are accurate about architecture and gotchas.
- **`scripts/src/hello.ts`** is an empty scaffold placeholder (`console.log("Hello from @workspace/scripts")`). It has no functional purpose.
- The **assistant** (`/assistant` route + `answerAssistant()`) uses keyword matching, not a real LLM or RAG pipeline — it is not backed by Gemini or any vector store.
- **Gemini vision** is only invoked when `GEMINI_API_KEY` is set. All other paths use `createDemoAnalysis()`, which always returns a hardcoded Neem tree result.
