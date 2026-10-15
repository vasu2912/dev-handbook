---
title: Security mindset
description: A practical model for finding backend security assumptions and layering defenses.
sidebar:
  order: 1
---

## Start with assumptions and controls

Security failures start when a backend trusts a fact that a request does not prove. Treat values from browsers, clients, jobs, and dependencies as untrusted until code validates them at the point of use.

For each request, name the assumptions about input shape, identity, origin, ownership, and dependency behavior. Then layer controls around them: validate input, keep data separate from commands, authenticate the caller, authorize each object and function, apply browser and transport policies, use least-privilege credentials, and record sensitive actions.

The rest of this guide focuses on the backend. It shows where these controls apply when data crosses into a database, an operating system, a browser, or another service.

## Scope: four contexts

Trace each request through the contexts it crosses:

<div data-anatomy="backend--security-1"></div>

The rest of these notes focus on the **backend** (green). The OS, network, and browser are separate contexts.

## The core question

Attackers do not care about your framework, library, or language. They ask one question:

:::note[The one question]
**"Where did the developer make an assumption?"**
:::

Every vulnerability in these notes comes down to that. The developer assumed:

- the input from the user was clean
- the user was who they said they were
- the request came from their own front end
- no one would open the network tab and modify parameters

These assumptions feel reasonable under a deadline. But attackers don't use the app the way you expect. They poke at every boundary, modify every input, and guess every assumption.

:::tip[The habit]
Every time you write code, ask: **what could go wrong here in terms of security?**
:::

## The mental model: data crossing boundaries

Your backend speaks **multiple languages** at once:

<div data-anatomy="backend--security-2"></div>

Each language has its own grammar, its own special characters, and its own way to separate **commands** from **data**.

<div data-anatomy="backend--security-3"></div>

Most vulnerabilities appear exactly here: a user speaking one language crosses into another language, and their "data" becomes a **command**.

:::note[The root cause]
**Confusion between code and data.** Treating data as code, or code as data, is where every injection attack is born.
:::

## Defense in depth

No single defense is perfect. Layer them so an attacker must break all of them at once:

<div data-anatomy="backend--security-4"></div>

:::tip[The three questions]
Every time data crosses a boundary, ask:
1. Where is data crossing a boundary?
2. What assumption am I making about the data?
3. What if that assumption is wrong?
:::

Ask these three questions on every line, and you avoid most backend vulnerabilities.

## Resources

- [PortSwigger Academy](https://portswigger.net/web-security): free, hands-on labs for most web vulnerabilities.
- [OWASP Top 10](https://owasp.org/www-project-top-ten/): the current list of top web risks.
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/): best-practice sheets per topic.

## Map of the deep dive

| Note | Covers |
| --- | --- |
| [injection attacks](/backend/security/injection-attacks/) | SQL, NoSQL, command injection |
| [authentication](/backend/security/authentication/) | passwords, sessions, JWT, rate limiting |
| [authorization](/backend/security/authorization/) | BOLA, BFLA, horizontal/vertical attacks |
| [xss and csrf](/backend/security/xss-and-csrf/) | stored/reflected XSS, CSP, CSRF |
| [misconfiguration](/backend/security/misconfiguration/) | secrets, log levels, security headers |

Terms: [GLOSSARY](/reference/system-design-glossary/) · Topic: [security](/backend/security/) · Roadmap: [ROADMAP](/system-design/)
