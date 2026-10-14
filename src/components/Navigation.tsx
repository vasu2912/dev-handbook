import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
import {
  containsArticle,
  href,
  type NavItem,
  type PageWithContent,
} from "../lib/content";
export function flatten(items: NavItem[]): { label: string; slug: string }[] {
  return items.flatMap((item) =>
    "slug" in item ? [item] : flatten(item.items),
  );
}
function Navigation({
  items,
  slug,
  base,
  completed,
}: {
  items: NavItem[];
  slug: string;
  base: string;
  completed: string[];
}) {
  return (
    <ul className="nav-tree">
      {items.map((item) => (
        <li key={item.label}>
          {"slug" in item ? (
            <a
              href={href(base, item.slug)}
              aria-current={item.slug === slug ? "page" : undefined}
            >
              <span>{item.label}</span>
              {completed.includes(item.slug) && <CheckIcon aria-label="Read" />}
            </a>
          ) : (
            <details open={containsArticle(item, slug) || undefined}>
              <summary>
                {item.label}
                <ChevronDownIcon aria-hidden="true" />
              </summary>
              <Navigation
                items={item.items}
                slug={slug}
                base={base}
                completed={completed}
              />
            </details>
          )}
        </li>
      ))}
    </ul>
  );
}
export function Sidebar({
  page,
  completed,
}: {
  page: PageWithContent;
  completed: string[];
}) {
  return (
    <>
      <a className="sidebar-home" href={page.base}>
        <ArrowLeftIcon /> Explore the handbook
      </a>

      <Navigation
        items={page.navigation}
        slug={page.article.slug}
        base={page.base}
        completed={completed}
      />
      <div className="sidebar-footer">Free to read. Open to everyone.</div>
    </>
  );
}
