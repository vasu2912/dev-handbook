import { useEffect, useState } from "react";
import { z } from "zod/mini";
const readerSchema = z.object({
  bookmarks: z.array(z.string()),
  completed: z.array(z.string()),
});
const emptyReader = { bookmarks: [], completed: [] } satisfies z.infer<
  typeof readerSchema
>;
export function useReader() {
  const [reader, setReader] =
    useState<z.infer<typeof readerSchema>>(emptyReader);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const parsed = z.safeParse(
        readerSchema,
        JSON.parse(localStorage.getItem("handbook-reader") || "null"),
      );
      if (parsed.success) setReader(parsed.data);
    } catch {
      /* Reading controls still work when storage is unavailable. */
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("handbook-reader", JSON.stringify(reader));
    } catch {
      /* Keep in-memory preferences for this visit. */
    }
  }, [reader, loaded]);
  function toggle(kind: "bookmarks" | "completed", slug: string) {
    setReader((current) => {
      const values = current[kind];
      return {
        ...current,
        [kind]: values.includes(slug)
          ? values.filter((value) => value !== slug)
          : [...values, slug],
      };
    });
  }
  return { reader, toggle };
}

export type ReaderControls = ReturnType<typeof useReader>;
