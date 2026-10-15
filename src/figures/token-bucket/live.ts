import {
  advanceBucket,
  advanceTraffic,
  CAPACITY,
  createBucket,
  sendRequests,
} from "./model";

export function mountTokenBucket(root: HTMLElement) {
  const readout = root.querySelector<HTMLElement>("[data-bucket-readout]");
  const accepted = root.querySelector<HTMLElement>("[data-accepted]");
  const rejected = root.querySelector<HTMLElement>("[data-rejected]");
  const elapsed = root.querySelector<HTMLElement>("[data-elapsed]");
  const outcome = root.querySelector<HTMLElement>("[data-outcome]");
  const mode = root.querySelector<HTMLElement>("[data-mode]");
  const controls = root.querySelector<HTMLElement>(".bucket-controls");
  const play = root.querySelector<HTMLButtonElement>('[data-action="play"]');
  const step = root.querySelector<HTMLButtonElement>('[data-action="step"]');
  const refill = root.querySelector<HTMLSelectElement>("[data-refill]");
  const gate = root.querySelector<SVGGElement>("[data-gate]");
  const tile = root.querySelector<SVGGElement>("[data-request]");
  const credits = [...root.querySelectorAll<SVGGElement>("[data-token]")];
  if (
    !readout ||
    !accepted ||
    !rejected ||
    !elapsed ||
    !outcome ||
    !mode ||
    !controls ||
    !play ||
    !step ||
    !refill ||
    !gate ||
    !tile ||
    credits.length !== CAPACITY
  )
    throw new Error("Token-bucket figure markup is incomplete.");
  const travel = {
    x: Number(tile.dataset.travelX),
    y: Number(tile.dataset.travelY),
  };
  const lift = { x: Number(gate.dataset.liftX), y: Number(gate.dataset.liftY) };
  if (![travel.x, travel.y, lift.x, lift.y].every(Number.isFinite))
    throw new Error("Token-bucket figure coordinates are invalid.");
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  let bucket = createBucket();
  let playing = false,
    visible = false,
    frame = 0,
    last = 0;
  let motion: { started: number; admitted: boolean } | null = null;
  const text = (node: HTMLElement, value: string) => {
    if (node.textContent !== value) node.textContent = value;
  };
  const announce = (value: string) => {
    text(outcome, value);
  };
  const updateMode = () => {
    play.disabled = still.matches;
    play.textContent = playing ? "Pause traffic" : "Play traffic";
    play.setAttribute("aria-pressed", String(playing));
    step.disabled = playing;
    text(
      mode,
      still.matches
        ? "Reduced motion is on. Send requests and advance time with Next second."
        : playing
          ? "Playing 8 requests / second. Simulation time pauses offscreen and in background tabs."
          : "Paused. Next second refills credits without sending traffic.",
    );
  };
  const paint = (now: number) => {
    text(readout, `${bucket.tokens.toFixed(2)} / ${CAPACITY} tokens`);
    text(accepted, String(bucket.accepted));
    text(rejected, String(bucket.rejected));
    text(elapsed, `${bucket.elapsed.toFixed(2)} s`);
    credits.forEach((credit, index) => {
      credit.style.opacity = String(
        Math.max(0, Math.min(1, bucket.tokens - index)),
      );
    });
    if (!motion || still.matches) {
      tile.setAttribute("opacity", "0");
      gate.removeAttribute("transform");
      motion = null;
      return;
    }
    const phase = Math.min(1, (now - motion.started) / 700);
    const progress = motion.admitted ? phase : Math.sin(phase * Math.PI) * 0.5;
    tile.setAttribute(
      "transform",
      `translate(${travel.x * progress} ${travel.y * progress})`,
    );
    tile.setAttribute(
      "opacity",
      String(Math.min(1, phase * 10, (1 - phase) * 10)),
    );
    const opening = motion.admitted
      ? Math.min(1, phase * 8, (1 - phase) * 8)
      : 0;
    gate.setAttribute(
      "transform",
      `translate(${lift.x * opening} ${lift.y * opening})`,
    );
    if (phase >= 1) motion = null;
  };
  const animate = (admitted: boolean, replace = false) => {
    if (!still.matches && (!motion || replace))
      motion = { started: performance.now(), admitted };
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
  };
  const tick = (now: number) => {
    frame = 0;
    if (!visible || document.hidden) {
      last = 0;
      return;
    }
    if (playing) {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      const before = bucket;
      bucket = advanceTraffic(bucket, dt);
      if (
        bucket.accepted !== before.accepted ||
        bucket.rejected !== before.rejected
      )
        animate(bucket.accepted > before.accepted);
    }
    last = now;
    paint(now);
    if (playing || motion) frame = requestAnimationFrame(tick);
    else last = 0;
  };
  const run = () => {
    if (!frame && visible && !document.hidden && (playing || motion))
      frame = requestAnimationFrame(tick);
  };
  const click = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest("button[data-action]");
    if (
      !(button instanceof HTMLButtonElement) ||
      button.disabled ||
      !root.contains(button)
    )
      return;
    switch (button.dataset.action) {
      case "send":
      case "burst": {
        const count = button.dataset.action === "burst" ? 25 : 1;
        const before = bucket;
        bucket = sendRequests(bucket, count);
        const admitted = bucket.accepted - before.accepted;
        const denied = bucket.rejected - before.rejected;
        announce(
          `${count === 1 ? "Request" : "Burst of 25"}: ${admitted} accepted, ${denied} rejected. ${bucket.tokens.toFixed(2)} tokens remain.`,
        );
        animate(admitted > 0, true);
        break;
      }
      case "play":
        playing = !playing;
        last = 0;
        announce(
          playing
            ? "Traffic started: 8 requests per second."
            : "Traffic paused.",
        );
        break;
      case "step":
        bucket = advanceBucket(bucket, 1);
        announce(
          `Advanced one second. ${bucket.tokens.toFixed(2)} tokens available.`,
        );
        break;
      case "reset":
        bucket = createBucket();
        refill.value = "5";
        playing = false;
        motion = null;
        stop();
        announce("Reset: 20 tokens, 5 tokens per second, no requests sent.");
        break;
    }
    updateMode();
    paint(performance.now());
    run();
  };
  const changeRate = () => {
    const rate = Number(refill.value);
    if (![1, 5, 10].includes(rate)) return;
    bucket = { ...bucket, refillRate: rate };
    announce(
      `Refill speed changed to ${rate} tokens per second. Existing credits stay available.`,
    );
  };
  const visibility = () => {
    if (document.hidden) stop();
    else run();
  };
  const reducedMotion = () => {
    if (still.matches) {
      playing = false;
      motion = null;
      stop();
    }
    updateMode();
    paint(performance.now());
  };
  const observer = new IntersectionObserver((entries) => {
    visible = Boolean(entries.at(-1)?.isIntersecting);
    if (visible) run();
    else stop();
  });
  observer.observe(root);
  root.addEventListener("click", click);
  refill.addEventListener("change", changeRate);
  document.addEventListener("visibilitychange", visibility);
  still.addEventListener("change", reducedMotion);
  controls.hidden = false;
  updateMode();
  paint(performance.now());
  return () => {
    stop();
    observer.disconnect();
    root.removeEventListener("click", click);
    refill.removeEventListener("change", changeRate);
    document.removeEventListener("visibilitychange", visibility);
    still.removeEventListener("change", reducedMotion);
  };
}
