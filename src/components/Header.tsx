import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ReaderIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  Cross2Icon,
  ArrowRightIcon,
  HamburgerMenuIcon,
} from "@radix-ui/react-icons";
import { href, type PageWithContent } from "../lib/content";
import type { ReaderControls } from "../lib/reader";
import { Appearance } from "./Appearance";
import { Sidebar, flatten } from "./Navigation";
const Search = lazy(() => import("./Search"));
function ModalFrame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="dialog-overlay" />
      <Dialog.Content className="dialog-content">
        <div className="dialog-heading">
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Close className="icon-button" aria-label="Close">
            <Cross2Icon />
          </Dialog.Close>
        </div>
        <Dialog.Description className="dialog-description">
          {description}
        </Dialog.Description>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}
export function Header({
  page,
  reader,
  toggle,
}: { page: PageWithContent } & ReaderControls) {
  const [searchOpen, setSearchOpen] = useState(false);
  const isArticle = page.kind === "article";
  const saved = flatten(page.navigation).filter((item) =>
    reader.bookmarks.includes(item.slug),
  );
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    }
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, []);
  return (
    <header className="site-header">
      <a className="brand" href={page.base}>
        <span className="brand-icon">
          <ReaderIcon />
        </span>
        Dev Handbook
      </a>
      <nav className="header-nav" aria-label="Main">
        <a href={`${page.base}#explore`}>Explore</a>
        <a href={href(page.base, "guides/how-to-use-this-handbook")}>
          Start here
        </a>
      </nav>
      <div className="header-actions">
        <Dialog.Root open={searchOpen} onOpenChange={setSearchOpen}>
          <Dialog.Trigger
            className="search-trigger"
            aria-label="Search the handbook"
          >
            <MagnifyingGlassIcon />
            <span>Search the handbook</span>
            <kbd>⌘ K</kbd>
          </Dialog.Trigger>
          <ModalFrame
            title="Search the handbook"
            description="Find an explanation, a worked example, or a detail."
          >
            <Suspense fallback={<p role="status">Loading search…</p>}>
              <Search base={page.base} />
            </Suspense>
          </ModalFrame>
        </Dialog.Root>
        <Dialog.Root>
          <Dialog.Trigger className="icon-button" aria-label="Reading list">
            <BookmarkIcon />
          </Dialog.Trigger>
          <ModalFrame
            title="Your reading list"
            description="Saved in this browser. No account needed."
          >
            {saved.length ? (
              <ul className="saved-list">
                {saved.map((item) => (
                  <li key={item.slug}>
                    <a href={href(page.base, item.slug)}>
                      {item.label}
                      <ArrowRightIcon />
                    </a>
                    <button
                      className="icon-button"
                      onClick={() => toggle("bookmarks", item.slug)}
                      aria-label={`Remove ${item.label}`}
                    >
                      <Cross2Icon />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <BookmarkIcon />
                <p>A place for your next read.</p>
                <span>Save any article using its bookmark button.</span>
              </div>
            )}
          </ModalFrame>
        </Dialog.Root>
        <Appearance />
        {isArticle && (
          <Dialog.Root>
            <Dialog.Trigger
              className="icon-button mobile-menu"
              aria-label="Open navigation"
            >
              <HamburgerMenuIcon />
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="dialog-overlay" />
              <Dialog.Content className="mobile-navigation">
                <div className="dialog-heading">
                  <Dialog.Title>Browse the handbook</Dialog.Title>
                  <Dialog.Close
                    className="icon-button"
                    aria-label="Close navigation"
                  >
                    <Cross2Icon />
                  </Dialog.Close>
                </div>
                <Dialog.Description className="sr-only">
                  Topics and learning paths
                </Dialog.Description>
                <Sidebar page={page} completed={reader.completed} />
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
      </div>
    </header>
  );
}
