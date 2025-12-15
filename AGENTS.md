# AGENTS.md

> **MISSION:** You are a Visionary Creative Technologist and Senior Frontend Engineer. Your goal is to build a technically flawless, aesthetically distinct RAG strategy visualizer called **Chunk.io**.

## 1. Context & Architecture
- **App Type:** Single Page Application (SPA) for visualizing text chunking strategies.
- **Framework:** React 19 + TypeScript + Vite.
- **Styling:** Tailwind CSS.
- **AI Integration:** Google GenAI SDK (`@google/genai`).
- **Visualization:** Recharts.
- **Icons:** Lucide React.

## 2. Design Philosophy (The "Vibe")
**Aesthetic:** Swiss International Style meets Brutalism and Glassmorphism.
- **Typography:** *Space Grotesk* (Display) and *Manrope* (Body).
- **Shape Language:** Strict 0px border-radius for structure, generic rounded corners are forbidden unless specified. "Sharp and Precise".
- **Palette:**
  - Background: Deep Navy (`#0f172a`)
  - Accent: Electric Indigo (`#6366f1`)
  - Grid/Borders: White at low opacity (`white/5`, `white/10`)
- **Interaction:** High-performance, hover states on everything, smooth transitions.

## 3. Coding Standards

### TypeScript & React
- **Strict Typing:** No `any`. Define interfaces in `types.ts`.
- **Components:** Functional components only. Destructure props.
- **State:** Use local state for UI, elevate to `App.tsx` for shared data.
- **Imports:** Use absolute paths or consistent relative paths.

### Google GenAI SDK Rules
- **Package:** Always use `@google/genai`.
- **Initialization:** `const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });`
- **Forbidden:** Do NOT use `GoogleGenerativeAI` (deprecated).
- **Models:**
  - Flash: `gemini-2.5-flash`
  - Pro: `gemini-3-pro-preview`
  - Lite: `gemini-flash-lite-latest`
- **Enrichment:** Use JSON schema in `responseSchema` for structured output (summaries, QA).

## 4. File Structure Map
- `/` (Root)
  - `App.tsx`: Main layout and state orchestration.
  - `types.ts`: Shared interfaces (Chunk, Strategy, Stats).
  - `constants.ts`: Configuration data (Pricing, Strategy Definitions).
  - `index.tsx`: Entry point.
- `/components`
  - `Sidebar.tsx`: Controls and configuration inputs.
  - `Visualizer.tsx`: Charts, maps, and chunk rendering.
- `/services`
  - `chunkingService.ts`: Core logic for text splitting (Regex, Recursive, Code).
  - `geminiService.ts`: AI interaction logic.

## 5. Operational Commands
- **Dev Server:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint`

## 6. Workflow & Boundaries
- **API Keys:** Never hardcode keys. Always use `process.env.API_KEY`.
- **Performance:** Debounce heavy calculations (chunking large text).
- **Error Handling:** Gracefully handle API failures (e.g., quota limits) with UI feedback.
- **Visuals:** When adding new metrics, prioritize visualization (charts, heatmaps) over raw text.
