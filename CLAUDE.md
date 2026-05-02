# CLAUDE.md

Quick orientation for Claude Code sessions on this repo.

## Stack

- **Astro 6** (`astro.config.mjs`), `output: 'static'`
- **Cloudflare Pages** deploy (`wrangler.jsonc`); `pages_build_output_dir: ./dist`
- **Three.js** (`src/components/ModelViewer.astro`) for the interactive 3D hero + portfolio viewers
- **Node 24** (`engines` in `package.json`)

```
npm run dev       # astro dev
npm run build     # astro build
npx astro check   # typecheck (see "Known type errors" below)
```

## ModelViewer is the hot spot

`src/components/ModelViewer.astro` is the heaviest file by far and has Safari-specific memory constraints. Before editing, know:

- **Dispose every model swap.** `disposeObject3D` is called in `doTransition` and on cleanup. Without this iOS Safari OOMs after a few cycles and shows the "A problem repeatedly occurred" sheet. Don't reintroduce a `modelContainer.remove()` without disposing.
- **`webglcontextlost` / `webglcontextrestored` handlers exist** so a dropped context pauses the render loop instead of throwing. Keep them.
- **Mobile budget**: `(hover: none)` devices use `pixelRatio` cap of 1.5 (vs 2) and shadow map 1024 (vs 2048). Don't unconditionally bump these.
- **Initial model fetch is NOT gated on `requestIdleCallback`** — `IntersectionObserver` already gates below-the-fold viewers; further deferral was an LCP regression.

## Models live in two parallel trees

- **`public/models/`** — originals from Revit/SketchUp export (e-verse generator). Thousands of redundant per-element meshes, all deduping to one material. **Used by portfolio detail pages** (`src/pages/portfolio/[...id].astro`) where `explodeButton={true}` relies on the mesh hierarchy.
- **`public/models/landing/`** — same models flattened to one mesh each via `gltf-transform optimize ... --simplify false --compress draco`. **Used only by `src/pages/index.astro`** for the homepage cycle. Roughly half the size; explode does nothing post-flatten which is why this is landing-only.

If the user asks to add a new model: drop the original in `public/models/`, and if it's also used in the homepage cycle, generate a landing variant with:

```
npx --yes @gltf-transform/cli optimize \
  public/models/<name>.glb public/models/landing/<name>.glb \
  --simplify false --compress draco
```

The user plans to do further Revit-side optimization on the originals over time.

## Homepage preload

`src/layouts/Layout.astro` has a `path === '/'` guard around a `<link rel="preload" as="fetch" type="model/gltf-binary" href="/models/landing/SSE-draco.glb" crossorigin>`. If the homepage's first model ever changes, update that href.

## Content collections

Portfolio entries are in `src/content/portfolio/<category>/<slug>/index.md`. Each frontmatter `model:` field references `/models/<name>-draco.glb` (originals, not landing variants).

## Known type errors

`npx astro check` reports 3 pre-existing errors in `functions/api/contact.ts` (missing Cloudflare Pages types). Not introduced by recent work — leave them unless explicitly asked.

## Git workflow

- Develop on `claude/<short-topic>` branches off `main`
- Open PRs as ready (not draft) once pushed
- Don't push to `main` directly
- Recent merged PRs (May 2026): #2 Safari crash fix, #3 LCP idle-gate removal, #4 landing GLB optimization, #5 add CLAUDE.md, #6 audit cleanup (OG meta + scoped overflow + Welcome.astro deletion), #7 cache-control headers

## Static asset caching

`public/_headers` sets long-lived cache policies for Cloudflare Pages:
`_astro/*` is `immutable` (content-hashed), `models/*` and `draco/*` get
30-day max-age + 1-day stale-while-revalidate. If you add a new long-lived
asset directory, add a matching block.

## Outstanding optimization punch list

- Add a real `og:image` (1200×630 hero shot). `Layout.astro` has the OG/Twitter tags wired; just needs the asset + a `<meta property="og:image">` line.
- Long inline `<style>` in `resume.astro` could become sub-components.

Audit items investigated and confirmed *not* worth doing:
- **Lazy-load DRACO decoder.** Verified by inspecting `dist/`: the 642 KB ModelViewer bundle (Three.js + GLTFLoader + DRACOLoader) is already page-scoped by Astro/Vite. `/contact`, `/resume`, etc. ship zero 3D code. The DRACO WASM in `public/draco/` is only fetched at runtime when GLTFLoader actually decodes a model.
- **`astro:assets` `<Image>` migration on photo pages.** `photography.astro`, `projects/drawing/[id].astro`, and `projects/lighting-design/[id].astro` already use `<Image>` correctly. Remaining raw `<img>` tags are lightbox modals with dynamically-set `src` (legitimate plain-img use).
- **Audio-mastering listener leak.** `<script>` modules are deduped by Astro across navigations and audio-element listeners die with the element on page swap. Not a real leak.

## Things to avoid

- Don't bypass git hooks (`--no-verify`, `--no-gpg-sign`)
- Don't add Three.js features that allocate without a corresponding `dispose()` in cleanup
- Don't unify `public/models/` and `public/models/landing/` — the split is intentional
- Don't blindly trust optimization-audit agent claims; verify before refactoring (e.g. agent flagged Turnstile as blocking, but `contact.astro:66` already had `async defer`)
