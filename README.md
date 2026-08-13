# Habits-Transformer — Level Up 30

A **30-day habit tracking and accountability challenge** — score yourself daily across 5 life categories and earn up to 100 points per day. Honest self-assessment over inflated scores: *"a real 32 beats a fake 72."*

No accounts. No servers. All data stays in your browser.

---

## Two Versions

This repo contains two standalone versions of the app that share the same core concept but differ in scope and setup:

| | `levelup/` | `alternate/` |
|---|---|---|
| **Mode** | Single-player | Two-player head-to-head |
| **Build** | Vite + React | No build — open directly in browser |
| **Scoring style** | Per-category sliders | Checkboxes, tier buttons & sliders |
| **Visual theme** | Dark (charcoal + category accent colours) | Dark pine/court green with badminton court metaphor |

---

## Features

### Single-Player (`levelup/`)

- **Onboarding** — set your name and challenge start date
- **Today tab** — per-category sliders, live 0–100 total, rotating motivational quote
- **Journey tab** — hero level + progress bar, streak / average / best-day stat tiles, interactive 30-day heat-map grid
- **Weeks tab** — per-week summary cards (totals, averages, workout/sleep counts, weakest category), shareable score text, and a **Rebalance** stepper to redistribute point weights
- **Backup** — export / import all data as JSON; reset challenge at any time

### Two-Player (`alternate/index.html`)

- Head-to-head scoring for **Player A** (orange) vs **Player B** (blue) with a badminton court visual
- More granular input per category:
  - **Wakeup** — checkboxes (on-time, no-snooze, no-phone)
  - **Workout** — duration tier buttons + "pushed harder" bonus
  - **Work / Personal** — multi-slider breakdowns (focus, discipline, reading, water, etc.)
  - **Sleep** — checkboxes (bed on time, enough hours, phone away, prep for tomorrow)
- **Week view** — side-by-side scoreboard and bar chart, Sunday rebalance with auto-suggestion
- **30 Days view** — 10-column grid with mini dual bars, level progress for each player
- **Setup** — name & date config, JSON export/import (with merge-without-clobbering logic), CSV export

---

## Scoring Model

Five categories with default point values that sum to **100 pts/day**:

| Category | Points | Colour |
|---|---|---|
| 🌅 Wakeup | 10 | Blue `#3987e5` |
| 🏋️ Workout | 25 | Orange `#d95926` |
| 💼 Work | 25 | Green `#199e70` |
| 🌱 Personal | 25 | Amber `#c98500` |
| 🌙 Sleep | 15 | Pink `#d55181` |

Weekly **Rebalance** lets you shift weights in 5-point increments toward your weakest area — the total always stays at 100.

### Progression Levels

| Points accumulated | Level |
|---|---|
| 0+ | Getting Started |
| 501+ | Building |
| 1001+ | Consistent |
| 1501+ | Strong |
| 2001+ | Disciplined |
| 2501+ | Level Up 🏆 |

---

## Project Structure

```
Habits-Transformer/
├── index.html          # Entry point for the Vite build
├── vite.config.js      # Multi-page build; GitHub Pages (/Paisa/) + Vercel support
├── levelup/
│   ├── main.jsx        # ReactDOM entry point
│   ├── App.jsx         # Full app (~666 lines)
│   └── levelup.css     # Dark-theme stylesheet
└── alternate/
    └── index.html      # Self-contained 2-player version (CDN React + Babel, ~1100 lines)
```

---

## Getting Started

### Single-player version (Vite)

```bash
# Install dependencies (requires Node.js)
npm install

# Start dev server
npm run dev

# Production build
npm run build
```

> **Note:** A `package.json` is required. If it's missing, initialise with `npm init` and install `vite` and `react`/`react-dom`.

### Two-player version (no build needed)

Just open `alternate/index.html` in any modern browser — no server or build step required.

---

## Deployment

`vite.config.js` supports two targets out of the box:

- **GitHub Pages** — base path is `/Paisa/`
- **Vercel** — base path is `/` (auto-detected via `VERCEL=1` env var)

---

## Privacy

All data is stored locally in your browser (`localStorage`). Nothing is ever sent to a server. Use the JSON export feature to back up or transfer your progress between devices.

---

## Tech Stack

- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/) (single-player build)
- Vanilla CSS with CSS custom properties
- No external state library — `useState`, `useEffect`, `useMemo`, `useRef` only
