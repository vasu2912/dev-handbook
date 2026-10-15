// Normalize authored SVGs at build time. Geometry and semantic color groups stay intact.
function colorToken(hex) {
  let digits = hex.slice(1);
  if (digits.length === 3)
    digits = [...digits].map((digit) => digit + digit).join("");
  if (digits.length !== 6) return hex;
  const [red, green, blue] = digits
    .match(/../g)
    .map((pair) => parseInt(pair, 16) / 255);
  const high = Math.max(red, green, blue);
  const low = Math.min(red, green, blue);
  const light = (high + low) / 2;
  const delta = high - low;
  if (delta < 0.12) {
    const tone =
      light > 0.97
        ? "white"
        : light > 0.9
          ? "bg"
          : light > 0.75
            ? "border"
            : light > 0.4
              ? "muted"
              : "ink";
    return `var(--diagram-${tone})`;
  }
  let hue =
    high === red
      ? ((green - blue) / delta) % 6
      : high === green
        ? (blue - red) / delta + 2
        : (red - green) / delta + 4;
  hue = (hue * 60 + 360) % 360;
  const group =
    hue < 20 || hue >= 340
      ? "red"
      : hue < 65
        ? "yellow"
        : hue < 180
          ? "green"
          : hue < 260
            ? "accent"
            : "purple";
  return `var(--diagram-${group}${light > 0.72 ? "-bg" : ""})`;
}
function paint(value) {
  return value.replace(/#[\da-f]{3,8}\b/gi, colorToken);
}

export function normalizeDiagrams($) {
  $("svg").each((index, element) => {
    const svg = $(element);
    const prefix = `figure-${index}-`;
    const selector = `.diagram-svg[data-diagram="${index}"]`;
    const ids = new Map(
      svg
        .find("[id]")
        .toArray()
        .map((node) => [$(node).attr("id"), prefix + $(node).attr("id")]),
    );
    if (svg.attr("id")) ids.set(svg.attr("id"), prefix + svg.attr("id"));
    // Isometric figures have material tones and live hooks of their own.
    const isometric = svg.closest(".iso").length > 0;
    svg.addClass("diagram-svg").attr("data-diagram", index);
    svg.find("style").each((_, node) => {
      let css = $(node)
        .text()
        .replace(/@font-face\s*\{[^}]*\}/g, "")
        .replace(/@import\s+url\([^)]*\);/g, "")
        .replace(/@media[^{}]*\{\s*:root\s*\{[^}]*\}\s*\}/g, "");
      if (!isometric) css = paint(css);
      css = css
        .replace(/font-family\s*:[^;}]+/g, "font-family:var(--font)")
        .replace(/font\s*:\s*([\d.]+px)\s+[^;}]+/g, "font:$1 var(--font)");
      css = css.replace(/([^{}]+)\{([^{}]*)\}/g, (_, selectors, body) => {
        const scoped = selectors
          .trim()
          .split(",")
          .map((part) =>
            [":root", "svg"].includes(part.trim())
              ? selector
              : `${selector} ${part.trim()}`,
          )
          .join(",");
        return `${scoped}{${body}}`;
      });
      $(node).text(css);
    });
    svg.add(svg.find("*")).each((_, node) => {
      for (const [attribute, original] of Object.entries(node.attribs || {})) {
        let value = original;
        if (attribute === "id") value = ids.get(original) || original;
        else if (["aria-labelledby", "aria-describedby"].includes(attribute))
          value = original
            .split(/\s+/)
            .map((id) => ids.get(id) || id)
            .join(" ");
        else {
          for (const [old, next] of ids) {
            value = value.replaceAll(`url(#${old})`, `url(#${next})`);
            if (
              (attribute === "href" || attribute === "xlink:href") &&
              value === `#${old}`
            )
              value = `#${next}`;
          }
          if (
            !isometric &&
            ["fill", "stroke", "stop-color", "style"].includes(attribute)
          )
            value = paint(value);
          if (attribute === "style")
            value = value
              .replace(/font-family\s*:[^;]+/g, "font-family:var(--font)")
              .replace(/margin\s*:[^;]+;?/g, "");
          if (attribute === "font-family") value = "var(--font)";
        }
        $(node).attr(attribute, value);
      }
    });
    // Style blocks can refer to their own markers, too.
    svg.find("style").each((_, node) => {
      let css = $(node).text();
      for (const [old, next] of ids)
        css = css.replaceAll(`url(#${old})`, `url(#${next})`);
      $(node).text(css);
    });
    if (
      isometric ||
      svg.closest(
        ".mermaid-diagram, .handbook-diagram, .walkthrough, .pool-budget",
      ).length
    )
      return;
    if (
      element.parent?.tagName === "p" &&
      $(element.parent).contents().length === 1
    )
      $(element.parent).replaceWith(svg);
    svg.wrap(
      '<div class="handbook-diagram" tabindex="0" role="region" aria-label="Scrollable diagram"></div>',
    );
  });
}
