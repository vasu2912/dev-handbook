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

<div data-anatomy="system-design--security-overview-1"></div>

The edge can absorb denial-of-service traffic and reject known-bad requests. A [reverse proxy](/system-design/reverse-proxy/) can terminate TLS and rate-limit clients. Middleware can authenticate a request and set security headers. The application must authorize each requested object, not only authenticate the user. The database must enforce least-privilege credentials and protect stored data.

Authentication answers "who is this?" Authorization answers "may this identity perform this action on this object?" Keep those decisions separate. An authenticated user can still request another user's record. See the [backend security deep dive](/backend/security/) for injection, authentication, authorization, XSS, CSRF, and misconfiguration.

## Further reading

- [API security checklist](https://github.com/shieldfy/API-Security-Checklist)
- [Security guide for developers](https://github.com/FallibleInc/security-guide-for-developers)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
