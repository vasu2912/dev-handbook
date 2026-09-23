---
title: Security overview
description: Apply encryption, safe data access, least privilege, and layered controls across a system.
sidebar:
  order: 16
---

Security is a property of the whole request path. Start with a small set of controls that prevent common failures, then make each trust decision explicit:

- Encrypt data in transit and at rest.
- Use parameterized queries or prepared statements to prevent SQL injection.
- Encode output for its destination context to prevent cross-site scripting (XSS).
- Treat input validation as a useful additional check, not the primary SQL injection or XSS defense.
- Grant each identity only the permissions it needs, following least privilege.

<svg role="img" aria-label="Defense in depth from edge controls through reverse proxy, application, and database" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:-apple-system,'Segoe UI',sans-serif"><rect width="800" height="500" fill="var(--diagram-bg)"/><text x="400" y="40" font-weight="700" font-size="20" text-anchor="middle" fill="var(--diagram-ink)">Defense-in-depth layers</text><rect x="50" y="80" width="700" height="380" rx="12" fill="var(--diagram-neutral-light)" stroke="var(--diagram-border)" stroke-width="2"/><text x="80" y="110" font-weight="700" font-size="16" fill="var(--diagram-ink)">1. Edge</text><text x="400" y="110" font-size="14" text-anchor="middle" fill="var(--diagram-muted)">WAF, CDN, DDoS protection</text><rect x="90" y="140" width="620" height="300" rx="10" fill="var(--diagram-neutral)" stroke="var(--diagram-border)" stroke-width="2"/><text x="120" y="170" font-weight="700" font-size="16" fill="var(--diagram-ink)">2. Reverse proxy</text><text x="400" y="170" font-size="14" text-anchor="middle" fill="var(--diagram-muted)">TLS termination, IP rate limiting</text><rect x="130" y="200" width="540" height="220" rx="8" fill="var(--diagram-accent-light)" stroke="var(--diagram-accent)" stroke-width="2"/><text x="160" y="230" font-weight="700" font-size="16" fill="var(--diagram-ink)">3. API gateway or middleware</text><text x="430" y="230" font-size="14" text-anchor="middle" fill="var(--diagram-muted)">Auth, CORS, security headers</text><rect x="170" y="260" width="460" height="140" rx="6" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)" stroke-width="2"/><text x="200" y="290" font-weight="700" font-size="16" fill="var(--diagram-ink)">4. Application</text><text x="410" y="290" font-size="14" text-anchor="middle" fill="var(--diagram-muted)">Authorization, input validation</text><rect x="210" y="320" width="380" height="60" rx="4" fill="var(--diagram-green-bg)" stroke="var(--diagram-green)" stroke-width="2"/><text x="230" y="355" font-weight="700" font-size="16" fill="var(--diagram-green)">5. Database</text><text x="430" y="355" font-size="14" text-anchor="middle" fill="var(--diagram-ink)">Parameterized queries, least privilege</text></svg>

The edge can absorb denial-of-service traffic and reject known-bad requests. A [reverse proxy](/system-design/reverse-proxy/) can terminate TLS and rate-limit clients. Middleware can authenticate a request and set security headers. The application must authorize each requested object, not only authenticate the user. The database must enforce least-privilege credentials and protect stored data.

Authentication answers "who is this?" Authorization answers "may this identity perform this action on this object?" Keep those decisions separate. An authenticated user can still request another user's record. See the [backend security deep dive](/backend/security/) for injection, authentication, authorization, XSS, CSRF, and misconfiguration.

## Further reading

- [API security checklist](https://github.com/shieldfy/API-Security-Checklist)
- [Security guide for developers](https://github.com/FallibleInc/security-guide-for-developers)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
