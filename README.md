# Dev Handbook

An open learning library built with React, Vite, and TypeScript. Every article is generated as HTML during the build. Readers can view the content without JavaScript, while React adds bookmarks, reading completion, appearance controls, and accessible dialogs. There is no authentication, database, or production server.

## Develop locally

Use Node 24 or newer. `.node-version` records the Node major for builds, and `package.json` pins pnpm through `packageManager`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:5173`. React and CSS changes use Vite hot reload. Markdown and navigation changes rebuild the content and reload the page. The development server binds to localhost. Set `PORT` to change its port.

Full-text search uses the generated production index. To try it locally:

```sh
pnpm build
pnpm preview
```

Run `pnpm check` to test the figures, check TypeScript, build the site, and audit every rendered page, internal link, heading anchor, and local asset. Run `pnpm test` for the tests alone.

## Contribute

Keep changes focused and preserve existing article routes and heading anchors. Before opening a pull request, run:

```sh
pnpm check
```

For changes to paths or deployment behavior, also run `SITE_BASE=/dev-handbook/ pnpm check`. Run checks sequentially because they share generated files in `.cache/` and `dist/`. Include the reason for your change and the checks you ran in the pull request description.

Commit source files and `pnpm-lock.yaml`. Build output, dependencies, local logs, and environment files are ignored. Design studies live in `diagrams/branding/` so the production build does not copy them into `dist/`.

## Push to GitHub

Create an empty GitHub repository without a README or other initial files. After reviewing and committing your local changes, connect that repository and push:

```sh
git remote add origin https://github.com/YOUR_USERNAME/dev-handbook.git
git push -u origin main
```

Replace `YOUR_USERNAME` and the repository name with your own. GitHub stores the source. Cloudflare Pages builds and deploys it through its Git integration. No GitHub Actions workflow runs automatically on pushes or pull requests.

## Edit the handbook

Articles live in `src/content/docs/`. Keep Markdown frontmatter with a `title` and `description`. File names determine routes. For example, `system-design/index.md` becomes `/system-design/`, and `system-design/caching.md` becomes `/system-design/caching/`.

`src/navigation.json` preserves the reading sequence and nested topics. Add new articles to this navigation, or to a directory covered by an `autogenerate` entry. The build rejects missing destinations and articles that readers cannot reach through navigation.

Markdown supports tables, fenced code, raw HTML, and Starlight-style `:::tip[Title]`, `:::note`, `:::caution`, and `:::danger` callouts. Shiki highlights code during the build. Beautiful Mermaid renders Mermaid fences as SVG during the build, so diagrams need no browser JavaScript. Existing SVG assets remain in `public/images/`.

`src/App.tsx` selects the page layout. The home, header, navigation, reading layout, and appearance controls live in `src/components/`. `src/components/Search.tsx` connects Pagefind's existing UI to a Radix dialog and loads only when search opens. `src/lib/content.ts` validates page metadata at the rendering boundary. `src/lib/reader.ts` stores bookmarks and completed articles in this browser. Clearing browser storage removes those preferences.

`src/styles/site.css` owns the responsive layout and typography. `src/styles/diagrams.css` defines shared diagram colors. `src/styles/learning.css` and `public/js/site.js` preserve the existing chapter walkthroughs and connection-budget calculator. The chapter script loads only when the page contains those examples. Each example must remain readable without JavaScript and in print.

The rate-limiting article embeds its interactive figure with `<div data-figure="token-bucket"></div>`. `scripts/figures/token-bucket.mjs` generates the SVG and scoped styles with the vendored Anatomy drawing kit. `src/figures/token-bucket/model.ts` owns credit accounting, and `live.ts` attaches the controls when the figure approaches the viewport. The controller pauses simulation time offscreen and in background tabs. Reduced motion keeps request, burst, refill, and reset controls available without animated traffic. Print shows the starting state. Unknown figure names fail the build.

The Anatomy files are pinned to the upstream commit recorded in `scripts/figures/vendor/anatomy/README.md`. Preserve its MIT notice in that directory and `public/licenses/anatomy.txt` when updating the kit. Keep the drawing kit out of browser imports.

The content pipeline lives in `scripts/content.mjs`. `scripts/build.mjs` builds the client, renders pages through React's server renderer at build time, and creates the Pagefind index. `scripts/dev.mjs` uses Vite's middleware and server renderer for local development. Only `dist/` is deployed. `.cache/` contains disposable build state.

The Agentic AI question bank lives in `research/agentic-ai-interview-questions.md`. `scripts/build-agentic-ai-question-map.mjs` generates its coverage map. Diagram sources live in `diagrams/source/agentic-ai/`; articles embed SVG exports from `public/images/agentic-ai/vector/`.

## Deploy to Cloudflare Pages

Cloudflare Pages is the primary deployment target. Connect the GitHub repository through [Cloudflare's Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/) and use:

- Production branch: `main`
- Build command: `pnpm check`
- Output directory: `dist`
- Node version: 24 or newer

Keep `SITE_BASE` unset for a root deployment. Optionally set `SITE_URL` to your production origin, such as `https://your-site.pages.dev`, to generate canonical URLs, Open Graph URLs, and a sitemap.

Cloudflare builds and deploys pushes to the production branch. The build command runs tests, checks TypeScript, builds the site, and verifies the generated pages before deployment. GitHub Actions is not required.

All routes have their own `index.html`. `404.html` handles missing pages. The site requires no Pages Functions or Workers. Use the provided `pages.dev` address to avoid buying a domain.

## Optional deployment to GitHub Pages

The included `.github/workflows/pages.yml` runs only when manually triggered. Leave it unused while deploying through Cloudflare. If you choose GitHub Pages later, select **Pages → Build and deployment → GitHub Actions** in repository settings. Open **Actions → Deploy handbook to GitHub Pages → Run workflow** to publish.

The workflow derives the base path from GitHub's Pages configuration, including project subdirectories. To verify a project path locally:

```sh
SITE_BASE=/dev-handbook/ pnpm build
SITE_BASE=/dev-handbook/ node scripts/check-site.mjs
SITE_BASE=/dev-handbook/ pnpm preview
```

Open `http://localhost:4173/dev-handbook/`. Links, article images, assets, search, and chapter controls respect `SITE_BASE`. The build adds `.nojekyll`. It produces real HTML files for deep links, so refreshing an article does not need an SPA routing workaround.

Hosting can stay free using a provider subdomain and static assets. Adding paid APIs, storage, or a custom domain would introduce separate costs.
