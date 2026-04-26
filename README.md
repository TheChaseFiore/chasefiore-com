# chasefiore.com

Personal portfolio site built with [Astro](https://astro.build), Three.js, and Cloudflare Pages.

## Commands

Run from the project root:

| Command | Action |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build locally |
| `npm run astro sync` | Regenerate content collection types (run after adding new collections or changing schemas) |

## Project Structure

```
src/
  components/
    ModelViewer.astro     # Three.js 3D viewer — used on index and portfolio detail pages
  content/
    portfolio/            # Professional work (each project is a folder with index.md + images)
    personal_projects/
      programing/         # Programming projects (each subfolder has index.md + images)
      drawing/            # Drawing projects (each subfolder has index.md + images)
      lighting-design/    # Lighting design (single index.md + images in same folder)
      photography/        # Flat folder of sequential photos (photography_01.jpg, etc.)
  layouts/
    Layout.astro          # Global layout — nav, footer, CSS variables
  pages/
    index.astro           # Landing page with 3D model carousel
    portfolio/
      index.astro         # Portfolio grid with hover preview
      [id].astro          # Individual portfolio project
    projects/
      index.astro         # Personal projects landing (order: programming, drawing, photography, audio mastering)
      programing/[id].astro
      drawing/[id].astro
      lighting-design/[id].astro
  content.config.ts       # Content collection schemas
public/
  models/                 # DRACO-compressed .glb files for 3D viewer
  draco/                  # DRACO decoder (wasm + js fallback)
```

## Adding a Portfolio Project

1. Create `src/content/portfolio/my-project-id/index.md`:

```yaml
---
title: "Project Title"
description: "Short description."
publishDate: 2024-06-01
coverImage: ./cover.jpg
tags: ["Tag One", "Tag Two"]

# Optional — 3D model viewer
model: /models/MyModel-draco.glb
cameraPos: [0, 1, 3]
cameraTgt: [0, 0, 0]

# Optional — YouTube embed
youtubeId: "VIDEO_ID_HERE"
youtubeStart: 30   # seconds (optional)

# Optional — section cut starting position (0–100)
initialCutZ: 50
---

Optional markdown body content goes here.
```

2. Add images to the same folder (any filename, any order — they sort alphabetically).
3. If using a 3D model, drop the DRACO-compressed `.glb` into `public/models/`.

## Adding a Programming Project

1. Create `src/content/personal_projects/programing/my-project/index.md`:

```yaml
---
title: "Project Title"
description: "Short description."
publishDate: 2024-06-01
coverImage: ./my_project_01.jpg
tags: ["Programming"]

# Optional — YouTube embed
youtubeId: "VIDEO_ID_HERE"
---
```

2. Add images named sequentially: `my_project_01.jpg`, `my_project_02.jpg`, etc.

## Adding a Drawing Project

Same as programming but under `src/content/personal_projects/drawing/my-project/index.md`.

## Adding Photography

Drop images into `src/content/personal_projects/photography/` named sequentially:
`photography_01.jpg`, `photography_02.jpg`, etc.

Photography does not yet have a collection or detail pages — just the flat image folder.

## Image Naming Convention

All personal project images use the pattern `{folder_name}_{number}.{ext}`:
- `flip_dot_01.jpeg`, `flip_dot_02.jpg`, …
- `photography_01.jpg`, `photography_02.jpg`, …

When adding new images, continue the sequence. Never use filenames with `(1)` or `(2)` suffixes — those are duplicates created by some download managers and should be deleted.

## 3D Models

- Place DRACO-compressed `.glb` files in `public/models/`.
- Compress with: `gltf-pipeline -i input.glb -o output-draco.glb --draco.compressionLevel 10`
- The viewer auto-falls back from WASM to JS DRACO decoder if needed.
- Use the `D` key in the browser to show debug info (camera position, target, angles) — useful for setting `cameraPos`/`cameraTgt` values.

## Content Collection Types

After modifying `src/content.config.ts` (adding fields, new collections), run:

```sh
npm run astro sync
```

This regenerates `.astro/types.d.ts`. The VS Code TypeScript server may also need a restart.

## Deployment

Deployed to Cloudflare Pages. Push to `main` triggers a build. The site is statically generated (`output: 'static'` in `astro.config.mjs`).
