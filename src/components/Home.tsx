import { ArrowRightIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { href, type NavItem, type PageWithContent } from "../lib/content";
import type { ReaderControls } from "../lib/reader";
import { openSearch } from "./Header";

type Leaf = { label: string; slug: string };
function leaves(item: NavItem): Leaf[] {
  return "slug" in item ? [item] : item.items.flatMap(leaves);
}

const photo = {
  src: "images/home/switchboard.jpg",
  width: 1920,
  height: 1526,
  credit:
    "https://commons.wikimedia.org/wiki/File:Photograph_of_Women_Working_at_a_Bell_System_Telephone_Switchboard_(3660047829).jpg",
};

export function Home({
  page,
  reader,
}: { page: PageWithContent } & Pick<ReaderControls, "reader">) {
  const base = page.base;
  const shelves = page.navigation
    .filter((item) => "items" in item)
    .map((item) => ({ label: item.label, guides: leaves(item) }));
  const done = new Set(reader.completed);
  const saved = shelves
    .flatMap((shelf) => shelf.guides)
    .filter((guide) => reader.bookmarks.includes(guide.slug));

  return (
    <main id="main" className="landing">
      <section className="cover" aria-labelledby="landing-title">
        <img
          className="cover-photo"
          src={`${base}${photo.src}`}
          width={photo.width}
          height={photo.height}
          alt="Rows of telephone operators routing calls by hand at a Bell System switchboard."
        />
        <div className="cover-copy">
          <h1 id="landing-title">How backends really work</h1>
          <p>
            {page.count} free guides to backend engineering. Read them in order,
            or look one thing up.
          </p>
          <button type="button" className="cover-search" onClick={openSearch}>
            <MagnifyingGlassIcon />
            <span>Search the handbook</span>
            <kbd>⌘ K</kbd>
          </button>
          <a
            className="cover-start"
            href={href(base, "guides/request-lifecycle")}
          >
            New here? Follow one request from browser to database{" "}
            <ArrowRightIcon />
          </a>
        </div>
      </section>

      {saved.length > 0 && (
        <section className="saved" aria-labelledby="saved-title">
          <h2 id="saved-title">Your reading list</h2>
          <ul>
            {saved.map((guide) => (
              <li key={guide.slug}>
                <a href={href(base, guide.slug)}>{guide.label}</a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section
        id="explore"
        className="contents"
        aria-labelledby="contents-title"
      >
        <div className="contents-heading">
          <h2 id="contents-title">Contents</h2>
          <p>
            {page.count} guides on {shelves.length} shelves
            {done.size > 0 && `, ${done.size} read`}
          </p>
        </div>
        <div className="shelf-grid">
          {shelves.map((shelf) => {
            const first = shelf.guides[0];
            if (!first) return null;
            const read = shelf.guides.filter((guide) =>
              done.has(guide.slug),
            ).length;
            const shown = shelf.guides.slice(0, 6);
            return (
              <article key={shelf.label} className="shelf">
                <h3>
                  <a href={href(base, first.slug)}>{shelf.label}</a>
                </h3>
                <p className="shelf-meta">
                  {shelf.guides.length} guides
                  {read > 0 && ` · ${read} read`}
                </p>
                <ul>
                  {shown.map((guide) => (
                    <li
                      key={guide.slug}
                      data-read={done.has(guide.slug) || undefined}
                    >
                      <a href={href(base, guide.slug)}>{guide.label}</a>
                    </li>
                  ))}
                </ul>
                {shelf.guides.length > shown.length && (
                  <a className="shelf-more" href={href(base, first.slug)}>
                    Open the shelf <ArrowRightIcon />
                  </a>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <footer className="landing-footer">
        <p>
          Dev Handbook. Free to read, no account. Your reading list and progress
          stay in this browser.
        </p>
        <p>
          Cover:{" "}
          <a href={photo.credit} rel="noreferrer">
            Bell System telephone switchboard
          </a>
          , U.S. National Archives, no known copyright restrictions.
        </p>
      </footer>
    </main>
  );
}
