import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";
import { siteBase } from "./content.mjs";
const pages = JSON.parse(await readFile(".cache/pages.json", "utf8"));
const base = siteBase();
const documents = new Map();
const errors = [];
for (const page of pages) {
  const file =
    page.kind === "not-found"
      ? "dist/404.html"
      : path.join("dist", page.article.slug, "index.html");
  const $ = load(await readFile(file, "utf8"));
  documents.set(base + (page.article.slug ? page.article.slug + "/" : ""), $);
  if ($("h1").length !== 1) errors.push(`${file}: expected one page heading`);
  if (page.kind === "article" && !$("#article-body").text().trim())
    errors.push(`${file}: article text missing from HTML`);
  if ($("title").text().includes("undefined"))
    errors.push(`${file}: invalid title`);
  if ($("body").text().includes(":::tip["))
    errors.push(`${file}: unrendered callout`);
  const ids = new Set();
  for (const element of $("[id]").toArray()) {
    const id = $(element).attr("id");
    if (ids.has(id)) errors.push(`${file}: duplicate id: ${id}`);
    ids.add(id);
  }
  if ($("pre .mermaid-diagram").length)
    errors.push(`${file}: diagram rendered inside a code block`);
  if ($("style").text().includes("@import"))
    errors.push(`${file}: unexpected external stylesheet import`);
}
for (const [url, $] of documents) {
  for (const element of $(
    "a[href],img[src],script[src],link[href]",
  ).toArray()) {
    const value = $(element).attr(
      element.tagName === "a" || element.tagName === "link" ? "href" : "src",
    );
    if (!value || /^(https?:|mailto:|data:|\/\/)/.test(value)) continue;
    const target = new URL(value, `https://example.test${url}`);
    if (!target.pathname.startsWith(base)) {
      errors.push(`${url}: URL escapes site base: ${value}`);
      continue;
    }
    if (element.tagName === "a") {
      const destination = documents.get(target.pathname);
      if (!destination) {
        errors.push(`${url}: missing page: ${value}`);
        continue;
      }
      if (
        target.hash &&
        !destination(`[id="${decodeURIComponent(target.hash.slice(1))}"]`)
          .length
      )
        errors.push(`${url}: missing anchor: ${value}`);
    } else {
      try {
        await stat(path.join("dist", target.pathname.slice(base.length)));
      } catch {
        errors.push(`${url}: missing asset: ${value}`);
      }
    }
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.info(
    `Verified ${documents.size} rendered pages, internal links, anchors, and local assets under ${base}.`,
  );
