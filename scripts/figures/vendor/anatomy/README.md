# Anatomy drawing kit

`iso-kit.mjs` and `iso.css` are unmodified copies from [wheresryan22/anatomy](https://github.com/wheresryan22/anatomy), commit `e6600ff`. `LICENSE` preserves the upstream MIT notice.

The handbook uses the kit in `scripts/figures/token-bucket.mjs` and `scripts/figures/anatomy.mjs` to generate static SVG at build time. The kit is not imported by the browser entry point. The token bucket's model and controller are in `src/figures/token-bucket/`. Article figures use authored explanations in `scripts/figures/anatomy-specs.mjs` and the inspection controller in `src/figures/anatomy/live.ts`.
