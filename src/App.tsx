import { ArrowRightIcon } from "@radix-ui/react-icons";
import type { PageWithContent } from "./lib/content";
import { useReader } from "./lib/reader";
import { Header } from "./components/Header";
import { Home } from "./components/Home";
import { ReadingLayout } from "./components/ReadingLayout";
export function App({ page }: { page: PageWithContent }) {
  const controls = useReader();
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header page={page} {...controls} />
      {page.kind === "home" ? (
        <Home page={page} />
      ) : page.kind === "not-found" ? (
        <main id="main" className="not-found">
          <p className="eyebrow">404</p>
          <h1>This page isn't here.</h1>
          <p>Find your next topic in the handbook.</p>
          <a className="button-primary" href={page.base}>
            Explore the handbook <ArrowRightIcon />
          </a>
        </main>
      ) : (
        <ReadingLayout page={page} {...controls} />
      )}
    </>
  );
}
