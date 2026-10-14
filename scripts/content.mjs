import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import container from "markdown-it-container";
import { createHighlighter } from "shiki";
import { load } from "cheerio";
import { z } from "zod";
import { slug as slugify } from "github-slugger";
import { renderMermaidSVG } from "beautiful-mermaid";

const frontmatter = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  sidebar: z.object({ order: z.number().default(100) }).optional(),
});
const navEntry = z.lazy(() =>
  z.union([
    z.object({ label: z.string(), slug: z.string() }),
    z.object({ label: z.string(), items: z.array(navEntry) }),
    z.object({ autogenerate: z.object({ directory: z.string() }) }),
  ]),
);
export function siteBase() {
  const base = process.env.SITE_BASE || "/";
  if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base))
    throw new Error("SITE_BASE must be / or a path such as /dev-handbook/.");
  return base;
}
async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? filesIn(path.join(directory, entry.name))
          : path.join(directory, entry.name),
      ),
    )
  ).flat();
}
export async function compileContent() {
  const base = siteBase();
  const files = (await filesIn("src/content/docs"))
    .filter((file) => /\.mdx?$/.test(file))
    .sort();
  const sources = await Promise.all(
    files.map(async (file) => {
      const source = matter(await readFile(file, "utf8"));
      const metadata = frontmatter.parse(source.data);
      const slug = file
        .replace(/^src\/content\/docs\//, "")
        .replace(/\.mdx?$/, "")
        .replace(/(^|\/)index$/, "");
      return { file, slug, source: source.content, ...metadata };
    }),
  );
  const languages = [
    ...new Set(
      sources.flatMap((source) =>
        [...source.source.matchAll(/^```([^\s`]+)/gm)].map((match) => match[1]),
      ),
    ),
  ].filter((language) => language !== "mermaid");
  const highlighter = await createHighlighter({
    themes: ["github-light", "github-dark"],
    langs: [],
  });
  for (const language of languages) {
    try {
      await highlighter.loadLanguage(language);
    } catch {
      /* Unregistered languages remain readable plain text. */
    }
  }
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    highlight(code, language) {
      if (!highlighter.getLoadedLanguages().includes(language)) return "";
      return highlighter.codeToHtml(code, {
        lang: language,
        themes: { light: "github-light", dark: "github-dark" },
        defaultColor: false,
      });
    },
  }).use(anchor, { level: [2, 3, 4], slugify });
  const renderFence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens, index, options, env, self) => {
    if (tokens[index].info.trim() === "mermaid") {
      return `<figure class="mermaid-diagram">${renderMermaidSVG(tokens[index].content, { bg: "var(--surface)", fg: "var(--text)", accent: "var(--accent)", font: "Geist Variable", transparent: true })}</figure>`;
    }
    return renderFence(tokens, index, options, env, self);
  };
  for (const kind of ["note", "tip", "caution", "danger"]) {
    md.use(container, kind, {
      validate: (params) =>
        new RegExp(`^${kind}(?:\\[.*\\])?$`).test(params.trim()),
      render(tokens, index) {
        if (tokens[index].nesting === -1) return "</aside>\n";
        const title =
          tokens[index].info.trim().match(/\[(.*)\]/)?.[1] ||
          kind[0].toUpperCase() + kind.slice(1);
        return `<aside class="callout callout-${kind}"><p class="callout-title">${md.utils.escapeHtml(title)}</p>\n`;
      },
    });
  }
  const articles = await Promise.all(
    sources
      .filter((source) => source.slug)
      .map(async (source) => {
        const $ = load(md.render(source.source), null, false);
        const ids = new Set(
          $("[id]")
            .toArray()
            .map((element) => $(element).attr("id")),
        );
        $("h2, h3").each((_, element) => {
          if ($(element).attr("id")) return;
          const stem = slugify($(element).text());
          let id = stem;
          let suffix = 1;
          while (ids.has(id)) id = `${stem}-${suffix++}`;
          ids.add(id);
          $(element).attr("id", id);
        });
        $("table").wrap(
          '<div class="table-scroll" tabindex="0" role="region" aria-label="Reference table"></div>',
        );
        $("pre").each((_, element) => {
          $(element).wrap('<div class="code-block"></div>');
          $(element).before(
            '<button type="button" class="copy-code" data-pagefind-ignore aria-label="Copy code">Copy</button>',
          );
        });
        $(".mermaid-diagram svg").each((index, element) => {
          const diagram = $(element);
          diagram.find("style").each((_, style) => {
            $(style).text(
              $(style)
                .text()
                .replace(/@import\s+url\([^)]*\);/g, ""),
            );
          });
          const replacements = new Map(
            diagram
              .find("[id]")
              .toArray()
              .map((node) => [
                $(node).attr("id"),
                `diagram-${index}-${$(node).attr("id")}`,
              ]),
          );
          diagram.find("*").each((_, node) => {
            for (const [attribute, value] of Object.entries(
              node.attribs || {},
            )) {
              let updated = value;
              if (attribute === "id")
                updated = replacements.get(value) || value;
              else
                for (const [old, next] of replacements)
                  updated = updated.replaceAll(`url(#${old})`, `url(#${next})`);
              if (attribute === "href" || attribute === "xlink:href") {
                const replacement = replacements.get(value.slice(1));
                if (value.startsWith("#") && replacement)
                  updated = `#${replacement}`;
              }
              $(node).attr(attribute, updated);
            }
          });
          const titleId = `diagram-title-${index}`;
          $(element).attr("role", "img").attr("aria-labelledby", titleId);
          $(element).prepend(
            `<title id="${titleId}">${md.utils.escapeHtml(source.title)} diagram</title>`,
          );
        });
        $('a[href^="/"], img[src^="/"]').each((_, element) => {
          const attr = element.tagName === "a" ? "href" : "src";
          const value = $(element).attr(attr);
          if (value && !value.startsWith("//"))
            $(element).attr(attr, base + value.slice(1));
        });
        $("img").attr("loading", "lazy").attr("decoding", "async");
        $('img[src$=".svg"]').each((_, element) => {
          const original = $(element).attr("src");
          if (!original?.startsWith(base)) return;
          $(element).attr("data-local-svg", original?.slice(base.length));
        });
        for (const element of $("img[data-local-svg]").toArray()) {
          const file = $(element).attr("data-local-svg");
          if (file && !file.includes("..")) {
            const asset = await readFile(path.join("public", file), "utf8");
            const dimensions = asset.match(
              /viewBox=["'][-.\d]+\s+[-.\d]+\s+([.\d]+)\s+([.\d]+)["']/,
            );
            if (dimensions)
              $(element)
                .attr("width", dimensions[1])
                .attr("height", dimensions[2]);
          }
          $(element).removeAttr("data-local-svg");
        }
        const headings = $("h2, h3")
          .toArray()
          .map((element) => ({
            id: $(element).attr("id"),
            title: $(element).text(),
            level: Number(element.tagName.slice(1)),
          }));
        const words = $.text().trim().split(/\s+/).length;
        return {
          slug: source.slug,
          title: source.title,
          description: source.description,
          section: source.slug.split("/")[0],
          minutes: Math.max(1, Math.ceil(words / 220)),
          headings,
          html: $.html(),
          order: source.sidebar?.order || 100,
        };
      }),
  );
  highlighter.dispose();
  const catalog = new Map(articles.map((article) => [article.slug, article]));
  function expand(entries) {
    return entries.flatMap((entry) => {
      if ("autogenerate" in entry) {
        const directory = entry.autogenerate.directory;
        return articles
          .filter(
            (article) =>
              article.slug === directory ||
              article.slug.startsWith(directory + "/"),
          )
          .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
          .map((article) => ({ label: article.title, slug: article.slug }));
      }
      if ("slug" in entry) {
        if (!catalog.has(entry.slug))
          throw new Error(
            `Navigation references missing article: ${entry.slug}`,
          );
        return [entry];
      }
      return [{ label: entry.label, items: expand(entry.items) }];
    });
  }
  const navigation = expand(
    z
      .array(navEntry)
      .parse(JSON.parse(await readFile("src/navigation.json", "utf8"))),
  );
  const ordered = [];
  function visit(entries) {
    for (const entry of entries)
      "slug" in entry ? ordered.push(entry.slug) : visit(entry.items);
  }
  visit(navigation);
  for (const article of articles)
    if (!ordered.includes(article.slug))
      throw new Error(`Article missing from navigation: ${article.slug}`);
  const metadata = (article) => {
    const { html, order, ...result } = article;
    return result;
  };
  const pages = articles.map((article) => {
    const index = ordered.indexOf(article.slug);
    const previous = catalog.get(ordered[index - 1]);
    const next = catalog.get(ordered[index + 1]);
    return {
      article: metadata(article),
      navigation,
      previous: previous ? metadata(previous) : null,
      next: next ? metadata(next) : null,
      count: articles.length,
      base,
      kind: "article",
      html: article.html,
    };
  });
  const home = {
    article: {
      slug: "",
      title: "Dev Handbook",
      description:
        "Practical guides for understanding software and backend engineering.",
      section: "",
      minutes: 0,
      headings: [],
    },
    navigation,
    previous: null,
    next: null,
    count: articles.length,
    base,
    kind: "home",
    html: "",
  };
  const missing = {
    ...home,
    kind: "not-found",
    article: { ...home.article, slug: "404", title: "Page not found" },
  };
  await mkdir(".cache", { recursive: true });
  await writeFile(
    ".cache/pages.json",
    JSON.stringify([home, ...pages, missing]),
  );
  return [home, ...pages, missing];
}
