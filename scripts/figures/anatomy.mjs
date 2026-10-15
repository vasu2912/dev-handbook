import { readFile, stat } from "node:fs/promises";
import * as k from "./vendor/anatomy/iso-kit.mjs";
const specSource = new URL("./anatomy-specs.mjs", import.meta.url);
const { anatomySpec } = await import(
  `${specSource.href}?v=${(await stat(specSource)).mtimeMs}`
);
const kitCss = await readFile(
  new URL("./vendor/anatomy/iso.css", import.meta.url),
  "utf8",
);
const escape = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const WIDTH = 680,
  HEIGHT = 380;

// Geometry stays on the build side. No drawing library, parser, or authored
// explanation registry is sent to the browser. Parts are mounted, not floated.
export function anatomyArt(spec) {
  const count = spec.parts.length;
  const base = { x: 0, y: 0, w: 224, d: 124, r: 6 };
  const headroom =
    spec.kind === "cabinet"
      ? 23 + count * 9
      : spec.kind === "press"
        ? 82
        : spec.kind === "tracks"
          ? 32
          : 70;
  const P = k.fitProjection(
    k.boxCorners({ ...base, d: 140 }, 0, headroom),
    WIDTH,
    HEIGHT,
    { pad: 28, azimuth: 50, elevation: 35 },
  );
  const items = [];
  let solids = 0;
  const S = (plan, z, h, tone = "mid", extra = {}) => {
    solids++;
    return k.solidSvg(k.slabOf(plan, z, h, P, 4, 0.6), { tone, ...extra });
  };
  const L = (d, tone = "faint", extra = {}) => k.lineSvg(d, { tone, ...extra });
  const dot = (points, tone = "hi", size = 0.55) =>
    k.dotsSvg(k.pointsAt(points, P), { tone, size });
  const screws = (plan, z) =>
    dot(k.corners(plan, 3).map(([x, y]) => [x, y, z]));
  const projected = k.iso([0, 16, 0], P),
    origin = k.iso([0, 0, 0], P);
  const lift = k.iso([0, 0, 10], P);
  const group = (index, body, move = "drawer") => {
    const delta =
      move === "lift"
        ? [lift[0] - origin[0], lift[1] - origin[1]]
        : [projected[0] - origin[0], projected[1] - origin[1]];
    return `<g data-anatomy-part="${index}"><g data-anatomy-moving="" data-dx="${delta[0].toFixed(3)}" data-dy="${delta[1].toFixed(3)}">${body}</g></g>`;
  };
  const assign = (index) => Math.min(count - 1, index);
  // Base: four two-piece feet, thick plate, wrapped seam, corner fasteners,
  // inset mounting rails and four end stops. All sit flush on their hosts.
  items.push(`<path class="iso-halo" d="${k.haloOf(base, 4, 7, P)}"/>`);
  for (const [x, y] of k
    .corners(base, 12)
    .sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P))) {
    items.push(S({ x: x - 5, y: y - 5, w: 10, d: 10, r: 2 }, 0, 3, "lo"));
    items.push(S({ x: x - 4, y: y - 4, w: 8, d: 8, r: 1 }, 3, 3, "lo"));
  }
  items.push(
    S(base, 6, 7, "lo", { inner: L(k.sideSeam(base, 9, P, 4), "lo") }),
    screws(base, 13),
  );
  for (const y of [16, 105]) {
    const rail = { x: 12, y, w: 200, d: 3, r: 1 };
    items.push(S(rail, 13, 2, "lo"), screws(rail, 15));
    for (const x of [12, 205])
      items.push(S({ x, y: y - 1, w: 7, d: 5, r: 1 }, 15, 2, "mid"));
  }
  const nameplate = { x: 86, y: 112, w: 52, d: 7, r: 1 };
  items.push(S(nameplate, 13, 0.8, "mid"), screws(nameplate, 13.8));
  items.push(
    k.faceTextSvg(k.topMatrix([112, 116], 13.8, P), "STUDY MODEL", {
      size: 2.4,
      tone: "lo",
      anchor: "middle",
    }),
  );

  function archive(x, y, index, rows = 3, w = 48) {
    const out = [];
    const top = 18 + rows * 11;
    out.push(S({ x, y, w, d: 48, r: 2 }, 13, 4, "mid"));
    out.push(S({ x, y, w, d: 3, r: 1 }, 17, top - 17, "mid"));
    out.push(S({ x, y: y + 3, w: 3, d: 43, r: 1 }, 17, top - 17, "mid"));
    // Visible drawers are front-loaded in depth order, each with a guide,
    // base, front, handle, two stops, and four corner fasteners.
    for (let row = 0; row < rows; row++) {
      const z = 18 + row * 11,
        drawer = { x: x + 4, y: y + 4, w: w - 8, d: 39, r: 1.4 };
      out.push(S({ ...drawer, d: 2 }, z, 1, "lo"));
      let moving = S(drawer, z + 1, 2, "hi");
      moving += S(
        { x: x + 4, y: y + 43, w: w - 8, d: 2, r: 0.8 },
        z + 1,
        8,
        "hi",
      );
      moving += S(
        { x: x + w / 2 - 7, y: y + 45, w: 14, d: 3, r: 0.8 },
        z + 5,
        2,
        "mid",
      );
      moving += screws(drawer, z + 3);
      for (const sx of [x + 5, x + w - 7])
        out.push(S({ x: sx, y: y + 4, w: 2, d: 37, r: 0.5 }, z + 3, 1, "lo"));
      out.push(group(index, moving));
    }
    out.push(
      S({ x: x + w - 3, y: y + 3, w: 3, d: 43, r: 1 }, 17, top - 17, "mid"),
    );
    out.push(
      S({ x, y, w, d: 48, r: 2 }, top, 3, "mid"),
      screws({ x, y, w, d: 48, r: 2 }, top + 3),
    );
    return out.join("");
  }
  function terminal(x, y, index, w = 40) {
    const out = [];
    out.push(S({ x, y, w, d: 29, r: 3 }, 13, 3, "mid"));
    for (const sx of [x + 3, x + w - 7])
      out.push(S({ x: sx, y: y + 3, w: 4, d: 5, r: 1 }, 16, 20, "mid"));
    const housing = { x: x + 2, y: y + 2, w: w - 4, d: 8, r: 2 };
    out.push(S(housing, 36, 23, "mid"), screws(housing, 59));
    // Recessed display and its raised bezel land on the front of the case.
    out.push(
      S({ x: x + 5, y: y + 10, w: w - 10, d: 0.8, r: 0.6 }, 39, 15, "lo"),
    );
    const tile = S(
      { x: x + 7, y: y + 10.8, w: w - 14, d: 1, r: 0.5 },
      41,
      11,
      "hi",
    );
    out.push(group(index, tile, "lift"));
    for (let row = 0; row < 2; row++)
      for (let col = 0; col < 4; col++)
        out.push(
          S(
            {
              x: x + 5 + (col * (w - 10)) / 4,
              y: y + 16 + row * 3,
              w: (w - 13) / 4,
              d: 2,
              r: 0.4,
            },
            16,
            1,
            "mid",
          ),
        );
    return out.join("");
  }
  function tray(x, y, index, w = 48, d = 42, floor = 13) {
    const out = [];
    out.push(S({ x, y, w, d, r: 2 }, floor, 3, "mid"));
    for (const sx of [x, x + w - 3])
      out.push(S({ x: sx, y, w: 3, d, r: 1 }, floor + 3, 7, "mid"));
    out.push(S({ x, y, w, d: 3, r: 1 }, floor + 3, 7, "mid"));
    let packet = "";
    for (let i = 0; i < 3; i++)
      packet += S(
        {
          x: x + 6,
          y: y + 5 + (i * (d - 10)) / 3,
          w: w - 12,
          d: Math.min(7, (d - 10) / 3 - 1),
          r: 1,
        },
        floor + 3,
        2,
        "hi",
      );
    out.push(group(index, packet, "lift"));
    out.push(
      S({ x, y: y + d - 3, w, d: 3, r: 1 }, floor + 3, 4, "mid"),
      screws({ x, y, w, d, r: 2 }, floor + 3),
    );
    return out.join("");
  }
  function gate(x, index) {
    const out = [];
    for (const y of [34, 78]) {
      out.push(S({ x: x - 5, y: y - 4, w: 10, d: 8, r: 1.5 }, 13, 4, "mid"));
      out.push(S({ x: x - 2, y: y - 2, w: 4, d: 4, r: 0.5 }, 17, 39, "mid"));
    }
    const bar = { x: x - 5, y: 30, w: 10, d: 56, r: 2 };
    out.push(S(bar, 56, 4, "mid"), screws(bar, 60));
    out.push(
      group(
        index,
        S({ x: x - 1.5, y: 43, w: 3, d: 26, r: 1 }, 16, 26, "hi") +
          S({ x: x - 1, y: 52, w: 2, d: 8, r: 0.5 }, 42, 14, "mid"),
        "lift",
      ),
    );
    return out.join("");
  }
  function conveyor(x, y, w, index) {
    const out = [];
    const deck = { x, y, w, d: 32, r: 2 };
    out.push(S(deck, 13, 3, "lo"));
    for (const ey of [y, y + 29])
      out.push(S({ x, y: ey, w, d: 3, r: 1 }, 16, 4, "mid"));
    for (let i = 0; i < 8; i++)
      out.push(
        S(
          { x: x + 5 + (i * (w - 10)) / 8, y: y + 4, w: 2, d: 24, r: 0.6 },
          16,
          0.8,
          "mid",
        ),
      );
    out.push(
      group(
        index,
        S({ x: x + 10, y: y + 8, w: 18, d: 16, r: 2 }, 17, 3, "hi"),
        "lift",
      ),
    );
    return out.join("");
  }
  function dial(x, y, index) {
    const out = [];
    const plan = { x, y, w: 52, d: 38, r: 4 };
    out.push(S(plan, 13, 4, "mid"));
    for (const sx of [x + 4, x + 42])
      out.push(S({ x: sx, y: y + 4, w: 6, d: 6, r: 1 }, 17, 35, "mid"));
    const face = { x: x + 3, y: y + 2, w: 46, d: 30, r: 4 };
    out.push(S(face, 52, 7, "hi"), screws(face, 59));
    const scale = { x: x + 9, y: y + 5, w: 34, d: 22, r: 2 };
    out.push(S(scale, 59, 0.8, "lo"));
    const ticks = k.topTicks(x + 10, x + 42, 4, 2, y + 5, 59.8, [3, 5], P);
    out.push(L(ticks.minor, "mid"), L(ticks.major, "hi"));
    out.push(L(k.lineOnTop([x + 11, y + 5], [x + 41, y + 5], 59.8, P), "hi"));
    out.push(
      group(
        index,
        S({ x: x + 25, y: y + 6, w: 2, d: 16, r: 0.4 }, 59.8, 1, "hi"),
      ),
    );
    return out.join("");
  }

  if (spec.kind === "cabinet") {
    // One cabinet, one drawer per concept. No free-standing "layer" slabs.
    const x = 60,
      y = 24,
      w = 100,
      step = 9,
      top = 19 + count * step;
    items.push(S({ x, y, w, d: 56, r: 3 }, 13, 4, "mid"));
    items.push(S({ x, y, w, d: 3, r: 1 }, 17, top - 17, "mid"));
    items.push(S({ x, y: y + 3, w: 3, d: 50, r: 1 }, 17, top - 17, "mid"));
    for (let i = 0; i < count; i++) {
      const z = 18 + i * step,
        plan = { x: x + 4, y: y + 4, w: w - 8, d: 47, r: 1 };
      for (const sx of [x + 4, x + w - 6])
        items.push(S({ x: sx, y: y + 4, w: 2, d: 45, r: 0.5 }, z, 1, "lo"));
      let drawer = S(plan, z + 1, 2, "hi") + screws(plan, z + 3);
      drawer += S(
        { x: x + 4, y: y + 51, w: w - 8, d: 2, r: 1 },
        z + 1,
        7,
        "hi",
      );
      drawer += S({ x: x + 38, y: y + 53, w: 24, d: 3, r: 1 }, z + 4, 2, "mid");
      items.push(group(i, drawer));
    }
    items.push(
      S({ x: x + w - 3, y: y + 3, w: 3, d: 50, r: 1 }, 17, top - 17, "mid"),
    );
    items.push(
      S({ x, y, w, d: 56, r: 3 }, top, 4, "mid"),
      screws({ x, y, w, d: 56, r: 3 }, top + 4),
    );
    items.push(tray(174, 38, assign(1), 30, 38));
  } else if (spec.kind === "gate") {
    items.push(conveyor(18, 40, 190, 0));
    for (let i = 1; i < count; i++)
      items.push(gate(38 + (i * 148) / Math.max(1, count - 1), i));
    items.push(tray(15, 83, 0, 44, 20));
  } else if (spec.kind === "press") {
    items.push(tray(15, 29, 0, 43, 50));
    items.push(conveyor(61, 46, 130, assign(1)));
    for (const x of [91, 137])
      for (const y of [36, 84]) {
        items.push(S({ x: x - 3, y: y - 3, w: 6, d: 6, r: 1 }, 13, 4, "mid"));
        items.push(
          S({ x: x - 1.5, y: y - 1.5, w: 3, d: 3, r: 0.5 }, 17, 55, "mid"),
        );
      }
    const head = { x: 85, y: 32, w: 62, d: 55, r: 3 };
    items.push(S(head, 72, 7, "mid"), screws(head, 79));
    items.push(S({ x: 110, y: 55, w: 9, d: 9, r: 1 }, 59, 13, "mid"));
    items.push(
      group(
        assign(2),
        S({ x: 99, y: 43, w: 31, d: 33, r: 2 }, 47, 12, "hi"),
        "lift",
      ),
    );
    items.push(tray(174, 84, assign(3), 31, 19));
  } else if (spec.kind === "archive") {
    items.push(archive(25, 29, 0, 3, 60));
    items.push(tray(98, 36, assign(1), 47, 42));
    items.push(archive(164, 29, assign(2), 3, 43));
    if (count > 3)
      items.push(
        group(3, S({ x: 98, y: 89, w: 46, d: 10, r: 2 }, 13, 3, "hi")),
      );
  } else if (spec.kind === "rack") {
    // Three concrete devices represent the selected path; branch and storage
    // topology is described explicitly in the adjacent authored explanation.
    items.push(terminal(19, 39, 0, 49));
    items.push(archive(91, 28, assign(1), 2, 45));
    items.push(archive(160, 32, assign(2), 2, 47));
    if (count > 3) items.push(tray(95, 86, 3, 43, 19));
  } else if (spec.kind === "scope") {
    items.push(terminal(19, 42, 0, 53));
    const body = { x: 87, y: 31, w: 112, d: 65, r: 3 };
    items.push(S(body, 13, 5, "mid"), screws(body, 18));
    for (let row = 0; row < count; row++) {
      const plan = { x: 94, y: 37 + row * 12, w: 96, d: 8, r: 1 };
      items.push(S(plan, 18, 0.7, "lo"));
      const bands = spec.bands?.[row] || [[0, 1200]];
      const strips = bands
        .map(([start, duration]) =>
          S(
            {
              ...plan,
              x: plan.x + (96 * start) / 1200,
              w: (96 * duration) / 1200,
              r: 0.4,
            },
            18.7,
            1,
            "hi",
          ),
        )
        .join("");
      items.push(group(row, strips, "lift"));
    }
    for (const x of [91, 192])
      for (const y of [35, 91])
        items.push(S({ x, y, w: 3, d: 3, r: 1 }, 18, 2, "mid"));
  } else if (spec.kind === "bounded-pool") {
    // These two-worker and two-slot counts are the illustrated executor data.
    for (const x of [23, 61]) {
      items.push(S({ x, y: 33, w: 30, d: 40, r: 2 }, 13, 4, "mid"));
      for (const side of [x, x + 27])
        items.push(S({ x: side, y: 33, w: 3, d: 40, r: 1 }, 17, 5, "mid"));
      items.push(
        group(
          0,
          S({ x: x + 7, y: 42, w: 16, d: 20, r: 2 }, 17, 4, "hi"),
          "lift",
        ),
      );
    }
    for (const y of [33, 62]) {
      items.push(S({ x: 111, y, w: 38, d: 24, r: 2 }, 13, 3, "mid"));
      for (const x of [111, 146])
        items.push(S({ x, y, w: 3, d: 24, r: 1 }, 16, 4, "mid"));
      items.push(
        group(
          1,
          S({ x: 118, y: y + 5, w: 24, d: 14, r: 2 }, 16, 3, "hi"),
          "lift",
        ),
      );
    }
    items.push(S({ x: 177, y: 44, w: 28, d: 30, r: 2 }, 13, 3, "mid"));
    items.push(
      group(2, S({ x: 183, y: 50, w: 16, d: 18, r: 2 }, 16, 3, "hi"), "lift"),
    );
  } else if (spec.kind === "tracks") {
    items.push(conveyor(25, 32, 175, 0));
    items.push(conveyor(25, 78, 175, assign(1)));
    for (let i = 2; i < count; i++)
      items.push(
        group(
          i,
          S({ x: 60 + (i - 2) * 65, y: 68, w: 24, d: 8, r: 2 }, 13, 3, "hi"),
        ),
      );
    // Distinct parked workpieces share guide rails without crossing each other.
  } else if (spec.kind === "carousel") {
    const platform = { x: 55, y: 23, w: 112, d: 77, r: 12 };
    items.push(S(platform, 13, 7, "mid"), screws(platform, 20));
    const positions = [
      [64, 31],
      [121, 31],
      [64, 69],
      [121, 69],
    ];
    positions
      .slice(0, count)
      .forEach(([x, y], i) => items.push(tray(x, y, i, 37, 26, 20)));
    items.push(S({ x: 102, y: 51, w: 19, d: 19, r: 4 }, 20, 18, "mid"));
    items.push(S({ x: 107, y: 56, w: 9, d: 9, r: 2 }, 38, 4, "hi"));
    items.push(tray(181, 48, assign(count - 1), 27, 34));
  } else if (spec.kind === "dial") {
    items.push(dial(31, 30, 0));
    items.push(tray(106, 31, assign(1), 43, 44));
    items.push(archive(172, 34, assign(2), 3, 34));
    if (count > 3)
      items.push(
        group(3, S({ x: 108, y: 90, w: 40, d: 9, r: 2 }, 13, 3, "hi")),
      );
  } else if (spec.kind === "comparator" || spec.kind === "balance") {
    items.push(tray(25, 34, 0, 51, 55));
    items.push(tray(152, 34, assign(1), 51, 55));
    items.push(S({ x: 98, y: 43, w: 27, d: 27, r: 3 }, 13, 5, "mid"));
    items.push(S({ x: 108, y: 52, w: 7, d: 7, r: 1 }, 18, 34, "mid"));
    const carriage = { x: 81, y: 48, w: 65, d: 12, r: 2 };
    items.push(group(assign(2), S(carriage, 52, 5, "hi"), "lift"));
    for (const x of [84, 135])
      items.push(S({ x, y: 50, w: 6, d: 8, r: 1 }, 57, 3, "mid"));
    if (count > 3)
      items.push(group(3, S({ x: 96, y: 95, w: 38, d: 8, r: 2 }, 13, 2, "hi")));
  } else if (spec.kind === "binder") {
    items.push(archive(23, 30, 0, 3, 47));
    items.push(tray(95, 29, assign(1), 49, 56));
    items.push(terminal(168, 44, assign(2), 38));
    if (count > 3)
      items.push(
        group(3, S({ x: 100, y: 92, w: 40, d: 9, r: 1 }, 13, 2, "hi")),
      );
  } else if (spec.kind === "tray") {
    for (let i = 0; i < count; i++)
      items.push(
        tray(20 + (i * 185) / count, 34, i, Math.min(43, 170 / count), 52),
      );
  } else {
    // dispatch/conveyor: a real job feeder, processing bed, output holder.
    items.push(tray(20, 29, 0, 43, 52));
    items.push(conveyor(75, 42, 79, assign(1)));
    items.push(terminal(171, 38, assign(2), 35));
    if (count > 3) items.push(tray(94, 85, 3, 42, 19));
  }
  // Eight closed mounting sockets on the front guide rail allow fixtures to
  // be attached to the bench. These construction details add no new actors.
  for (let i = 0; i < 8; i++)
    items.push(
      S({ x: 18 + i * 24, y: 105, w: 5, d: 3, r: 0.5 }, 15, 0.7, "lo"),
    );
  return {
    svg: k.figureSvg({
      width: WIDTH,
      height: HEIGHT,
      label: `${spec.object} ${spec.takeaway}`,
      body: items,
    }),
    solids,
  };
}
export function anatomyFigure(id, number = 1) {
  const spec = anatomySpec(id),
    { svg, solids } = anatomyArt(spec);
  const panels = spec.parts
    .map(
      (part, i) =>
        `<li data-anatomy-panel="${i}"><strong>${escape(part.label)}</strong><p>${escape(part.body)}</p></li>`,
    )
    .join("");
  return `<div class="anatomy-figure iso" data-anatomy-figure="${escape(id)}" data-kind="${spec.kind}" data-focus="${spec.focus?.[0] ?? 0}" data-parts="${solids}">
    <div class="anatomy-frame iso-plate">
      <div class="anatomy-heading"><span>Fig ${number}</span><strong>${escape(spec.title)}</strong></div>
      <div class="anatomy-stage">${svg}</div>
      <div class="anatomy-hint"><span>Inspect one part at a time</span><span data-anatomy-readout>${escape(spec.parts[0].label)}</span></div>
    </div>
    <div class="anatomy-controls" hidden data-pagefind-ignore>
      <button type="button" data-anatomy-action="previous" aria-label="Previous part">←</button>
      <label><span class="sr-only">Part to inspect</span><select data-anatomy-select>${spec.parts.map((p, i) => `<option value="${i}" data-target="${spec.focus?.[i] ?? i}">${escape(p.label)}</option>`).join("")}</select></label>
      <button type="button" data-anatomy-action="next" aria-label="Next part">→</button>
      <button type="button" data-anatomy-action="tour" aria-pressed="false">Tour parts</button>
    </div>
    <ol class="anatomy-explanation" aria-live="polite" aria-atomic="true">${panels}</ol>
    <p class="anatomy-takeaway">${escape(spec.takeaway)}</p>
    <details class="anatomy-key"><summary>How to read this model</summary><p>${escape(spec.object)} The object is a teaching analogy. Inspecting a part highlights its role; it does not execute or simulate the software. Cabinet trays are records, workpieces are data, and latches are checks. ${escape(spec.bands ? "On this trace recorder, horizontal strip lengths and positions follow the illustrated 1200 ms span." : "Unless an explanation states a quantity, compartments and sample workpieces do not denote data counts. Part dimensions are not a quantitative scale.")}</p></details>
  </div>`;
}
function wrap(text, columns = 82) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (line && (line + " " + word).length > columns) {
      lines.push(line);
      line = word;
    } else line += (line ? " " : "") + word;
  }
  if (line) lines.push(line);
  return lines;
}
export function standaloneArt(id) {
  const spec = anatomySpec(id),
    { svg } = anatomyArt(spec);
  let y = 440;
  const texts = [];
  for (const part of spec.parts) {
    texts.push(
      `<text x="30" y="${y}" font-size="16" font-weight="600">${escape(part.label)}</text>`,
    );
    y += 24;
    for (const line of wrap(part.body)) {
      texts.push(`<text x="30" y="${y}" font-size="14">${escape(line)}</text>`);
      y += 21;
    }
    y += 22;
  }
  for (const line of wrap(spec.takeaway)) {
    texts.push(`<text x="30" y="${y}" font-size="14">${escape(line)}</text>`);
    y += 21;
  }
  const height = y + 24;
  const body = svg.slice(svg.indexOf(">") + 1, -6);
  const focus = `[data-anatomy-part="${spec.focus?.[0] ?? 0}"]`;
  const focusCss = `${focus} .iso-top{fill:var(--anatomy-lit-top)}${focus} .iso-shade{fill:var(--anatomy-lit-shade)}${focus} .iso-edge{stroke:var(--anatomy-lit)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" class="iso iso-svg" data-theme="light" width="680" height="${height}" viewBox="0 0 680 ${height}" role="img" aria-labelledby="title description"><title id="title">${escape(spec.title)}</title><desc id="description">${escape(spec.object + " " + spec.takeaway)}</desc><style>${kitCss}\ntext{font-family:system-ui;fill:var(--anatomy-strong)}${focusCss}</style><rect width="680" height="${height}" fill="var(--anatomy-paper)"/><text x="30" y="32" font-size="18" font-weight="600">${escape(spec.title)}</text><g transform="translate(0 34)">${body}</g>${texts.join("")}</svg>`;
}
