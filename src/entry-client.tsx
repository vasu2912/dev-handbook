import { hydrateRoot } from "react-dom/client";
import { App } from "./App";
import { parsePage } from "./lib/content";
import "./styles/fonts.css";
import "./styles/site.css";
import "./styles/learning.css";
const root = document.getElementById("root");
const data = document.getElementById("page-data");
if (root && data) {
  const page = parsePage(JSON.parse(data.textContent || "null"));
  const html = document.getElementById("article-body")?.innerHTML || "";
  hydrateRoot(root, <App page={{ ...page, html }} />);
  if (document.querySelector(".walkthrough, .pool-budget")) {
    const script = document.createElement("script");
    script.src = `${page.base}js/site.js`;
    document.body.append(script);
  }
}
