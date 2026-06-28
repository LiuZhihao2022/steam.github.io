# STEAM — Project Website

Static project page for **STEAM: Self-Supervised Temporal Ensemble Advantage Modeling for Real-World Robot Learning** (CoRL 2026). No build step — plain HTML/CSS/JS.

## Run locally
```bash
cd steam_proj_website
python3 -m http.server 8000
# open http://localhost:8000
```
(Opening `index.html` directly via `file://` mostly works, but a local server is recommended so the videos and fonts load reliably.)

## Deploy
Upload the whole `steam_proj_website/` folder to any static host (GitHub Pages, Netlify, Vercel, S3). It is fully self-contained under `assets/`.

## File map
```
index.html              page markup
assets/css/style.css    Ember theme (warm orange on white), all styling
assets/js/main.js       nav, tabs, video controls, lightbox, copy, canvas chart + data
assets/video/           web-encoded H.264 MP4s (towel / chips / cola / pnp / adv / teaser)
assets/poster/          poster frames (first frame of each clip)
assets/img/             figures exported from the paper (teaser, method, density, setup)
assets/STEAM_paper.pdf  the paper PDF (linked by the "PDF" button)
```

## What to replace before going public  ← TODO
1. **Authors & affiliations** — placeholder block in `index.html`, search for `Authors: PLACEHOLDER`. Replace the `.authors` and `.affils` lines with real names/units (`*` = equal, `†` = corresponding).
2. **Links** — in `index.html` the **arXiv** and **Code** buttons are disabled (`btn-disabled`, marked `soon`). To enable, set the real `href` and remove `class="... btn-disabled"`, `aria-disabled`, and the `<i class="soon">` tag. The **PDF** button already points to `assets/STEAM_paper.pdf`.
3. **BibTeX** — in `index.html`, the `#bibText` block uses `Anonymous Authors` / `Under review`; update once accepted/de-anonymized.
4. **Advantage-visualization videos** — all four tasks now have advantage-curve clips in `assets/video/adv/` (towel & chips: expert / rollout_succ / rollout_fail / human_corr — 4 each; cola & pnp: no DAgger, so expert / rollout_succ / rollout_fail — 3 each), keyed in `ADV_VIDEOS` in `assets/js/main.js`. The human-takeover badge appears for tasks listed in `ADV_TAKEOVER` (seconds) — currently `towel: 24`; add `chips: <sec>` if you want the badge on chips too.

## Regenerating media (if sources change)
Videos were transcoded with `ffmpeg` (H.264, faststart, audio stripped, scaled for web) and figures exported with `pdftoppm`. The original sources live in `../STEAM_supp/material/` and `./video/`.
