# RAG Eval Dashboard

A purely client-side React + TypeScript dashboard for exploring RAG evaluation runs. Drop eval JSONs, source JSONs, and questions metadata into the sidebar — everything stays in the browser.

## Development

```bash
pnpm install
pnpm dev
```

The dev server runs on `http://localhost:5173`.

## Build

```bash
pnpm build
pnpm preview
```

The production bundle lands in `dist/`.

## Project structure

```
src/
├── main.tsx                Entry: renders <App/>
├── App.tsx                 Top-level composition (layout + modals)
├── styles/                 Global CSS split by concern
├── lib/                    Pure logic — no React
├── hooks/                  Custom hooks for state + derived data
├── types/                  Shared TypeScript interfaces
└── components/
    ├── common/             MarkdownRenderer, Stat, Section, ThemeToggle, EmptyState, ModalShell
    ├── sidebar/            All sidebar UI
    ├── overview/           HeroStats (4 KPI cards)
    ├── charts/             Bar/Radar charts + controls + color picker
    ├── tables/             FileSummaryTable + PerQuestionTable
    └── modals/             QuestionModal + CostEditor
```

## Supported input files

Drop any combination — the parser auto-detects by JSON shape:

- **Eval files** (`eval_*.json`): the main artifact. Has `metrics` + `per_question`.
- **Source files**: have a top-level `results` array. Unlocks real token counts, hallucination filters, latency, classification tier.
- **Questions metadata** (`questions.json`): array of question objects with `id`, `domain`, `difficulty`, `answer_type`, etc. Unlocks question-attribute filters and breakdown charts.
