## Repository skills

Use the matching skill in `.agents/skills` before starting work in this repository.

- `unslop`: apply to user-facing responses and prose changes.
- `typescript-best-practices`: read before editing `.ts` or `.tsx` files.
- `tdd`: read for test-first feature work, bug fixes, or integration tests.
- `diagnosing-bugs`: read when diagnosing broken, failing, or slow behavior.
- `principle-boundary-discipline`: read when handling input validation, errors, or framework adapters.
- `codebase-design`: read when shaping module interfaces, seams, testability, or navigation.
- `grilling`: use for live decision interviews that must expose unsettled branches before work starts.
- `improve-codebase-architecture`: read when restructuring repository architecture.
- `domain-modeling`: read when establishing terms, `CONTEXT.md`, or ADRs.
- `writing-for-agents`: read before changing agent documentation or skills.
- `technical-writing`: read before writing or reviewing technical documentation, RFCs, READMEs, or architecture documents.
- `wayfinder`: use for product-scale planning that needs a shared map of decision tickets before implementation planning.
- `implement`: use when implementing an approved specification or ticket set.
- `code-review`: use when reviewing changes against repository standards and their originating specification.
- `to-spec`: use when turning the current discussion into a specification.
- `to-tickets`: use when splitting a plan or specification into dependency-aware tickets.

## Development

Use `pnpm dev` for the React and Vite development server. Run long-lived servers in background mode and keep their process ID and log path available for stopping and inspection.

Use `pnpm check` before completing a migration or content change. This checks TypeScript, builds the static site, and verifies rendered pages, internal links, anchors, and local assets.

## Site architecture

Articles stay in `src/content/docs/` as Markdown. `src/navigation.json` controls the reading order. Keep existing article paths and heading anchors stable.

The build compiles Markdown, syntax highlighting, and Mermaid diagrams before rendering React into static HTML. Reader controls hydrate in the browser. Keep content parsers and diagram renderers out of the client bundle.

Use Radix for dialogs and menus, and Pagefind for search. The site must work on static hosting without authentication, paid APIs, or a server runtime. Verify both `/` and a `SITE_BASE` such as `/dev-handbook/` when changing paths or deployment behavior.

Consult the official [React documentation](https://react.dev/), [Vite documentation](https://vite.dev/guide/), [Radix documentation](https://www.radix-ui.com/primitives/docs/overview/introduction), and [Pagefind documentation](https://pagefind.app/docs/) for related changes.
