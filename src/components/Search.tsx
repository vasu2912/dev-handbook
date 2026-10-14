import { useEffect, useRef, useState } from "react";
import { PagefindUI } from "@pagefind/default-ui";
import "@pagefind/default-ui/css/ui.css";
export default function Search({ base }: { base: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState<
    "loading" | "ready" | "unavailable"
  >("loading");
  useEffect(() => {
    let active = true;
    let ui: PagefindUI | undefined;
    void fetch(`${base}pagefind/pagefind.js`, { method: "HEAD" })
      .then((response) => {
        if (!response.ok) throw new Error("Search index unavailable");
        if (!active || !container.current) return;
        ui = new PagefindUI({
          element: container.current,
          bundlePath: `${base}pagefind/`,
          baseUrl: base,
          showSubResults: true,
          showImages: false,
          autofocus: true,
          translations: {
            placeholder: "Search concepts, guides, and examples…",
          },
        });
        setAvailable("ready");
      })
      .catch(() => {
        if (active) setAvailable("unavailable");
      });
    return () => {
      active = false;
      ui?.destroy();
    };
  }, [base]);
  return (
    <>
      <div ref={container} />
      {available === "loading" && <p role="status">Loading search…</p>}
      {available === "unavailable" && (
        <p role="status">
          {import.meta.env.DEV ? (
            <>
              Search is available in the production build. Run{" "}
              <code>pnpm build</code> and <code>pnpm preview</code> to try it
              locally.
            </>
          ) : (
            <>
              Search could not load. Check your connection and reopen search to
              try again.
            </>
          )}
        </p>
      )}
    </>
  );
}
