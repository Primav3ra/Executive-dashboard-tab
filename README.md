# Executive Dashboard tab

An "Executive" tab styled in trakkr.ai's visual system, with illustrative data for a demo brand, **Venture PR**.

```bash
npm install
npm run dev      # http://localhost:5173 → /executive
npm test         # state reducer tests
npm run build
```

## Routes

| Route | Screen |
|---|---|
| `/executive` | Executive Overview: what happened, what is going on, what is next |
| `/executive/platforms/:id` | AI platform visibility (`chatgpt`, `claude`, `gemini`, `aio`) |
| `/executive/evidence` | Explore the evidence (filters: `platform`, `issue`, `period`, `q`; `?highlight=e01`) |
| `/executive/missions` | Guided Missions (`?status=verified` and so on) |
| `/executive/missions/:id` | Mission detail with the working step flow |
| `/executive/missions/team` | Who is doing what, including leadership decisions |
| `/executive/expert` | Expert View (trakkr-style analyst dashboard) |
| `/executive/report` | Printable executive report (`?print=1` opens the print dialog) |

## How it works

- **Design tokens** (`src/index.css`) are copied from trakkr's production CSS. The accent is teal `#0e9373`, the grays are the stone scale plus `gray-75`, the fonts are Inter and JetBrains Mono, and borders are hairlines.
- **Data** (`src/data/seed.ts`) is dummy data. Platform coverage is *derived* from the 20 tracked prompts, so the numbers stay consistent everywhere.
- **State** (`src/state/reducer.ts`) is a pure reducer, persisted to localStorage. A mission moves through: send for approval → approve (or request changes) → run a fresh AI check → verified. Verifying resolves its evidence and can raise coverage.
- To reset the demo, go to Settings (sidebar) → Reset demo data.
