import { readFile, writeFile, mkdir, rm, readdir } from "node:fs/promises";
import { build } from "vite";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { compileContent, siteBase } from "./content.mjs";
import { documentFor } from "./html.mjs";
const pages = await compileContent();
execFileSync("pnpm", ["exec", "tsc", "--noEmit"], { stdio: "inherit" });
await build();
await build({
  build: {
    ssr: "src/entry-server.tsx",
    outDir: ".cache/server",
    emptyOutDir: true,
  },
});
const { render } = await import(
  pathToFileURL(path.resolve(".cache/server/entry-server.js")).href
);
const font = (await readdir("dist/assets")).find(
  (file) =>
    file.startsWith("geist-latin-wght-normal") && file.endsWith(".woff2"),
);
const template = (await readFile("dist/index.html", "utf8")).replace(
  "<!--page-head-->",
  `${font ? `<link rel="preload" href="${siteBase()}assets/${font}" as="font" type="font/woff2" crossorigin>` : ""}<!--page-head-->`,
);
for (const page of pages) {
  const output =
    page.kind === "not-found"
      ? "dist/404.html"
      : path.join("dist", page.article.slug, "index.html");
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, documentFor({ template, page, render }));
}
await writeFile("dist/.nojekyll", "");
if (process.env.SITE_URL) {
  const urls = pages
    .filter((page) => page.kind !== "not-found")
    .map(
      (page) =>
        new URL(
          siteBase() + (page.article.slug ? page.article.slug + "/" : ""),
          process.env.SITE_URL,
        ).href,
    );
  await writeFile(
    "dist/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${url.replace(/&/g, "&amp;")}</loc></url>`).join("")}</urlset>`,
  );
}
execFileSync("pnpm", ["exec", "pagefind", "--site", "dist"], {
  stdio: "inherit",
});
await rm(".cache/server", { recursive: true });
console.info(
  `Generated ${pages.length - 1} pages and a 404 page. Deploy dist/ to any static host.`,
);
