# Anatomy diagram migration

The handbook now has 131 Anatomy figures across 75 articles. These replace 55 inline SVGs, 10 Mermaid diagrams, and 66 SVG image references. The 66 public SVG paths also contain regenerated illustrations and complete explanations. The existing token bucket implementation remains separate.

## Reading behavior

Each figure presents a physical teaching model, a short title, and one highlighted role. Readers inspect parts through a native select, previous and next buttons, or the illustrated part itself. An optional five-second tour pauses on pointer entry, keyboard focus, or manual selection. Figures start without a tour.

The adjacent explanation carries the technical meaning. Shared cabinets, gates, trays, and instruments represent roles rather than literal infrastructure. Inspection does not execute software. The disclosure under each figure explains this distinction. Dimensions and sample objects have no quantitative meaning unless the explanation states a quantity.

The executor capacity figure has exactly two workers and two queue slots. The request trace has calibrated strip lengths and positions for its illustrated 1200 ms span. Its uncovered time is 120 ms: 20 ms before connection acquisition and 100 ms after inventory.

Without JavaScript, every explanation remains visible and controls stay hidden. Print styles also reveal every explanation. Reduced motion snaps selections into position and disables the tour. The controller loads when a figure approaches the viewport and stops animation when settled, offscreen, or in a hidden document.

## Source files

| File | Purpose |
| --- | --- |
| `scripts/figures/anatomy-inventory.json` | Original diagram locations, legacy descriptions, and public asset paths |
| `scripts/figures/anatomy-specs.mjs` | Authored titles, explanations, role mappings, and stated quantities |
| `scripts/figures/anatomy.mjs` | Build-time SVG geometry, figure markup, and standalone SVG exports |
| `src/figures/anatomy/live.ts` | Browser selection, motion, tour, and cleanup |
| `src/figures/anatomy/figure.css` | Site palette, responsive controls, focus shading, and print behavior |
| `scripts/tests/anatomy.test.mjs` | Compiled article coverage and exact standalone asset checks |

Markdown contains stable `data-anatomy` IDs. The content compiler resolves those IDs before rendering React. Drawing code and the explanation registry stay outside the client bundle. The models use the vendored [Anatomy kit](https://github.com/wheresryan22/anatomy) and its MIT license.

## Validation results

The migration checks cover every inventoried replacement under `/` and `/dev-handbook/`. They check accessible SVG descriptions, explanation panels, selection targets, finite motion offsets, static fallback markup, and the existing token bucket's presence. Standalone exports must match their generated source exactly.

Browser checks cover pointer selection, keyboard Home and End, the optional tour, and reduced motion at 390 px. Screenshots were inspected in light and dark themes, including a construction gallery with 28 combinations of model and part count. The upstream line-end checker reports zero floating texture ends in both themes. Trace and executor close-ups were inspected at four-times capture scale. Browser consoles were clean.

All 66 standalone exports also parse as XML. Direct asset review caught and fixed a bare attribute and a nested viewport that caused incomplete or overlapping output. Export tests now check explicit motion attributes and a single SVG viewport.

`pnpm check` passes for both hosting bases, including TypeScript, six tests, the production build, and verification of 138 rendered pages, internal links, heading anchors, and local assets. These checks establish coverage and site integrity. They do not prove every teaching analogy or every animated solid intersection mathematically.

The rewrite also corrects specific misleading claims in earlier figures. bcrypt already includes a salt, JWT segments use base64url and remain readable, and an opaque UUID does not replace object authorization. These explanations follow the [OWASP password storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) and [REST security guidance](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html). MCP explanations retain the article's [2026-07-28 protocol scope](https://blog.modelcontextprotocol.io/posts/2026-07-28/).

## Regeneration commands

`node scripts/figures/regenerate-anatomy.mjs` rewrites the 66 public SVG assets from the authored specifications. `node scripts/figures/preview-anatomy.mjs` produces `.cache/anatomy-audit.html` for construction inspection. `pnpm check` and `SITE_BASE=/dev-handbook/ pnpm check` validate the site under both hosting bases.
