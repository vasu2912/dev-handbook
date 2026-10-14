import { createServer } from "vite";
import { createServer as createHttpServer } from "node:http";
import { readFile } from "node:fs/promises";
import { compileContent, siteBase } from "./content.mjs";
import { documentFor } from "./html.mjs";
let pages = await compileContent();
const base = siteBase();
const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});
let recompiling = Promise.resolve();
vite.watcher.add(["src/content/docs", "src/navigation.json"]);
vite.watcher.on("all", (_event, file) => {
  if (!file.includes("/content/docs/") && !file.endsWith("/navigation.json"))
    return;
  recompiling = recompiling
    .then(async () => {
      pages = await compileContent();
      vite.ws.send({ type: "full-reload" });
    })
    .catch((error) => {
      console.error(error);
      vite.ws.send({
        type: "error",
        err: { message: error.message, stack: error.stack },
      });
    });
});
const server = createHttpServer((req, res) => {
  vite.middlewares(req, res, async () => {
    try {
      const pathname = new URL(req.url, "http://localhost").pathname;
      const slug = pathname.startsWith(base)
        ? pathname.slice(base.length).replace(/\/$/, "")
        : null;
      const page =
        pages.find(
          (page) => page.article.slug === slug && page.kind !== "not-found",
        ) || pages.at(-1);
      const template = await vite.transformIndexHtml(
        req.url,
        await readFile("index.html", "utf8"),
      );
      const { render } = await vite.ssrLoadModule("/src/entry-server.tsx");
      res.writeHead(page.kind === "not-found" ? 404 : 200, {
        "Content-Type": "text/html",
      });
      res.end(documentFor({ template, page, render }));
    } catch (error) {
      vite.ssrFixStacktrace(error);
      console.error(error);
      res.writeHead(500);
      res.end("Unable to render this page. See the development server log.");
    }
  });
});
const port = Number(process.env.PORT || 5173);
server.listen(port, "127.0.0.1", () =>
  console.info(`Dev Handbook: http://localhost:${port}${base}`),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, async () => {
    await vite.close();
    server.close();
    process.exit(0);
  });
