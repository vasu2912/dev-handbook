// index.html applies the stored values before first paint. Keep its allowed
// sizes and storage keys in step with this file.
export const themeKey = "handbook-theme";
export const sizeKey = "handbook-type-size";

export const readingSizes = [
  { label: "Small", value: "15px" },
  { label: "Default", value: "17px" },
  { label: "Large", value: "19px" },
] as const;

export type Theme = "light" | "dark";
export type ReadingSize = (typeof readingSizes)[number]["value"];

export const defaultReadingSize: ReadingSize = "17px";

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export function isReadingSize(value: unknown): value is ReadingSize {
  return readingSizes.some((size) => size.value === value);
}
