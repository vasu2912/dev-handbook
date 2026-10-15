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

<div data-anatomy="backend--security--authentication-1"></div>

### Why each stage fails (and how the next fixes it)

**Stage 1: plaintext.** Databases get breached every day. If you store the password as-is, the attacker gets every user's real password. And ~70% of users reuse passwords across sites, so one breach cascades.

**Stage 2: hash.** A hash is a **one-way**, fixed-length output. Same input → same output. You can't reverse it. So you store `hash(password)`.

But attackers built **rainbow tables**: precomputed maps of common password → hash. If your `hash("12345")` matches their table, they reverse it instantly.

**Stage 3: salt.** Add a random per-user string before hashing: `hash(password + salt)`. Store the salt too. Now two users with the same password have different hashes, and rainbow tables return zero matches.

**Stage 4: slow hash.** GPUs can compute billions of SHA-256 hashes per second. So an attacker with your leaked hashes + salts can still **brute force** common passwords offline. The fix is a **slow** hash (Argon2id, bcrypt) with a **cost factor** you tune: e.g. 400 ms per hash. A real user won't notice 400 ms on login; an attacker goes from billions of guesses/second to a handful.

## 2 · Sessions (stateful auth)

Once a user logs in, you can't ask for the password on every request. You create a **session**:

<div data-anatomy="backend--security--authentication-2"></div>

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

<div data-anatomy="backend--security--authentication-3"></div>

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

<div data-anatomy="backend--security--authentication-4"></div>

## 4 · Rate limiting: mandatory on auth

Without rate limiting, an attacker can hammer your login endpoint with millions of guesses, or crash the server with raw volume. Layer it:

<div data-anatomy="backend--security--authentication-5"></div>

Terms: [GLOSSARY](/reference/system-design-glossary/) · Related: [cache](/system-design/caching/) · [communication](/backend/api-design/) · Next: [authorization](/backend/security/authorization/) · Up: [security mindset](/backend/security/)

