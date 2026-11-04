import { useEffect, useRef, useState } from "react";
import type { Article } from "../lib/content";
import { onScrollFrame } from "../lib/scroll";

// A heading becomes current once it scrolls above this line. It sits just
// below where anchor links land (html scroll-padding-top is 90px).
const activationLine = 130;

export function OnThisPage({ headings }: { headings: Article["headings"] }) {
  const [activeId, setActiveId] = useState<string>();
  const railRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const targets = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null);
    if (!targets.length) return;
    return onScrollFrame(() => {
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      let current: string | undefined;
      if (atBottom) current = targets[targets.length - 1]?.id;
      else
        for (const target of targets) {
          if (target.getBoundingClientRect().top > activationLine) break;
          current = target.id;
        }
      setActiveId(current);
    });
  }, [headings]);

  useEffect(() => {
    // Keep the current entry visible when the list is taller than the rail.
    const rail = railRef.current;
    if (!rail || !activeId || rail.scrollHeight <= rail.clientHeight) return;
    const link = Array.from(
      rail.querySelectorAll<HTMLAnchorElement>("a[data-heading]"),
    ).find((element) => element.dataset.heading === activeId);
    if (!link) return;
    const top = link.offsetTop;
    const bottom = top + link.offsetHeight;
    if (top < rail.scrollTop || bottom > rail.scrollTop + rail.clientHeight)
      rail.scrollTop = top - rail.clientHeight / 3;
  }, [activeId]);

  return (
    <nav
      ref={railRef}
      className="toc-rail"
      aria-labelledby="toc-rail-title"
      data-pagefind-ignore
    >
      <p id="toc-rail-title" className="toc-rail-title">
        On this page
      </p>
      <ul>
        {headings.map((heading) => (
          <li key={heading.id} data-level={heading.level}>
            <a
              href={`#${heading.id}`}
              data-heading={heading.id}
              aria-current={heading.id === activeId ? "location" : undefined}
            >
              {heading.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const body = document.getElementById("article-body");
    const bar = barRef.current;
    if (!body || !bar) return;
    return onScrollFrame(() => {
      // 0 at the top of the page, 1 once the article's end reaches the
      // bottom of the viewport.
      const remaining =
        body.getBoundingClientRect().bottom - window.innerHeight;
      const total = window.scrollY + remaining;
      const read = total > 0 ? window.scrollY / total : 1;
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, read))})`;
    });
  }, []);

  return <div ref={barRef} className="reading-progress" aria-hidden="true" />;
}
