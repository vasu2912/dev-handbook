import { readFile } from "node:fs/promises";
import * as k from "./vendor/anatomy/iso-kit.mjs";

// A credit dispenser: a twenty-slot tray, a refill cartridge, and an admission gate.
// Parts: plinth + 4 feet + 4 mounts, tray + 20 seats + 20 credits + 4 rails,
// refill cartridge + cap + 4 vents, runway + 2 rails + 6 ribs,
// gate + 2 posts + 2 mounts + crossbar, request tile, control plate + 4 screws.
const WIDTH = 680,
  HEIGHT = 400;
const base = { x: 0, y: 0, w: 226, d: 138, r: 7 };
const P = k.fitProjection(k.boxCorners(base, 0, 70), WIDTH, HEIGHT, {
  pad: 35,
  elevation: 40,
  azimuth: 50,
});
const at = (point) => k.iso(point, P);
const slab = (plan, z, height, tone = "mid", extra = {}) =>
  k.solidSvg(k.slabOf(plan, z, height, P, 3, 0.6), { tone, ...extra });
const screws = (plan, z) =>
  k.dotsSvg(
    k.pointsAt(
      k.corners(plan, 3).map(([x, y]) => [x, y, z]),
      P,
    ),
    { size: 0.75, tone: "hi" },
  );

function artwork() {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf(base, 4, 8, P)}"/>`);
  for (const [x, y] of k.corners(base, 10)) {
    out.push(slab({ x: x - 5, y: y - 5, w: 10, d: 10, r: 2 }, 0, 4, "lo"));
    out.push(slab({ x: x - 6, y: y - 6, w: 12, d: 12, r: 2 }, 4, 3, "lo"));
  }
  out.push(
    slab(base, 7, 8, "mid", {
      inner: k.lineSvg(k.sideSeam(base, 11, P, 3), { tone: "faint" }),
    }),
  );
  out.push(screws(base, 15));
  const tray = { x: 14, y: 30, w: 94, d: 94, r: 4 };
  out.push(slab(tray, 15, 8, "mid"));
  const cartridge = { x: 20, y: 8, w: 78, d: 16, r: 3 };
  out.push(slab(cartridge, 15, 23, "mid"));
  out.push(slab({ ...cartridge, x: 18, y: 6, w: 82, d: 20 }, 38, 3, "hi"));
  out.push(screws(cartridge, 41));
  for (let i = 0; i < 4; i++)
    out.push(slab({ x: 30 + i * 15, y: 12, w: 8, d: 6, r: 1 }, 41, 1, "lo"));
  out.push(
    k.faceTextSvg(k.sideMatrix([39, 24], 23, P, "left"), "REFILL", {
      size: 4,
      tone: "hi",
    }),
  );
  out.push(slab({ x: 14, y: 30, w: 94, d: 3, r: 1 }, 23, 4, "mid"));
  out.push(slab({ x: 14, y: 30, w: 3, d: 94, r: 1 }, 23, 4, "mid"));
  // Far slots are painted first. Empty seats remain visible beneath the credits.
  for (let row = 0; row < 5; row++)
    for (let column = 0; column < 4; column++) {
      const index = row * 4 + column;
      const slot = {
        x: 21 + column * 21,
        y: 39 + row * 16,
        w: 16,
        d: 11,
        r: 2,
      };
      out.push(slab(slot, 23, 1, "lo"));
      out.push(
        `<g data-token="${index}">${slab({ ...slot, x: slot.x + 1, y: slot.y + 1, w: 14, d: 9 }, 24, 4, "hi", { lit: true })}</g>`,
      );
    }
  out.push(slab({ x: 105, y: 30, w: 3, d: 94, r: 1 }, 23, 4, "mid"));
  out.push(slab({ x: 14, y: 121, w: 94, d: 3, r: 1 }, 23, 4, "mid"));
  const runway = { x: 120, y: 48, w: 90, d: 30, r: 3 };
  out.push(slab(runway, 15, 3, "lo"));
  out.push(slab({ x: 120, y: 48, w: 90, d: 3, r: 1 }, 18, 3, "mid"));
  for (let i = 0; i < 6; i++)
    out.push(
      slab({ x: 127 + i * 14, y: 52, w: 2, d: 22, r: 0.5 }, 18, 0.8, "faint"),
    );
  const rearMount = { x: 166, y: 40, w: 10, d: 8, r: 2 };
  out.push(slab(rearMount, 15, 3, "mid"));
  out.push(slab({ x: 168, y: 42, w: 6, d: 4, r: 1 }, 18, 34, "hi"));
  const request = slab({ x: 124, y: 56, w: 13, d: 14, r: 2 }, 19, 4, "hi", {
    lit: true,
  });
  const travel = at([70, 0, 0]),
    origin = at([0, 0, 0]);
  out.push(
    `<g data-request data-travel-x="${travel[0] - origin[0]}" data-travel-y="${travel[1] - origin[1]}" opacity="0">${request}</g>`,
  );
  const lift = at([0, 0, 9]);
  out.push(
    `<g data-gate data-lift-x="${lift[0] - origin[0]}" data-lift-y="${lift[1] - origin[1]}">${slab({ x: 168, y: 48, w: 4, d: 30, r: 1 }, 18, 23, "hi")}</g>`,
  );
  out.push(slab({ x: 166, y: 78, w: 10, d: 8, r: 2 }, 15, 3, "mid"));
  out.push(slab({ x: 168, y: 80, w: 6, d: 4, r: 1 }, 18, 34, "hi"));
  out.push(slab({ x: 166, y: 40, w: 10, d: 46, r: 2 }, 52, 4, "hi"));
  out.push(screws({ x: 166, y: 40, w: 10, d: 46, r: 2 }, 56));
  out.push(slab({ x: 120, y: 75, w: 90, d: 3, r: 1 }, 18, 3, "mid"));
  const control = { x: 124, y: 99, w: 80, d: 20, r: 2 };
  out.push(slab(control, 15, 1, "lo"));
  out.push(screws(control, 16));
  out.push(
    k.faceTextSvg(k.topMatrix([132, 111], 16, P), "1 REQUEST / CREDIT", {
      size: 3.8,
      tone: "hi",
    }),
  );
  return k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    label:
      "A twenty-slot credit tray beside an admission gate. Each solid plate represents one token. A request can pass the gate only by spending a full token.",
    body: out,
  });
}

export async function tokenBucketFigure() {
  const kitCss = await readFile(
    new URL("./vendor/anatomy/iso.css", import.meta.url),
    "utf8",
  );
  const css = await readFile(
    new URL("../../src/figures/token-bucket/figure.css", import.meta.url),
    "utf8",
  );
  return `<figure class="token-bucket iso" data-figure="token-bucket">
    <style>${kitCss}\n${css}</style>
    <div class="bucket-frame iso-plate">
      <div class="bucket-heading"><span>Fig 1</span><strong>Credits decide who gets through</strong></div>
      <div class="bucket-stage">${artwork()}</div>
      <div class="bucket-hint"><span>One plate = one token</span><span data-bucket-readout>20.00 / 20 tokens</span></div>
    </div>
    <div class="bucket-controls" hidden data-pagefind-ignore>
      <div class="bucket-actions">
        <button type="button" data-action="send">Send request</button>
        <button type="button" data-action="burst">Burst of 25</button>
        <button type="button" data-action="play" aria-pressed="false">Play traffic</button>
        <button type="button" data-action="step">Next second</button>
        <button type="button" data-action="reset">Reset</button>
      </div>
      <label class="bucket-rate">Refill speed <select data-refill><option value="1">1 token / second</option><option value="5" selected>5 tokens / second</option><option value="10">10 tokens / second</option></select></label>
      <p class="bucket-mode" data-mode>Paused. Next second refills credits without sending traffic.</p>
      <dl class="bucket-stats"><div><dt>Accepted</dt><dd data-accepted>0</dd></div><div><dt>Rejected</dt><dd data-rejected>0</dd></div><div><dt>Simulation time</dt><dd data-elapsed>0.00 s</dd></div></dl>
      <p class="bucket-outcome" role="status" aria-live="polite" aria-atomic="true" data-outcome>Try a burst of 25. The full bucket can admit only 20.</p>
    </div>
    <figcaption>A token bucket with a capacity of 20, initially full, refills at 5 tokens per second. Each request spends one full token. A partially filled plate shows a fractional credit. The gate illustrates admission, not request processing time. Rejected requests are not queued. Without JavaScript, this figure shows the starting state.</figcaption>
  </figure>`;
}
