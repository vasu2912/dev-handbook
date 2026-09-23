# Dev Handbook

Dev Handbook is a static Astro and Starlight site with practical guides for understanding software and backend engineering. It has no server runtime, database, authentication, or CMS.

## Project structure

The main site files are:

```text
.
├── public/                 # static assets, including the favicon
├── src/
│   ├── components/        # Starlight reading-layout override
│   ├── styles/custom.css   # light and dark theme overrides
│   ├── content/
│   │   └── docs/           # Markdown and MDX pages
│   └── content.config.ts
├── astro.config.mjs        # Starlight title, metadata, and sidebar
└── package.json
```

Starlight maps each `.md` or `.mdx` file in `src/content/docs/` to a route based on its file name. The sidebar in `astro.config.mjs` keeps the reading path explicit.

`src/components/TwoColumnContent.astro` replaces Starlight's right rail with a collapsed Contents disclosure. `src/styles/custom.css` sets the 17rem sidebar and centered 50rem article. Sidebar groups default to collapsed except the current branch; Starlight preserves explicit navigation choices within the session.

`src/styles/sidebar-icons.css` maps every sidebar link and group to a Tabler outline icon. The SVGs and MIT license are vendored in `public/icons/sidebar/` from `@tabler/icons` 3.46.0. Icons inherit text color through CSS masks and add no JavaScript. New sidebar entries need an explicit topic icon mapping; there is no generic fallback. Group selectors match a direct child link, so update the selector if that link moves.

`src/content/docs/java-spring/` holds the Spring Boot section. It uses a chosen Java 21 and Spring Boot 4.0 example baseline, states version-sensitive behavior explicitly, and links official sources at the end of each page. Keep explanations focused, but give worked examples enough space to show inputs, code, and observable outcomes. Label partial snippets and illustrative output. Extend `astro.config.mjs` navigation and `src/styles/sidebar-icons.css` together with any new page.

`src/content/docs/agentic-ai/` is the diagram-led Agentic AI handbook. It covers model foundations, retrieval, tool use, context and memory, orchestration, subagents, MCP, security, production operation, tutorials, and walkthroughs. `research/agentic-ai-interview-questions.md` preserves the original question bank, while `scripts/build-agentic-ai-question-map.mjs` generates the sequential coverage map used to verify that every source question has a primary reading destination.

`src/styles/learning.css` styles chapter diagrams, operation maps, walkthroughs, and the connection-budget calculator. `public/js/site.js` adds reader-controlled scenario selection, Previous, Next step, and Reset controls without autoplay. Write every scenario as a `section[data-scenario]` with a visible name and an `ol.walkthrough-steps`; its list items remain readable without JavaScript and in print. Calculator forms start hidden, with a visible static result, and appear after initialization. Keep examples in their chapters rather than duplicating their content in JavaScript.

## Local development

```sh
pnpm install
pnpm run dev
```

Build the static output with:

```sh
pnpm run build
```

Astro writes the deployable files to `dist/`. The site uses static output, so Cloudflare Pages can serve the directory without a Worker or server function.

## Documentation tooling

The repository-local `.codex/config.toml` connects Codex to the official Astro Docs MCP server. Its search index covers both Astro and Starlight documentation. Start a new Codex task from this repository after changing MCP settings so the tool list is refreshed.

## Diagrams

Original system diagrams live in `public/images/system-design/vector/`. Agentic AI diagram sources live in `diagrams/source/agentic-ai/`; their audited site exports live in `public/images/agentic-ai/vector/`. Articles must embed the SVG export, never the `.excalidraw` source or PNG review render.

Keep diagrams as compact SVGs with a descriptive file name, a `viewBox`, `role="img"`, and meaningful `<title>` and `<desc>` elements. Do not embed external scripts or raster data. Keep source attribution in the surrounding article when a diagram re-expresses a sourced concept or dataset.

## Cloudflare Pages

Create a Pages project from this repository and use these settings:

- Build command: `pnpm run build`
- Build output directory: `dist`
- Node version: 22 or newer (required by pnpm 11)

Set the production branch to the branch you use for releases. Preview deployments can build pull requests without site-side configuration. This repository does not include deployment credentials or a Cloudflare binding.
