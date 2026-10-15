import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { load } from "cheerio";
import { compileContent } from "../content.mjs";
import { standaloneArt } from "../figures/anatomy.mjs";

const inventory = JSON.parse(
  await readFile(
    new URL("../figures/anatomy-inventory.json", import.meta.url),
    "utf8",
  ),
);

test("articles render inspectable Anatomy figures with static explanations under both hosting bases", async () => {
  const original = process.env.SITE_BASE;
  try {
    for (const base of ["/", "/dev-handbook/"]) {
      process.env.SITE_BASE = base;
      const pages = await compileContent();
      for (const slug of new Set(inventory.map((item) => item.slug))) {
        const page = pages.find((page) => page.article.slug === slug);
        assert(page, slug);
        const $ = load(page.html);
        assert.equal(
          $("[data-anatomy]").length,
          0,
          `${slug}: resolve placeholders`,
        );
        const expected = inventory.filter((item) => item.slug === slug);
        assert.deepEqual(
          $("[data-anatomy-figure]")
            .toArray()
            .map((node) => $(node).attr("data-anatomy-figure")),
          expected.map((item) => item.id),
          `${slug}: preserve each figure in reading order`,
        );
        const ids = $("[id]")
          .toArray()
          .map((node) => $(node).attr("id"));
        assert.equal(new Set(ids).size, ids.length, `${slug}: unique IDs`);
        $("[data-anatomy-figure]").each((_, node) => {
          const figure = $(node);
          const svg = figure.find("svg");
          assert.equal(svg.length, 1, slug);
          assert(svg.attr("viewBox"), slug);
          assert.equal(svg.attr("role"), "img", slug);
          assert(
            svg.attr("aria-label")?.trim() || svg.find("title").text().trim(),
            `${slug}: accessible description`,
          );
          assert(svg.hasClass("diagram-svg"), slug);
          assert(!svg.html().includes("base64"), `${slug}: use site font`);
          assert.equal(
            figure.find(".anatomy-controls[hidden]").length,
            1,
            `${slug}: controls wait for hydration`,
          );
          const panels = figure.find("[data-anatomy-panel]");
          assert(panels.length > 0, slug);
          assert.equal(
            panels.filter("[hidden]").length,
            0,
            `${slug}: explanations work without JavaScript`,
          );
          const options = figure.find("[data-anatomy-select] option");
          assert.equal(
            options.length,
            panels.length,
            `${slug}: each explanation is selectable`,
          );
          panels.each((_, panel) =>
            assert($(panel).find("p").text().trim(), slug),
          );
          options.each((_, option) => {
            const target = $(option).attr("data-target");
            assert(
              figure.find(`[data-anatomy-part="${target}"]`).length,
              `${slug}: selection targets a drawn part`,
            );
          });
          figure.find("[data-anatomy-moving]").each((_, part) => {
            assert(Number.isFinite(Number($(part).attr("data-dx"))), slug);
            assert(Number.isFinite(Number($(part).attr("data-dy"))), slug);
          });
        });
      }
      const loop = load(
        pages.find(
          (page) => page.article.slug === "agentic-ai/agents/agent-loop",
        ).html,
      );
      assert.match(
        loop(".anatomy-explanation").text(),
        /Application code validates and authorizes/,
      );
      assert.equal(
        pages.filter((page) =>
          page.html?.includes('data-figure="token-bucket"'),
        ).length,
        1,
      );
    }
  } finally {
    if (original === undefined) delete process.env.SITE_BASE;
    else process.env.SITE_BASE = original;
  }
});

test("public Anatomy SVGs match their sources and include readable explanations", async () => {
  for (const item of inventory.filter((item) => item.asset)) {
    const source = await readFile(
      new URL(`../../public${item.asset}`, import.meta.url),
      "utf8",
    );
    assert.equal(source.trim(), standaloneArt(item.id), item.asset);
    const $ = load(source, { xmlMode: true });
    assert.equal($("svg").length, 1, item.asset);
    assert($("title").text().trim(), item.asset);
    assert($("desc").text().trim(), item.asset);
    assert($("text").length > 0, item.asset);
    assert.equal($("svg").attr("role"), "img", item.asset);
  }
});
