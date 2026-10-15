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

<div data-anatomy="backend--security--xss-and-csrf-1"></div>

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

<div data-anatomy="backend--security--xss-and-csrf-2"></div>

:::note[Why CSRF is less of a threat now]
Modern browsers default cookies to `SameSite=Lax`, so cross-site requests don't carry the cookie. Combined with CORS checks, modern stacks are largely protected. Legacy systems (or `SameSite=None`) are still at risk: keep it in mind, but don't lose sleep over it.
:::

Terms: [GLOSSARY](/reference/system-design-glossary/) · Related: [communication](/backend/api-design/) · Next: [misconfiguration](/backend/security/misconfiguration/) · Up: [security mindset](/backend/security/)

