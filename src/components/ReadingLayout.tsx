import { useEffect } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookmarkIcon,
  BookmarkFilledIcon,
  CheckIcon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
import { containsArticle, href, type PageWithContent } from "../lib/content";
import type { ReaderControls } from "../lib/reader";
import { Sidebar } from "./Navigation";
export function ReadingLayout({
  page,
  reader,
  toggle,
}: { page: PageWithContent } & ReaderControls) {
  const section = page.navigation.find((item) =>
    containsArticle(item, page.article.slug),
  );
  useEffect(() => {
    function copy(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest("button.copy-code");
      if (!(button instanceof HTMLButtonElement)) return;
      const code = button.parentElement?.querySelector("code")?.textContent;
      if (code)
        void navigator.clipboard
          .writeText(code)
          .then(() => {
            button.textContent = "Copied";
            setTimeout(() => {
              button.textContent = "Copy";
            }, 1500);
          })
          .catch(() => {
            button.textContent = "Select to copy";
          });
    }
    document.addEventListener("click", copy);
    return () => document.removeEventListener("click", copy);
  }, []);
  return (
    <div className="reading-layout">
      <aside className="sidebar" aria-label="Handbook navigation">
        <Sidebar page={page} completed={reader.completed} />
      </aside>
      <main id="main" className="reading-main">
        <article data-pagefind-body>
          <header className="article-header">
            <div className="breadcrumb">
              <a href={page.base}>Handbook</a>
              <span>/</span>
              <span>{section?.label}</span>
            </div>
            <h1 data-pagefind-meta="title">{page.article.title}</h1>
            <p className="article-description">{page.article.description}</p>
            <div className="article-meta">
              <span>{page.article.minutes} min read</span>
              <span className="meta-separator">·</span>
              <span>Dev Handbook</span>
              <button
                className="bookmark-button"
                aria-label={
                  reader.bookmarks.includes(page.article.slug)
                    ? "Saved. Remove bookmark"
                    : "Save for later"
                }
                aria-pressed={reader.bookmarks.includes(page.article.slug)}
                onClick={() => toggle("bookmarks", page.article.slug)}
              >
                {reader.bookmarks.includes(page.article.slug) ? (
                  <BookmarkFilledIcon />
                ) : (
                  <BookmarkIcon />
                )}
                <span>
                  {reader.bookmarks.includes(page.article.slug)
                    ? "Saved"
                    : "Save for later"}
                </span>
              </button>
            </div>
          </header>
          {page.article.headings.length > 0 && (
            <details className="article-toc" data-pagefind-ignore>
              <summary>
                In this article <ChevronDownIcon />
              </summary>
              <ul>
                {page.article.headings.map((heading) => (
                  <li key={heading.id}>
                    <a href={`#${heading.id}`}>{heading.title}</a>
                  </li>
                ))}
              </ul>
            </details>
          )}
          <div
            id="article-body"
            className="prose"
            dangerouslySetInnerHTML={{ __html: page.html }}
          />
          <div className="article-completion" data-pagefind-ignore>
            <div>
              <strong>Keep track of your reading.</strong>
              <p>Your reading progress stays in this browser.</p>
            </div>
            <button
              className={`button-secondary ${reader.completed.includes(page.article.slug) ? "is-complete" : ""}`}
              aria-pressed={reader.completed.includes(page.article.slug)}
              onClick={() => toggle("completed", page.article.slug)}
            >
              <CheckIcon />
              {reader.completed.includes(page.article.slug)
                ? "Marked as read"
                : "Mark as read"}
            </button>
          </div>
        </article>
        <nav className="article-pagination" aria-label="Continue reading">
          {page.previous ? (
            <a href={href(page.base, page.previous.slug)}>
              <span>
                <ArrowLeftIcon /> Previous
              </span>
              <strong>{page.previous.title}</strong>
            </a>
          ) : (
            <div />
          )}
          {page.next && (
            <a href={href(page.base, page.next.slug)}>
              <span>
                Up next <ArrowRightIcon />
              </span>
              <strong>{page.next.title}</strong>
            </a>
          )}
        </nav>
        <footer className="article-footer">
          Free to read. Open to everyone.
        </footer>
      </main>
    </div>
  );
}
