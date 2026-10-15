// Inspecting a part is a visual selection, not a software execution simulation.
export function mountAnatomy(root: HTMLElement): () => void {
  const panels = Array.from(
    root.querySelectorAll<HTMLElement>("[data-anatomy-panel]"),
  );
  const parts = Array.from(
    root.querySelectorAll<SVGGElement>("[data-anatomy-part]"),
  );
  const select = root.querySelector<HTMLSelectElement>("[data-anatomy-select]");
  const controls = root.querySelector<HTMLElement>(".anatomy-controls");
  const readout = root.querySelector<HTMLElement>("[data-anatomy-readout]");
  const tourButton = root.querySelector<HTMLButtonElement>(
    '[data-anatomy-action="tour"]',
  );
  if (!select || !controls || !readout || !tourButton || !panels.length)
    return () => {};
  const ui = { select, controls, readout, tourButton };
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let selected = 0,
    visible = false,
    frame = 0,
    last = 0,
    clock = 0,
    touring = false;
  const positions = new Map<SVGGElement, number>();
  function choose(index: number) {
    selected = (index + panels.length) % panels.length;
    ui.select.value = String(selected);
    root.dataset.focus =
      ui.select.selectedOptions[0].dataset.target || String(selected);
    ui.readout.textContent = ui.select.selectedOptions[0].textContent;
    panels.forEach((panel, i) => {
      panel.hidden = i !== selected;
    });
    clock = 0;
    run();
  }
  function draw(dt: number, immediate = false) {
    let unsettled = false;
    for (const part of parts) {
      const active = part.dataset.anatomyPart === root.dataset.focus;
      for (const moving of part.querySelectorAll<SVGGElement>(
        "[data-anatomy-moving]",
      )) {
        const target = active ? 1 : 0;
        let at = positions.get(moving) || 0;
        at = immediate
          ? target
          : at + (target - at) * (1 - Math.exp(-dt / 0.22));
        if (Math.abs(at - target) < 0.001) at = target;
        else unsettled = true;
        positions.set(moving, at);
        moving.setAttribute(
          "transform",
          `translate(${Number(moving.dataset.dx) * at} ${Number(moving.dataset.dy) * at})`,
        );
      }
    }
    return unsettled;
  }
  function tick(now: number) {
    frame = 0;
    if (!visible) return;
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    if (touring && !motion.matches) {
      clock += dt;
      if (clock >= 5) choose(selected + 1);
    }
    const unsettled = draw(dt, motion.matches);
    if (visible && (unsettled || (touring && !motion.matches)) && !frame)
      frame = requestAnimationFrame(tick);
  }
  function run() {
    if (motion.matches) {
      draw(0, true);
      return;
    }
    if (visible && !frame) {
      last = 0;
      frame = requestAnimationFrame(tick);
    }
  }
  function stopTour() {
    touring = false;
    root
      .querySelector(".anatomy-explanation")
      ?.setAttribute("aria-live", "polite");
    ui.tourButton.setAttribute("aria-pressed", "false");
    ui.tourButton.textContent = "Tour parts";
  }
  function click(event: MouseEvent) {
    if (!(event.target instanceof Element)) return;
    const action = event.target.closest<HTMLElement>("[data-anatomy-action]")
      ?.dataset.anatomyAction;
    if (action === "tour") {
      if (touring) stopTour();
      else if (!motion.matches) {
        touring = true;
        root
          .querySelector(".anatomy-explanation")
          ?.setAttribute("aria-live", "off");
        clock = 0;
        ui.tourButton.setAttribute("aria-pressed", "true");
        ui.tourButton.textContent = "Pause tour";
        run();
      }
      return;
    }
    const part = event.target.closest<SVGGElement>("[data-anatomy-part]");
    if (part) {
      stopTour();
      const index = Array.from(ui.select.options).findIndex(
        (option) => option.dataset.target === part.dataset.anatomyPart,
      );
      if (index >= 0) choose(index);
    } else if (action === "previous" || action === "next") {
      stopTour();
      choose(selected + (action === "next" ? 1 : -1));
    }
  }
  function change() {
    stopTour();
    choose(Number(ui.select.value));
  }
  function key(event: KeyboardEvent) {
    if (
      !(event.target instanceof Element) ||
      !event.target.closest(".anatomy-controls")
    )
      return;
    if (event.target instanceof HTMLSelectElement) return; // Native select keyboard behavior.
    if (
      ["ArrowLeft", "ArrowRight", "Home", "End", "Escape"].includes(event.key)
    ) {
      event.preventDefault();
      stopTour();
      if (event.key !== "Escape")
        choose(
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? panels.length - 1
              : selected + (event.key === "ArrowRight" ? 1 : -1),
        );
    }
  }
  function reduceMotion() {
    if (motion.matches) {
      stopTour();
      cancelAnimationFrame(frame);
      frame = 0;
      draw(0, true);
    }
    ui.tourButton.disabled = motion.matches;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries.at(-1);
      visible = Boolean(entry?.isIntersecting) && !document.hidden;
      if (visible) run();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
        last = 0;
      }
    },
    { rootMargin: "120px 0px" },
  );
  function visibility() {
    if (document.hidden) {
      visible = false;
      cancelAnimationFrame(frame);
      frame = 0;
    } else {
      const bounds = root.getBoundingClientRect();
      visible = bounds.bottom > -120 && bounds.top < innerHeight + 120;
      run();
    }
  }
  root.addEventListener("pointerenter", stopTour);
  root.addEventListener("focusin", stopTour);
  root.addEventListener("click", click);
  root.addEventListener("keydown", key);
  select.addEventListener("change", change);
  motion.addEventListener("change", reduceMotion);
  document.addEventListener("visibilitychange", visibility);
  observer.observe(root);
  controls.hidden = false;
  root.dataset.ready = "";
  choose(0);
  reduceMotion();
  return () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
    root.removeEventListener("pointerenter", stopTour);
    root.removeEventListener("focusin", stopTour);
    root.removeEventListener("click", click);
    root.removeEventListener("keydown", key);
    select.removeEventListener("change", change);
    motion.removeEventListener("change", reduceMotion);
    document.removeEventListener("visibilitychange", visibility);
    controls.hidden = true;
    delete root.dataset.ready;
    panels.forEach((panel) => {
      panel.hidden = false;
    });
    parts.forEach((part) =>
      part
        .querySelectorAll("[data-anatomy-moving]")
        .forEach((node) => node.removeAttribute("transform")),
    );
  };
}
