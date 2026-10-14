import { siteBase } from "./content.mjs";
const escape = (value) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
export function documentFor({ template, page, render }) {
  const { html, ...data } = page;
  const base = siteBase();
  const title =
    page.kind === "home"
      ? "Dev Handbook · Learn how software works"
      : `${page.article.title} · Dev Handbook`;
  const url = process.env.SITE_URL
    ? new URL(
        base + (page.article.slug ? page.article.slug + "/" : ""),
        process.env.SITE_URL,
      ).href
    : null;
  const head = `<title>${escape(title)}</title><meta name="description" content="${escape(page.article.description)}"><link rel="icon" href="${base}favicon.svg"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(page.article.description)}"><meta property="og:type" content="${page.kind === "article" ? "article" : "website"}">${url ? `<link rel="canonical" href="${escape(url)}"><meta property="og:url" content="${escape(url)}">` : ""}${page.kind === "not-found" ? '<meta name="robots" content="noindex">' : ""}`;
  return template
    .replace("<!--page-head-->", () => head)
    .replace("<!--page-app-->", () => render(data, html))
    .replace("<!--page-data-->", () =>
      JSON.stringify(data).replace(/</g, "\\u003c"),
    );
}
