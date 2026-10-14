# Dev Handbook

An open learning library built with React, Vite, and TypeScript. Every article is generated as HTML during the build. Readers can view the content without JavaScript, while React adds bookmarks, reading completion, appearance controls, and accessible dialogs. There is no authentication, database, or production server.

## Develop locally

Use Node 22.12 or newer and pnpm 11.

```sh
pnpm install
pnpm dev
```

Open `http://localhost:5173`. React and CSS changes use Vite hot reload. Markdown and navigation changes rebuild the content and reload the page. The development server binds to localhost. Set `PORT` to change its port.

Full-text search uses the generated production index. To try it locally:

```sh
pnpm build
pnpm preview
```

Run `pnpm check` to check TypeScript, build the site, and audit every rendered page, internal link, heading anchor, and local asset.

## Edit the handbook

Articles live in `src/content/docs/`. Keep Markdown frontmatter with a `title` and `description`. File names determine routes. For example, `system-design/index.md` becomes `/system-design/`, and `system-design/caching.md` becomes `/system-design/caching/`.

`src/navigation.json` preserves the reading sequence and nested topics. Add new articles to this navigation, or to a directory covered by an `autogenerate` entry. The build rejects missing destinations and articles that readers cannot reach through navigation.

Markdown supports tables, fenced code, raw HTML, and Starlight-style `:::tip[Title]`, `:::note`, `:::caution`, and `:::danger` callouts. Shiki highlights code during the build. Beautiful Mermaid renders Mermaid fences as SVG during the build, so diagrams need no browser JavaScript. Existing SVG assets remain in `public/images/`.

`src/App.tsx` selects the page layout. The home, header, navigation, reading layout, and appearance controls live in `src/components/`. `src/components/Search.tsx` connects Pagefind's existing UI to a Radix dialog and loads only when search opens. `src/lib/content.ts` validates page metadata at the rendering boundary. `src/lib/reader.ts` stores bookmarks and completed articles in this browser. Clearing browser storage removes those preferences.

`src/styles/site.css` owns the responsive layout and typography. `src/styles/diagrams.css` defines shared diagram colors. `src/styles/learning.css` and `public/js/site.js` preserve the existing chapter walkthroughs and connection-budget calculator. The chapter script loads only when the page contains those examples. Each example must remain readable without JavaScript and in print.

The content pipeline lives in `scripts/content.mjs`. `scripts/build.mjs` builds the client, renders pages through React's server renderer at build time, and creates the Pagefind index. `scripts/dev.mjs` uses Vite's middleware and server renderer for local development. Only `dist/` is deployed. `.cache/` contains disposable build state.

The Agentic AI question bank lives in `research/agentic-ai-interview-questions.md`. `scripts/build-agentic-ai-question-map.mjs` generates its coverage map. Diagram sources live in `diagrams/source/agentic-ai/`; articles embed SVG exports from `public/images/agentic-ai/vector/`.

## Deploy to Cloudflare Pages

Connect the repository to Cloudflare Pages and use:

- Build command: `pnpm build`
- Output directory: `dist`
- Node version: 22.12 or newer

Keep `SITE_BASE` unset for a root deployment. Optionally set `SITE_URL` to your production origin, such as `https://your-site.pages.dev`, to generate canonical URLs, Open Graph URLs, and a sitemap.

All routes have their own `index.html`. `404.html` handles missing pages. The site requires no Pages Functions or Workers. Use the provided `pages.dev` address to avoid buying a domain.

## Deploy to GitHub Pages

The included `.github/workflows/pages.yml` builds and deploys the site when you manually run it. In repository settings, choose **Pages → Build and deployment → GitHub Actions**. Open **Actions → Deploy handbook to GitHub Pages → Run workflow** to publish. The workflow uses the public repository's free Pages hosting.

The workflow derives the base path from GitHub's Pages configuration, including project subdirectories. To verify a project path locally:

```sh
SITE_BASE=/dev-handbook/ pnpm build
SITE_BASE=/dev-handbook/ node scripts/check-site.mjs
SITE_BASE=/dev-handbook/ pnpm preview
```

Open `http://localhost:4173/dev-handbook/`. Links, article images, assets, search, and chapter controls respect `SITE_BASE`. The build adds `.nojekyll`. It produces real HTML files for deep links, so refreshing an article does not need an SPA routing workaround.

Hosting can stay free using a provider subdomain and static assets. Adding paid APIs, storage, or a custom domain would introduce separate costs.
