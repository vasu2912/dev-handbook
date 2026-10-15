---
title: Security misconfiguration
description: Configuration defaults, secrets, logging, headers, and least-privilege deployment choices.
sidebar:
  order: 6
---

> You can have perfect code and still leak everything through bad configuration. These are the three classic holes.

## 1 · Secrets management

"Secrets" = API keys, database passwords, encryption keys, JWT signing keys. The one unforgivable mistake is committing them to source control.

<div data-anatomy="backend--security--misconfiguration-1"></div>

## 2 · Debug mode in production

In development you log **everything**: stack traces, full SQL queries, database config, request bodies. That's useful locally: and dangerous if it ships.

| Log level | Shows                                     | Where                |
| --------- | ----------------------------------------- | -------------------- |
| `debug`   | stack traces, SQL, config, sensitive data | local only           |
| `info`    | normal operational events                 | staging & production |

<div data-anatomy="backend--security--misconfiguration-2"></div>

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

