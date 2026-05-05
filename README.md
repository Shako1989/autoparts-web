# autoparts-web

Frontend SPA for AutoParts.az — React 18 + Vite + TypeScript (strict).

See the project brief at `../AutoParts_az_MVP_Developer_Brief.md` for the full UX spec and roadmap.

## Prerequisites

- Node 20 LTS minimum (Node 25 also works for local dev; CI pins Node 20)
- The backend (`autoparts-api`) running on `localhost:8080`

## Run locally

```
npm install
npm run dev
```

Open <http://localhost:5173>. The Vite dev server proxies `/api/*` to `http://localhost:8080`.

## Common scripts

- `npm run dev` — Vite dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run lint` — ESLint
- `npm run test` — Vitest (interactive)
- `npm run test -- --run` — Vitest one-shot (used by CI)

## Stack

React Router v6 (data routers), TanStack Query v5 (server state), Zustand (cart, auth, garage, UI), React Hook Form + Zod (forms), Tailwind 3.4, i18next (az/ru/en).
