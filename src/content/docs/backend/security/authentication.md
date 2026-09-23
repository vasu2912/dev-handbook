---
title: Authentication
description: Passwords, sessions, tokens, and rate limits for proving user identity.
sidebar:
  order: 3
---

> Verifying **who** the user is. Get this wrong and an attacker can impersonate users, read private data, act on their behalf, and steal money.

## Use an auth provider first

:::tip[Don't build auth from scratch (at first)]
If you can afford an auth provider (Clerk, Auth0, …), use one. A production auth system is far more than "sign a JWT, store it in a cookie": stateful sessions across devices, social login (OAuth), email↔social account linking, revocation, and more. A security company has a dedicated team thinking about this 24/7.

Migrate to your own auth later, when your provider bill outgrows the savings and you have the bandwidth.
:::

But even with a provider, you still need to understand how auth works: that's what this note covers.

## 1 · Password storage: the evolution

How to store a password correctly went through four stages:

<svg role="img" aria-label="Evolution of password storage from plaintext to slow salted hashing" viewBox="0 0 680 190" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:-apple-system,'Segoe UI',sans-serif">
  <defs>
    <marker id="pw-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="var(--diagram-muted)"/>
    </marker>
  </defs>
  <rect x="2" y="22" width="160" height="62" rx="8" fill="var(--diagram-red-bg)" stroke="var(--diagram-red)" stroke-width="2"/>
  <text x="82" y="44" text-anchor="middle" font-size="13" font-weight="700" fill="var(--diagram-red-text)">1 · Plaintext</text>
  <text x="82" y="62" text-anchor="middle" font-size="12" font-family="monospace" fill="var(--diagram-red-text)">12345</text>
  <text x="82" y="78" text-anchor="middle" font-size="11" fill="var(--diagram-red-text)">✗ breach = exposed</text>
  <rect x="176" y="22" width="160" height="62" rx="8" fill="var(--diagram-yellow-bg)" stroke="var(--diagram-yellow)" stroke-width="2"/>
  <text x="256" y="44" text-anchor="middle" font-size="13" font-weight="700" fill="var(--diagram-yellow-stroke)">2 · Hash</text>
  <text x="256" y="62" text-anchor="middle" font-size="12" font-family="monospace" fill="var(--diagram-yellow-stroke)">bcrypt(12345)</text>
  <text x="256" y="78" text-anchor="middle" font-size="11" fill="var(--diagram-yellow-stroke)">✗ rainbow tables</text>
  <rect x="350" y="22" width="160" height="62" rx="8" fill="var(--diagram-yellow-bg)" stroke="var(--diagram-yellow)" stroke-width="2"/>
  <text x="430" y="44" text-anchor="middle" font-size="13" font-weight="700" fill="var(--diagram-yellow-stroke)">3 · Hash + Salt</text>
  <text x="430" y="62" text-anchor="middle" font-size="12" font-family="monospace" fill="var(--diagram-yellow-stroke)">hash(12345 + salt)</text>
  <text x="430" y="78" text-anchor="middle" font-size="11" fill="var(--diagram-yellow-stroke)">✗ brute force</text>
  <rect x="524" y="22" width="154" height="62" rx="8" fill="var(--diagram-green-bg)" stroke="var(--diagram-green)" stroke-width="2"/>
  <text x="601" y="44" text-anchor="middle" font-size="13" font-weight="700" fill="var(--diagram-green)">4 · Slow + Salt</text>
  <text x="601" y="62" text-anchor="middle" font-size="12" font-family="monospace" fill="var(--diagram-green)">Argon2id</text>
  <text x="601" y="78" text-anchor="middle" font-size="11" fill="var(--diagram-green)">✓ safe</text>
  <line x1="162" y1="53" x2="174" y2="53" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#pw-arrow)"/>
  <line x1="336" y1="53" x2="348" y2="53" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#pw-arrow)"/>
  <line x1="510" y1="53" x2="522" y2="53" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#pw-arrow)"/>
  <text x="2" y="112" font-size="12" fill="var(--diagram-muted)" font-family="monospace">hash(pw + salt)  :   salt: random per-user string</text>
  <text x="2" y="130" font-size="12" fill="var(--diagram-muted)">cost factor: makes the hash deliberately slow (e.g. ~400 ms)</text>
  <text x="2" y="148" font-size="12" fill="var(--diagram-muted)">slow hash: Argon2id or bcrypt: never MD5 / SHA-256 for passwords</text>
</svg>

### Why each stage fails (and how the next fixes it)

**Stage 1: plaintext.** Databases get breached every day. If you store the password as-is, the attacker gets every user's real password. And ~70% of users reuse passwords across sites, so one breach cascades.

**Stage 2: hash.** A hash is a **one-way**, fixed-length output. Same input → same output. You can't reverse it. So you store `hash(password)`.

But attackers built **rainbow tables**: precomputed maps of common password → hash. If your `hash("12345")` matches their table, they reverse it instantly.

**Stage 3: salt.** Add a random per-user string before hashing: `hash(password + salt)`. Store the salt too. Now two users with the same password have different hashes, and rainbow tables return zero matches.

**Stage 4: slow hash.** GPUs can compute billions of SHA-256 hashes per second. So an attacker with your leaked hashes + salts can still **brute force** common passwords offline. The fix is a **slow** hash (Argon2id, bcrypt) with a **cost factor** you tune: e.g. 400 ms per hash. A real user won't notice 400 ms on login; an attacker goes from billions of guesses/second to a handful.

## 2 · Sessions (stateful auth)

Once a user logs in, you can't ask for the password on every request. You create a **session**:

<svg role="img" aria-label="Stateful session authentication lifecycle with secure cookies" viewBox="0 0 660 240" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:-apple-system,'Segoe UI',sans-serif">
  <defs>
    <marker id="sess-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="var(--diagram-muted)"/>
    </marker>
  </defs>
  <rect x="2" y="16" width="150" height="50" rx="8" fill="var(--diagram-purple-bg)" stroke="var(--diagram-purple)" stroke-width="1.5"/>
  <text x="77" y="38" text-anchor="middle" font-size="13" font-weight="600" fill="var(--diagram-ink)">1 · User logs in</text>
  <text x="77" y="54" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">email + password</text>
  <rect x="172" y="16" width="150" height="50" rx="8" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)" stroke-width="1.5"/>
  <text x="247" y="38" text-anchor="middle" font-size="13" font-weight="600" fill="var(--diagram-ink)">2 · Server creates</text>
  <text x="247" y="54" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">session ID (128–256 bits)</text>
  <rect x="342" y="16" width="150" height="50" rx="8" fill="var(--diagram-green-bg)" stroke="var(--diagram-green)" stroke-width="1.5"/>
  <text x="417" y="38" text-anchor="middle" font-size="13" font-weight="600" fill="var(--diagram-ink)">3 · Store it</text>
  <text x="417" y="54" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">DB / Redis + metadata</text>
  <rect x="512" y="16" width="146" height="50" rx="8" fill="var(--diagram-purple-bg)" stroke="var(--diagram-purple)" stroke-width="1.5"/>
  <text x="585" y="38" text-anchor="middle" font-size="13" font-weight="600" fill="var(--diagram-ink)">4 · Set cookie</text>
  <text x="585" y="54" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">HttpOnly · Secure</text>
  <line x1="152" y1="41" x2="170" y2="41" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#sess-arrow)"/>
  <line x1="322" y1="41" x2="340" y2="41" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#sess-arrow)"/>
  <line x1="492" y1="41" x2="510" y2="41" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#sess-arrow)"/>
  <rect x="172" y="120" width="316" height="50" rx="8" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)" stroke-width="1.5"/>
  <text x="330" y="142" text-anchor="middle" font-size="13" font-weight="600" fill="var(--diagram-ink)">5 · Each request sends the cookie</text>
  <text x="330" y="158" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">server reads ID → looks up session → knows the user</text>
  <path d="M585,66 L585,100 L488,100 L488,118" fill="none" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#sess-arrow)"/>
  <text x="546" y="86" font-size="11" fill="var(--diagram-muted)">loop</text>
</svg>

:::tip[The session ID must be unguessable]
Generate it with a **cryptographically secure** PRNG, at least 128 bits. 128 bits means more possible IDs than atoms in the universe: guessing is practically impossible.
:::

### Cookie flags you must set

| Flag | What it does |
| --- | --- |
| **HttpOnly** | JavaScript cannot read the cookie → XSS can't steal the session |
| **Secure** | Cookie sent only over HTTPS → not sniffable on public Wi-Fi |
| **SameSite** | `Strict`/`Lax` → not sent on cross-site requests → blocks CSRF |

:::caution[Never store sessions/JWTs in `localStorage`]
Any JavaScript on the page can read `localStorage`. If your site ever has an XSS hole, the attacker walks away with every session. Use an HttpOnly cookie.
:::

## 3 · JWT (stateless auth)

A JWT is the whole session data, handed to the client. The client sends it back on every request; the server stores nothing.

<svg role="img" aria-label="JSON Web Token components: Header, Payload, and Signature" viewBox="0 0 660 120" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:-apple-system,'Segoe UI',sans-serif">
  <rect x="2" y="24" width="210" height="60" rx="8" fill="var(--diagram-green-bg)" stroke="var(--diagram-green)" stroke-width="1.5"/>
  <text x="107" y="46" text-anchor="middle" font-size="13" font-weight="700" fill="var(--diagram-green)">Header</text>
  <text x="107" y="64" text-anchor="middle" font-size="11" fill="var(--diagram-green)">algorithm (HS256)</text>
  <text x="107" y="78" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">base64-encoded JSON</text>
  <rect x="226" y="24" width="210" height="60" rx="8" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)" stroke-width="1.5"/>
  <text x="331" y="46" text-anchor="middle" font-size="13" font-weight="700" fill="var(--diagram-ink)">Payload</text>
  <text x="331" y="64" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">claims: sub, iat, role…</text>
  <text x="331" y="78" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">NOT encrypted: just base64</text>
  <rect x="450" y="24" width="208" height="60" rx="8" fill="var(--diagram-purple-bg)" stroke="var(--diagram-purple)" stroke-width="1.5"/>
  <text x="554" y="46" text-anchor="middle" font-size="13" font-weight="700" fill="var(--diagram-purple)">Signature</text>
  <text x="554" y="64" text-anchor="middle" font-size="11" fill="var(--diagram-purple)">HMAC(header.payload, secret)</text>
  <text x="554" y="78" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">detects tampering</text>
</svg>

The server signs `header.payload` with a secret key. On each request it re-verifies the signature: if the payload was modified, verification fails and the server rejects it.

### JWT trade-offs (the security angle)

| Concern | Problem | Mitigation |
| --- | --- | --- |
| **Revocation is hard** | Can't delete a token from the client | blacklist tokens; short expiry + refresh tokens |
| **Payload is readable** | base64, not encrypted: anyone can decode it | never store secrets in claims |
| **Storage** | localStorage is XSS-stealable | use an HttpOnly cookie |

:::tip[Stateful vs stateless]
Prefer **stateful sessions** unless you have a specific scaling need. Sessions are simpler, and revocation is trivial (delete the row). If you do use JWTs: short expiry (minutes to hours), a refresh-token flow with server-side storage, and HttpOnly cookies: never localStorage.
:::

<svg role="img" aria-label="Token refresh flow with rotation and reuse detection" viewBox="0 0 680 340" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:-apple-system,'Segoe UI',sans-serif">
  <defs>
    <marker id="req-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path d="M0,0 L0,8 L8,4 z" fill="var(--diagram-muted)"/>
    </marker>
  </defs>

  <text x="140" y="24" text-anchor="middle" font-size="14" font-weight="700" fill="var(--diagram-ink)">Client</text>
  <text x="540" y="24" text-anchor="middle" font-size="14" font-weight="700" fill="var(--diagram-ink)">Server</text>
  
  <line x1="140" y1="36" x2="140" y2="330" stroke="var(--diagram-border)" stroke-width="2" stroke-dasharray="4 4"/>
  <line x1="540" y1="36" x2="540" y2="330" stroke="var(--diagram-border)" stroke-width="2" stroke-dasharray="4 4"/>

  <text x="20" y="60" font-size="11" font-weight="600" fill="var(--diagram-muted)">1. Authenticate</text>
  <line x1="140" y1="64" x2="530" y2="64" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#req-arrow)"/>
  <text x="340" y="58" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">login (email, password)</text>
  
  <line x1="540" y1="84" x2="150" y2="84" stroke="var(--diagram-green)" stroke-width="1.5" marker-end="url(#req-arrow)"/>
  <text x="340" y="80" text-anchor="middle" font-size="11" fill="var(--diagram-green)">Access Token (15m) + Refresh Token A (7d)</text>

  <text x="20" y="110" font-size="11" font-weight="600" fill="var(--diagram-muted)">2. API calls</text>
  <line x1="140" y1="114" x2="530" y2="114" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#req-arrow)"/>
  <text x="340" y="108" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">GET /data (Auth: Bearer Access Token)</text>
  
  <text x="20" y="140" font-size="11" font-weight="600" fill="var(--diagram-red-text)">3. Token expires</text>
  <line x1="140" y1="144" x2="530" y2="144" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#req-arrow)"/>
  <line x1="540" y1="164" x2="150" y2="164" stroke="var(--diagram-red)" stroke-width="1.5" marker-end="url(#req-arrow)"/>
  <text x="340" y="160" text-anchor="middle" font-size="11" font-weight="600" fill="var(--diagram-red-text)">401 Unauthorized</text>

  <text x="20" y="190" font-size="11" font-weight="600" fill="var(--diagram-muted)">4. Rotate tokens</text>
  <line x1="140" y1="194" x2="530" y2="194" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#req-arrow)"/>
  <text x="340" y="188" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">POST /auth/refresh (Refresh Token A)</text>
  
  <rect x="550" y="180" width="120" height="34" rx="4" fill="var(--diagram-neutral-light)" stroke="var(--diagram-border)" stroke-width="1"/>
  <text x="610" y="196" text-anchor="middle" font-size="10" fill="var(--diagram-muted)">Invalidate Token A</text>
  <text x="610" y="208" text-anchor="middle" font-size="10" fill="var(--diagram-muted)">Issue Token B</text>

  <line x1="540" y1="224" x2="150" y2="224" stroke="var(--diagram-green)" stroke-width="1.5" marker-end="url(#req-arrow)"/>
  <text x="340" y="220" text-anchor="middle" font-size="11" fill="var(--diagram-green)">NEW Access Token + NEW Refresh Token B</text>

  <text x="20" y="250" font-size="11" font-weight="600" fill="var(--diagram-muted)">5. Resume calls</text>
  <line x1="140" y1="254" x2="530" y2="254" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#req-arrow)"/>
  <text x="340" y="248" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">GET /data (Auth: Bearer NEW Access Token)</text>

  <rect x="20" y="280" width="640" height="50" rx="6" fill="var(--diagram-red-bg)" stroke="var(--diagram-red-stroke)" stroke-width="1"/>
  <text x="340" y="300" text-anchor="middle" font-size="12" font-weight="700" fill="var(--diagram-red-text)">Security feature: Reuse Detection</text>
  <text x="340" y="316" text-anchor="middle" font-size="11" fill="var(--diagram-red-text)">If an attacker steals and uses old Refresh Token A, server detects reuse → invalidates entire token family → user must re-login.</text>
</svg>

## 4 · Rate limiting: mandatory on auth

Without rate limiting, an attacker can hammer your login endpoint with millions of guesses, or crash the server with raw volume. Layer it:

<svg role="img" aria-label="Three layers of rate limiting: per-IP, per-account, and global" viewBox="0 0 660 150" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:-apple-system,'Segoe UI',sans-serif">
  <defs>
    <marker id="rl-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="var(--diagram-muted)"/>
    </marker>
  </defs>
  <rect x="2" y="18" width="210" height="72" rx="8" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)" stroke-width="1.5"/>
  <text x="107" y="40" text-anchor="middle" font-size="13" font-weight="700" fill="var(--diagram-ink)">Per-IP</text>
  <text x="107" y="58" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">10 attempts / min</text>
  <text x="107" y="74" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">stops automated bots</text>
  <rect x="226" y="18" width="210" height="72" rx="8" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)" stroke-width="1.5"/>
  <text x="331" y="40" text-anchor="middle" font-size="13" font-weight="700" fill="var(--diagram-ink)">Per-account</text>
  <text x="331" y="58" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">5 failures / 15 min → lock</text>
  <text x="331" y="74" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">stops rotated-IP attacks</text>
  <rect x="450" y="18" width="208" height="72" rx="8" fill="var(--diagram-green-bg)" stroke="var(--diagram-green)" stroke-width="1.5"/>
  <text x="554" y="40" text-anchor="middle" font-size="13" font-weight="700" fill="var(--diagram-green)">Global</text>
  <text x="554" y="58" text-anchor="middle" font-size="11" fill="var(--diagram-green)">N attempts / min, system-wide</text>
  <text x="554" y="74" text-anchor="middle" font-size="11" fill="var(--diagram-green)">stops credential-stuffing</text>
  <line x1="212" y1="54" x2="224" y2="54" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#rl-arrow)"/>
  <line x1="436" y1="54" x2="448" y2="54" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#rl-arrow)"/>
  <text x="2" y="118" font-size="12" fill="var(--diagram-muted)">Be stricter on auth endpoints than general API endpoints.</text>
  <text x="2" y="136" font-size="12" fill="var(--diagram-muted)">An attacker rotates IPs (botnets, VPNs) → per-account and global layers catch what per-IP misses.</text>
</svg>

Terms: [GLOSSARY](/reference/system-design-glossary/) · Related: [cache](/system-design/caching/) · [communication](/backend/api-design/) · Next: [authorization](/backend/security/authorization/) · Up: [security mindset](/backend/security/)

