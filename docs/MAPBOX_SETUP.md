# MEGHNETRA Mapbox setup

The interactive map is wired through `NEXT_PUBLIC_MAPBOX_TOKEN`.

## Local
Create `apps/web/.env.local`:
```env
NEXT_PUBLIC_MAPBOX_TOKEN=YOUR_MAPBOX_PUBLIC_TOKEN
```
Then run `npm run dev` inside `apps/web` and open the local URL shown by Next.js.

## Vercel
Add `NEXT_PUBLIC_MAPBOX_TOKEN` as a Vercel Environment Variable for Preview and Production, then redeploy.

## Important
Do not commit `.env.local` or a real token into this public repository. The token is intentionally loaded at runtime. Restrict the Mapbox token to the project domain(s) in Mapbox settings.

Once configured, the map activates real Mapbox navigation, weather heatmap rendering, terrain, clickable events and true fill-extrusion building geometry in 3D.
