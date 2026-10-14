import { z } from "zod/mini";

export const articleSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  section: z.string(),
  minutes: z.number(),
  headings: z.array(
    z.object({ id: z.string(), title: z.string(), level: z.number() }),
  ),
});
export type Article = z.infer<typeof articleSchema>;
export type NavItem =
  { label: string; slug: string } | { label: string; items: NavItem[] };
const navSchema: z.ZodMiniType<NavItem> = z.lazy(() =>
  z.union([
    z.object({ label: z.string(), slug: z.string() }),
    z.object({ label: z.string(), items: z.array(navSchema) }),
  ]),
);
export const pageSchema = z.object({
  article: articleSchema,
  navigation: z.array(navSchema),
  previous: z.nullable(articleSchema),
  next: z.nullable(articleSchema),
  count: z.number(),
  base: z.string(),
  kind: z.enum(["home", "article", "not-found"]),
});
export type Page = z.infer<typeof pageSchema>;
export type PageWithContent = Page & { html: string };
export function href(base: string, slug: string) {
  return `${base}${slug ? `${slug}/` : ""}`;
}
export function containsArticle(item: NavItem, slug: string): boolean {
  return "slug" in item
    ? item.slug === slug
    : item.items.some((child) => containsArticle(child, slug));
}

export function parsePage(data: unknown): Page {
  return z.parse(pageSchema, data);
}
