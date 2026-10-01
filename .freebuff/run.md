# Hoodie cinematic site — run doc

## Deployment notes (GitHub Pages)

- `vite.config.ts` sets `base: '/hoodie-site/'` — change to `'/'` only for a
  root (*.github.io) or custom-domain deploy.
- `public/.nojekyll` ships into `dist/` so GitHub Pages serves the `assets/`
  folder as-is (no Jekyll processing).
- All runtime asset URLs go through `withBase()` (src/baseUrl.ts), so frame/
  tile/poster paths follow the configured base automatically.

## How to reproduce the artifacts

Requires Node 18+ and ffmpeg on PATH.

```bash
npm ci            # or: npm install (package-lock.json is committed)
npm run build     # = node scripts/prepare-assets.mjs && tsc --noEmit && vite build
```

`scripts/prepare-assets.mjs` regenerates everything under `public/assets/` from
the source clips/stills in the repo root (frame sequences, tiles, stills,
`src/asset-manifest.json`) and needs ffmpeg. If `public/assets/` already
exists and is current, only the `tsc`/`vite` part of the build is needed for
dev.

## How to run the server

```bash
npm run dev       # vite, default port 5173
```

- URL: http://localhost:5173/
- If 5173 is taken, run `npm run dev -- --port 5174` and use that port.
- QA URL params: `?debug` shows the scene overlay (p / band / frame) and
  forces the animated path; `?motion=on` forces the full scrubbed experience
  WITHOUT the overlay (use this on reduced-motion systems just to watch the
  scroll animation); `&dpr=2` emulates a high-DPI backing store.
- A console warning is logged whenever the reduced-motion poster path is
  active, and failed frame/tile URLs are logged with `[hoodie]` prefixes.
- Detached (Windows), with logs:
  ```powershell
  (Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -RedirectStandardOutput 'E:\web\cinematic\.freebuff\preview-9f88a647-6aa3-4f0f-a0b2-4be00c331aed.log' -RedirectStandardError 'E:\web\cinematic\.freebuff\preview-9f88a647-6aa3-4f0f-a0b2-4be00c331aed.log.err' -WindowStyle Hidden -PassThru).Id
  ```
