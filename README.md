# World Cup Gauntlet

A static, browser-based football draft game inspired by [38-0-0](https://38-0-0.com/).
Draft a nation's all-time XI from real World Cup squads, then face every World
Cup winner in history — 22 knockout ties, zero losses allowed.

Built with **Vite + React + TypeScript**. No backend, no database — it runs
locally and deploys as a static site to GitHub Pages.

## How to play

1. Draw a random nation.
2. Review their historical pool strengths and choose a formation that fits.
3. Across 11 rounds you're shown one of that nation's historic World Cup squads
   each round — pick one player and place them in an empty slot in your
   formation.
4. The same person can't be picked twice across different years.
5. Your XI is rated (ATT / MID / DEF / GK / OVR), then you enter the **Gauntlet**:
   knockout ties vs all 22 World Cup champions, from Uruguay 1930 to Argentina
   2022.
6. The grail is **22-0** — beat every champion without losing.
7. Share your result card.

## Commands

```bash
npm install        # install dependencies
npm run dev        # start local dev server (http://localhost:5173/world-cup-draft/)
npm run build      # type-check + production build to dist/
npm run preview    # preview the production build
npm run deploy     # build + publish dist/ to GitHub Pages via gh-pages
npm run validate:data  # sanity-check all game data (run automatically in CI)
```

## Project structure

```text
src/
  components/        React UI (formation, draft, gauntlet, share)
  data/
    historical/squads/ JSON squad data — every World Cup year per nation
    historical/      Loader + squad builder
    worldCupChampions.ts  22 World Cup winning campaigns (gauntlet opponents)
    nations.ts       Supported nations
  lib/
    draft/           Nation + team + player selection rules
    formations/      Formation definitions (4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 5-3-2)
    gauntlet/        Champion gauntlet simulation and labels
    ratings/         Out-of-position penalties + team rating calculation
    simulation/      Match engine (knockout ties with scorers)
    types/           Shared TypeScript types
  scripts/           Data validation script
```

## Deployment

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`)
that builds and publishes to GitHub Pages on every push to `main`. Enable
**Settings → Pages → Source: GitHub Actions** in your repository.

Alternatively, run `npm run deploy` locally (uses the `gh-pages` branch).

Notes:

- `vite.config.ts` sets `base: "/world-cup-draft/"` for project-page hosting.
  Change this if you rename the repository.
- Update the `homepage` field in `package.json` with your GitHub username.

## Data

All players are real footballers from real World Cup squads — **179 campaigns**
across 12 nations (every World Cup appearance year). Game ratings are subjective
values for play balance and are **not** official FIFA ratings. The simulation
formula is intentionally hidden from players.
