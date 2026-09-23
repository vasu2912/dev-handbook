---
title: XSS and CSRF
description: Browser attacks, output encoding, Content Security Policy, and request forgery defenses.
sidebar:
  order: 5
---

> Injection attacks that fire **inside the user's browser** instead of the server.

## XSS: cross-site scripting

XSS means an attacker manages to run their **JavaScript** in a victim's browser, in the context of *your* site.

Why that's dangerous: JavaScript in the page context can:

- read everything on the page, including sensitive data
- make API requests **impersonating the logged-in user** (it has the cookies)
- redirect the user to a phishing page and steal credentials
- rewrite the page to trick the user into thinking it's a different site

## How it happens: stored XSS

<svg role="img" aria-label="Stored cross-site scripting attack lifecycle" viewBox="0 0 660 300" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:-apple-system,'Segoe UI',sans-serif">
  <defs>
    <marker id="xss-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="var(--diagram-muted)"/>
    </marker>
  </defs>
  <rect x="2" y="12" width="310" height="54" rx="8" fill="var(--diagram-red-bg)" stroke="var(--diagram-red)" stroke-width="1.5"/>
  <text x="157" y="34" text-anchor="middle" font-size="13" font-weight="700" fill="var(--diagram-red-text)">1 · Attacker posts a comment</text>
  <text x="157" y="52" text-anchor="middle" font-size="11" font-family="monospace" fill="var(--diagram-red-text)">&lt;script&gt;stealCookies()&lt;/script&gt;</text>
  <rect x="348" y="12" width="310" height="54" rx="8" fill="var(--diagram-yellow-bg)" stroke="var(--diagram-yellow)" stroke-width="1.5"/>
  <text x="503" y="34" text-anchor="middle" font-size="13" font-weight="700" fill="var(--diagram-yellow-stroke)">2 · Server stores it raw</text>
  <text x="503" y="52" text-anchor="middle" font-size="11" fill="var(--diagram-yellow-stroke)">no sanitization</text>
  <rect x="348" y="100" width="310" height="54" rx="8" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)" stroke-width="1.5"/>
  <text x="503" y="122" text-anchor="middle" font-size="13" font-weight="700" fill="var(--diagram-ink)">3 · Victim loads the page</text>
  <text x="503" y="140" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">HTML is injected into the DOM</text>
  <rect x="2" y="100" width="310" height="54" rx="8" fill="var(--diagram-red-bg)" stroke="var(--diagram-red)" stroke-width="2"/>
  <text x="157" y="122" text-anchor="middle" font-size="13" font-weight="700" fill="var(--diagram-red-text)">4 · Script runs in their browser</text>
  <text x="157" y="140" text-anchor="middle" font-size="11" fill="var(--diagram-red-text)">reads cookies → sends to attacker</text>
  <line x1="312" y1="39" x2="346" y2="39" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#xss-arrow)"/>
  <path d="M503,66 L503,98" fill="none" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#xss-arrow)"/>
  <path d="M348,127 L312,127" fill="none" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#xss-arrow)"/>
  <text x="2" y="182" font-size="12" fill="var(--diagram-muted)">Root cause: user content is treated as <tspan font-weight="700">code</tspan> (HTML/JS) instead of <tspan font-weight="700">data</tspan>.</text>
  <text x="2" y="200" font-size="12" fill="var(--diagram-muted)">Same confusion as SQL injection: but it fires in the browser, not the server.</text>
</svg>

The comment box renders **markdown → HTML**, and that HTML is injected straight into the DOM. If the server doesn't **sanitize**, the `<script>` tag travels with it and executes for every reader.

React makes this loud: `dangerouslySetInnerHTML` is named that way on purpose. When you set raw HTML, you're on your own.

### Three flavors

| Type | Where the script comes from |
| --- | --- |
| **Stored** | persisted (a comment, a profile): fires for every viewer |
| **Reflected** | echoed from the URL/query params in the response |
| **DOM-based** | injected client-side via `innerHTML` |

## Prevention

1. **Sanitize** user content *before* you store or render it: strip script tags, escape output. Use a proper sanitizer library.
2. **CSP: Content Security Policy.** An HTTP header where your server tells the browser exactly which scripts are allowed to run. A strict CSP (`no inline scripts`, allow-list your domains) blocks injected scripts even if one slips through.

:::caution[CSP is a backstop, not a fix]
Fix the root cause by sanitizing. CSP is your last line of defense: it limits the blast radius if you miss an edge case.
:::

## CSRF: cross-site request forgery

CSRF abuses the fact that browsers **automatically attach cookies** to a site, even when the request originates from a different site.

<svg role="img" aria-label="Cross-site request forgery attack flow exploiting automatic browser cookies" viewBox="0 0 660 240" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:-apple-system,'Segoe UI',sans-serif">
  <defs>
    <marker id="csrf-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="var(--diagram-muted)"/>
    </marker>
  </defs>
  <rect x="2" y="16" width="180" height="58" rx="8" fill="var(--diagram-purple-bg)" stroke="var(--diagram-purple)" stroke-width="1.5"/>
  <text x="92" y="38" text-anchor="middle" font-size="13" font-weight="600" fill="var(--diagram-ink)">User logged into</text>
  <text x="92" y="54" text-anchor="middle" font-size="13" font-weight="700" fill="var(--diagram-purple)">bank.com</text>
  <text x="92" y="68" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">has auth cookie</text>
  <rect x="232" y="16" width="180" height="58" rx="8" fill="var(--diagram-red-bg)" stroke="var(--diagram-red)" stroke-width="1.5"/>
  <text x="322" y="38" text-anchor="middle" font-size="13" font-weight="600" fill="var(--diagram-red-text)">Visits evil.com</text>
  <text x="322" y="54" text-anchor="middle" font-size="11" fill="var(--diagram-red-text)">phishing link</text>
  <rect x="462" y="16" width="196" height="58" rx="8" fill="var(--diagram-red-bg)" stroke="var(--diagram-red)" stroke-width="1.5"/>
  <text x="560" y="38" text-anchor="middle" font-size="13" font-weight="600" fill="var(--diagram-red-text)">evil.com fires a request</text>
  <text x="560" y="54" text-anchor="middle" font-size="11" fill="var(--diagram-red-text)">auto-submitted form → bank.com</text>
  <rect x="232" y="130" width="196" height="58" rx="8" fill="var(--diagram-yellow-bg)" stroke="var(--diagram-yellow)" stroke-width="1.5"/>
  <text x="330" y="152" text-anchor="middle" font-size="13" font-weight="600" fill="var(--diagram-yellow-stroke)">Browser attaches the cookie</text>
  <text x="330" y="170" text-anchor="middle" font-size="11" fill="var(--diagram-yellow-stroke)">looks like a genuine request</text>
  <rect x="462" y="130" width="196" height="58" rx="8" fill="var(--diagram-red-bg)" stroke="var(--diagram-red)" stroke-width="2"/>
  <text x="560" y="152" text-anchor="middle" font-size="13" font-weight="700" fill="var(--diagram-red-text)">Bank processes it</text>
  <text x="560" y="170" text-anchor="middle" font-size="11" fill="var(--diagram-red-text)">attacker's action, victim's session</text>
  <line x1="182" y1="45" x2="230" y2="45" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#csrf-arrow)"/>
  <line x1="412" y1="45" x2="460" y2="45" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#csrf-arrow)"/>
  <line x1="560" y1="74" x2="560" y2="128" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#csrf-arrow)"/>
  <path d="M428,159 L460,159" fill="none" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#csrf-arrow)"/>
</svg>

:::note[Why CSRF is less of a threat now]
Modern browsers default cookies to `SameSite=Lax`, so cross-site requests don't carry the cookie. Combined with CORS checks, modern stacks are largely protected. Legacy systems (or `SameSite=None`) are still at risk: keep it in mind, but don't lose sleep over it.
:::

Terms: [GLOSSARY](/reference/system-design-glossary/) · Related: [communication](/backend/api-design/) · Next: [misconfiguration](/backend/security/misconfiguration/) · Up: [security mindset](/backend/security/)

