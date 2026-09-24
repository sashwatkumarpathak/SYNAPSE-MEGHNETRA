# SYNAPSE-MEGHNETRA

National Weather Big Data Analytics Platform — SIH 2026 PS 26069.

## Prototype first
The current build deliberately starts with the user-facing intelligence dashboard and synthetic data. This keeps the Vercel URL stable while the real ingestion, verification and analytics layers are built behind the same UI contracts.

## Local run
Requirements: Node.js 20.9+.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment
Copy `apps/web/.env.example` to `apps/web/.env.local` when Mapbox/Cesium credentials are available.

## Deployment
Vercel should point to `apps/web` as the root directory. The backend will later deploy independently to Render.
