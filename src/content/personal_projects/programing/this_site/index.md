---
title: "This Website"
description: "Personal portfolio site built with Astro, Three.js, and DRACO-compressed 3D models."
publishDate: 2024-01-01
tags: ["Programming", "Web"]
githubRepo: "TheChaseFiore/chasefiore-com"
---

```astro
<ModelViewer
  modelUrl="/models/SSE-draco.glb"
  height="100%"
  autoRotate={true}
  navArrows={true}
  mouseTilt={true}
  cameraPos={[-1.88, 1.31, -3.15]}
  cameraTgt={[-0.49, 0.12, 0.08]}
  cycleModels={[
    { url: '/models/Streetcar-draco.glb',    cameraPos: [-2.94, 0.42, 1.03], cameraTgt: [0.56, 0.56, 0.67], portfolioUrl: '/portfolio/streetcar/' },
    { url: '/models/Charlie_Brown-draco.glb', cameraPos: [4.58, 2.40, 5.21],  cameraTgt: [1.25, 0.84, 0.31], portfolioUrl: '/portfolio/youre-a-good-man-charlie-brown/' },
    { url: '/models/Coffee_Shop-draco.glb',  cameraPos: [-1.59, 1.17, 5.09], cameraTgt: [-2.66, 0.83, 1.52], portfolioUrl: '/portfolio/interior-design/' },
    { url: '/models/SSE-draco.glb',          cameraPos: [-1.88, 1.31, -3.15], cameraTgt: [-0.49, 0.12, 0.08], portfolioUrl: '/portfolio/spaceship-earth-scad/' },
  ]}
/>
```
