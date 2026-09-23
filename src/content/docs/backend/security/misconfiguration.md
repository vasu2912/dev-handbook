---
title: Security misconfiguration
description: Configuration defaults, secrets, logging, headers, and least-privilege deployment choices.
sidebar:
  order: 6
---

> You can have perfect code and still leak everything through bad configuration. These are the three classic holes.

## 1 · Secrets management

"Secrets" = API keys, database passwords, encryption keys, JWT signing keys. The one unforgivable mistake is committing them to source control.

<svg role="img" aria-label="Secrets management: hardcoded source code vs environment variables" viewBox="0 0 660 200" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:-apple-system,'Segoe UI',sans-serif">
  <defs>
    <marker id="sec-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="var(--diagram-muted)"/>
    </marker>
  </defs>
  <rect x="2" y="16" width="310" height="66" rx="8" fill="var(--diagram-red-bg)" stroke="var(--diagram-red)" stroke-width="2"/>
  <text x="157" y="38" text-anchor="middle" font-size="13" font-weight="700" fill="var(--diagram-red-text)">✗ Hardcode in source code</text>
  <text x="157" y="56" text-anchor="middle" font-size="11" fill="var(--diagram-red-text)">committed to git → everyone with repo access sees it</text>
  <text x="157" y="72" text-anchor="middle" font-size="11" fill="var(--diagram-red-text)">deleting it doesn't help: it's in the history</text>
  <rect x="348" y="16" width="310" height="66" rx="8" fill="var(--diagram-green-bg)" stroke="var(--diagram-green)" stroke-width="2"/>
  <text x="503" y="38" text-anchor="middle" font-size="13" font-weight="700" fill="var(--diagram-green)">✓ Environment variables</text>
  <text x="503" y="56" text-anchor="middle" font-size="11" fill="var(--diagram-green)">or a secret manager: AWS Parameter Store, Vault</text>
  <text x="503" y="72" text-anchor="middle" font-size="11" fill="var(--diagram-green)">never in version control</text>
  <line x1="312" y1="49" x2="346" y2="49" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#sec-arrow)"/>
  <rect x="2" y="116" width="656" height="56" rx="8" fill="var(--diagram-yellow-bg)" stroke="var(--diagram-yellow)" stroke-width="1.5"/>
  <text x="330" y="138" text-anchor="middle" font-size="13" font-weight="700" fill="var(--diagram-yellow-stroke)">If a secret ever leaks: rotate it immediately</text>
  <text x="330" y="156" text-anchor="middle" font-size="11" fill="var(--diagram-yellow-stroke)">delete the old value and issue a new one; don't just remove the commit</text>
</svg>

## 2 · Debug mode in production

In development you log **everything**: stack traces, full SQL queries, database config, request bodies. That's useful locally: and dangerous if it ships.

| Log level | Shows                                     | Where                |
| --------- | ----------------------------------------- | -------------------- |
| `debug`   | stack traces, SQL, config, sensitive data | local only           |
| `info`    | normal operational events                 | staging & production |

<svg role="img" aria-label="Log level configuration: debug in dev vs info in production" viewBox="0 0 660 140" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:-apple-system,'Segoe UI',sans-serif">
  <defs>
    <marker id="log-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="var(--diagram-muted)"/>
    </marker>
  </defs>
  <rect x="2" y="18" width="300" height="72" rx="8" fill="var(--diagram-red-bg)" stroke="var(--diagram-red)" stroke-width="1.5"/>
  <text x="152" y="40" text-anchor="middle" font-size="13" font-weight="700" fill="var(--diagram-red-text)">debug in production</text>
  <text x="152" y="58" text-anchor="middle" font-size="11" fill="var(--diagram-red-text)">stack traces + SQL + secrets in logs</text>
  <text x="152" y="74" text-anchor="middle" font-size="11" fill="var(--diagram-red-text)">a log breach = code structure leaked</text>
  <rect x="358" y="18" width="300" height="72" rx="8" fill="var(--diagram-green-bg)" stroke="var(--diagram-green)" stroke-width="1.5"/>
  <text x="508" y="40" text-anchor="middle" font-size="13" font-weight="700" fill="var(--diagram-green)">info in production</text>
  <text x="508" y="58" text-anchor="middle" font-size="11" fill="var(--diagram-green)">only operational events</text>
  <text x="508" y="74" text-anchor="middle" font-size="11" fill="var(--diagram-green)">nothing sensitive</text>
  <line x1="302" y1="54" x2="356" y2="54" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#log-arrow)"/>
</svg>

:::tip[The rule]
Set `debug` locally, `info` in staging and production. Never let a stack trace or a raw SQL query reach a production log.
:::

## 3 · Security headers

HTTP headers that constrain what the browser will do, limiting damage if something else fails.

| Header | Purpose |
| --- | --- |
| **Content-Security-Policy** | whitelist which scripts can run (see [xss and csrf](/backend/security/xss-and-csrf/)) |
| **X-Frame-Options** | stop your site from being embedded in an iframe (clickjacking) |
| **Strict-Transport-Security** | force HTTPS |
| **X-Content-Type-Options** | stop MIME sniffing |

Most frameworks ship this as a one-line middleware: Helmet (Express), or the equivalent in Django/Echo/Gin. Enable it rather than hand-rolling each header.

## The mindset that ties it all together

Every vulnerability in these notes is about **boundaries**: data crossing between systems, privilege levels, languages, or markup:

- SQL injection: untrusted input crossed into the **database query** boundary.
- XSS: user markdown crossed into the **HTML** boundary.
- Broken authorization: a request crossed the boundary of **what different users may access**.

:::note[Ask on every line]
Where is data crossing a boundary? What assumption am I making about it? What if that assumption is wrong?
:::

No single defense is perfect: think in **layers**: validate input → parameterize operations → authorize at the point of access → security headers → monitor and log. An attacker has to break all of them at once, which almost never happens.

Terms: [GLOSSARY](/reference/system-design-glossary/) · Up: [security mindset](/backend/security/)

