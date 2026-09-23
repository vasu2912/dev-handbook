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

<svg role="img" aria-label="Four security contexts: browser, network, server, and backend app" viewBox="0 0 680 100" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:-apple-system,'Segoe UI',sans-serif">
  <rect x="2" y="24" width="162" height="58" rx="8" fill="var(--diagram-purple-bg)" stroke="var(--diagram-purple)" stroke-width="1.5"/>
  <text x="83" y="48" text-anchor="middle" font-size="13" font-weight="600" fill="var(--diagram-ink)">Browser</text>
  <text x="83" y="66" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">HTML · JS · cookies</text>
  <rect x="172" y="24" width="162" height="58" rx="8" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)" stroke-width="1.5"/>
  <text x="253" y="48" text-anchor="middle" font-size="13" font-weight="600" fill="var(--diagram-ink)">Network</text>
  <text x="253" y="66" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">HTTP · encryption</text>
  <rect x="342" y="24" width="162" height="58" rx="8" fill="var(--diagram-yellow-bg)" stroke="var(--diagram-yellow)" stroke-width="1.5"/>
  <text x="423" y="48" text-anchor="middle" font-size="13" font-weight="600" fill="var(--diagram-ink)">Server (OS)</text>
  <text x="423" y="66" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">process · shell</text>
  <rect x="512" y="24" width="162" height="58" rx="8" fill="var(--diagram-green-bg)" stroke="var(--diagram-green)" stroke-width="2.5"/>
  <text x="593" y="48" text-anchor="middle" font-size="13" font-weight="700" fill="var(--diagram-green)">Backend app</text>
  <text x="593" y="66" text-anchor="middle" font-size="11" fill="var(--diagram-green)">your code ← focus</text>
</svg>

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

<svg role="img" aria-label="Data crossing boundaries from backend to database, browser, and operating system" viewBox="0 0 420 236" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:-apple-system,'Segoe UI',sans-serif">
  <defs>
    <marker id="lang-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="var(--diagram-muted)"/>
    </marker>
  </defs>
  <rect x="140" y="14" width="140" height="44" rx="8" fill="var(--diagram-green-bg)" stroke="var(--diagram-green)" stroke-width="2"/>
  <text x="210" y="41" text-anchor="middle" font-size="14" font-weight="700" fill="var(--diagram-green)">Backend app</text>
  <rect x="16" y="182" width="116" height="44" rx="8" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)" stroke-width="1.5"/>
  <text x="74" y="201" text-anchor="middle" font-size="13" font-weight="600" fill="var(--diagram-ink)">Database</text>
  <text x="74" y="217" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">speaks SQL</text>
  <rect x="152" y="182" width="116" height="44" rx="8" fill="var(--diagram-purple-bg)" stroke="var(--diagram-purple)" stroke-width="1.5"/>
  <text x="210" y="201" text-anchor="middle" font-size="13" font-weight="600" fill="var(--diagram-ink)">Browser</text>
  <text x="210" y="217" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">HTML · CSS · JS</text>
  <rect x="288" y="182" width="116" height="44" rx="8" fill="var(--diagram-yellow-bg)" stroke="var(--diagram-yellow)" stroke-width="1.5"/>
  <text x="346" y="201" text-anchor="middle" font-size="13" font-weight="600" fill="var(--diagram-ink)">Operating system</text>
  <text x="346" y="217" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">speaks shell</text>
  <line x1="200" y1="58" x2="86" y2="180" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#lang-arrow)"/>
  <line x1="210" y1="58" x2="210" y2="180" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#lang-arrow)"/>
  <line x1="222" y1="58" x2="338" y2="180" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#lang-arrow)"/>
</svg>

Each language has its own grammar, its own special characters, and its own way to separate **commands** from **data**.

<svg role="img" aria-label="Untrusted user input crossing backend into vulnerability" viewBox="0 0 560 90" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:-apple-system,'Segoe UI',sans-serif">
  <defs>
    <marker id="bd-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="var(--diagram-muted)"/>
    </marker>
  </defs>
  <rect x="2" y="24" width="170" height="52" rx="8" fill="var(--diagram-red-bg)" stroke="var(--diagram-red)" stroke-width="1.5"/>
  <text x="87" y="47" text-anchor="middle" font-size="13" font-weight="600" fill="var(--diagram-ink)">User input</text>
  <text x="87" y="63" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">untrusted data</text>
  <rect x="196" y="24" width="170" height="52" rx="8" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)" stroke-width="1.5"/>
  <text x="281" y="47" text-anchor="middle" font-size="13" font-weight="600" fill="var(--diagram-ink)">Backend</text>
  <text x="281" y="63" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">SQL · shell · HTML</text>
  <rect x="390" y="24" width="168" height="52" rx="8" fill="var(--diagram-red-bg)" stroke="var(--diagram-red)" stroke-width="2"/>
  <text x="474" y="47" text-anchor="middle" font-size="13" font-weight="700" fill="var(--diagram-red-text)">Vulnerability</text>
  <text x="474" y="63" text-anchor="middle" font-size="11" fill="var(--diagram-red-text)">data read as code</text>
  <line x1="172" y1="50" x2="194" y2="50" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#bd-arrow)"/>
  <line x1="366" y1="50" x2="388" y2="50" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#bd-arrow)"/>
</svg>

Most vulnerabilities appear exactly here: a user speaking one language crosses into another language, and their "data" becomes a **command**.

:::note[The root cause]
**Confusion between code and data.** Treating data as code, or code as data, is where every injection attack is born.
:::

## Defense in depth

No single defense is perfect. Layer them so an attacker must break all of them at once:

<svg role="img" aria-label="Defense in depth layers: validation, parameters, auth, headers, monitoring" viewBox="0 0 400 320" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:-apple-system,'Segoe UI',sans-serif">
  <defs>
    <marker id="lay-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="var(--diagram-muted)"/>
    </marker>
  </defs>
  <rect x="10" y="10" width="380" height="52" rx="8" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)" stroke-width="1.5"/>
  <text x="26" y="32" font-size="12" font-weight="700" fill="var(--diagram-accent)">1 · Input validation</text>
  <text x="26" y="50" font-size="11" fill="var(--diagram-muted)">every field, strictly</text>
  <line x1="200" y1="62" x2="200" y2="72" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#lay-arrow)"/>
  <rect x="10" y="74" width="380" height="52" rx="8" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)" stroke-width="1.5"/>
  <text x="26" y="96" font-size="12" font-weight="700" fill="var(--diagram-accent)">2 · Parameterized operations</text>
  <text x="26" y="114" font-size="11" fill="var(--diagram-muted)">never string-concatenate user input</text>
  <line x1="200" y1="126" x2="200" y2="136" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#lay-arrow)"/>
  <rect x="10" y="138" width="380" height="52" rx="8" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)" stroke-width="1.5"/>
  <text x="26" y="160" font-size="12" font-weight="700" fill="var(--diagram-accent)">3 · Authorization at the point of access</text>
  <text x="26" y="178" font-size="11" fill="var(--diagram-muted)">not just the routing layer</text>
  <line x1="200" y1="190" x2="200" y2="200" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#lay-arrow)"/>
  <rect x="10" y="202" width="380" height="52" rx="8" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)" stroke-width="1.5"/>
  <text x="26" y="224" font-size="12" font-weight="700" fill="var(--diagram-accent)">4 · Security headers &amp; policies</text>
  <text x="26" y="242" font-size="11" fill="var(--diagram-muted)">CSP, CORS, cookie flags</text>
  <line x1="200" y1="254" x2="200" y2="264" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#lay-arrow)"/>
  <rect x="10" y="266" width="380" height="52" rx="8" fill="var(--diagram-green-bg)" stroke="var(--diagram-green)" stroke-width="1.5"/>
  <text x="26" y="288" font-size="12" font-weight="700" fill="var(--diagram-green)">5 · Monitoring &amp; logging</text>
  <text x="26" y="306" font-size="11" fill="var(--diagram-green)">alerts, audit trails</text>
</svg>

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
