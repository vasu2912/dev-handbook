import { readFile, writeFile, mkdir } from "node:fs/promises";
import { anatomySpecs } from "./anatomy-specs.mjs";
import { anatomyFigure } from "./anatomy.mjs";
const css = await readFile(
  new URL("../../src/figures/anatomy/figure.css", import.meta.url),
  "utf8",
);
const kit = await readFile(
  new URL("./vendor/anatomy/iso.css", import.meta.url),
  "utf8",
);
const shapes = new Map();
for (const [id, spec] of anatomySpecs)
  shapes.set(`${spec.kind}:${spec.parts.length}`, id);
const baseCss = `:root{--surface:#fff;--text:#171717;--secondary-text:#525252;--border:#e5e5e5;--font:system-ui}body{margin:24px;background:#fafafa;font:14px system-ui}.prose{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.anatomy-figure{margin:0!important}.anatomy-explanation,.anatomy-takeaway,.anatomy-key{display:none}h1{font-size:18px}:root[data-theme=dark]{--surface:#191c23;--text:#e8ebf1;--secondary-text:#b8bec8;--border:#303640}html[data-theme=dark] body{background:#15171c}`;
await mkdir(".cache", { recursive: true });
await writeFile(
  ".cache/anatomy-audit.html",
  `<!doctype html><html lang="en" data-theme="light"><meta charset="utf-8"><title>Anatomy construction audit</title><style>${kit}\n${css.replace(/@import[^;]+;/, "")}\n${baseCss}</style><h1>Anatomy construction audit</h1><main class="prose">${[...shapes.values()].map((id, index) => anatomyFigure(id, index + 1)).join("")}</main></html>`,
);
console.info(
  `Wrote .cache/anatomy-audit.html with ${shapes.size} construction/part-count combinations.`,
);
