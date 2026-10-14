import { renderToString } from "react-dom/server";
import { App } from "./App";
import { parsePage } from "./lib/content";
export function render(data: unknown, html: string) {
  return renderToString(<App page={{ ...parsePage(data), html }} />);
}
