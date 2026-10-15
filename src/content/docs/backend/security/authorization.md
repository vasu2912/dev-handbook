---
title: Authorization
description: Object and function access checks that keep authenticated users within their permissions.
sidebar:
  order: 4
---

> Authentication answers *who are you?* Authorization answers *what are you allowed to do?* Most authorization bugs come from checking permission at the wrong layer.

## Authentication vs authorization

<div data-anatomy="backend--security--authorization-1"></div>

## The trap: a false sense of security

A typical backend stack: **routing → handlers → service → repository**. The usual mistake is to authenticate and authorize at the routing layer, then trust that the user can reach anything downstream.

<div data-anatomy="backend--security--authorization-2"></div>

Just because the user passed authentication and has the `read:books` permission does **not** mean they can access *every* book. The check must travel all the way to the data layer.

### BOLA: broken object level authorization

The scenario above has a name: **BOLA**. It means the system checks *which user* at the routing layer, but never checks *which object* at the data layer. An attacker writes a loop over IDs and downloads every invoice, every payment, every record.

**The fix: filter by owner at the point of access:**

```sql
-- wrong
SELECT * FROM invoices WHERE id = 7;

-- right
SELECT * FROM invoices WHERE id = 7 AND user_id = :context_user_id;
```

### Don't leak via error codes

<div data-anatomy="backend--security--authorization-3"></div>
If you fetch the row, then check ownership and return **403**, you've confirmed the object exists. An attacker enumerates IDs this way. Instead, do the ownership check **inside the query**: when no row matches, return **404**. Now an attacker can't tell "doesn't exist" from "exists but not yours".

### BFLA: broken function level authorization

BOLA is about *data*. **BFLA** is about *functions*: sensitive admin operations guarded only by a hidden URL ("security through obscurity").

<div data-anatomy="backend--security--authorization-4"></div>
An admin endpoint that lists *all* invoices can't use `AND user_id = …` (admins see everything). It needs a **role check** at the routing layer: is this user actually an admin?
### Indirect object references → use UUIDs

Sequential IDs (`1, 2, 3, …`) are predictable. An attacker who sees `/invoices/102` knows `101` and `103` exist, and can enumerate the whole table.

<div data-anatomy="backend--security--authorization-5"></div>

The fix: use a **UUID** (random, unguessable) as the primary key. It can't be enumerated. The trade-off: UUIDs index a little slower than sequential integers: worth reading up on, but for any externally-exposed ID they're the right default.

## Horizontal vs vertical: the mental model

Forget the acronym soup. Every authorization bug fits one of two shapes:

<div data-anatomy="backend--security--authorization-6"></div>

## Four defenses

1. **Centralize authorization logic**: one layer every request passes through, not scattered checks that get forgotten.
2. **Default deny**: if your logic doesn't explicitly allow an action, deny it. New endpoints are protected by default.
3. **Test authorization specifically**: automated tests for "user A can't read user B" and "member can't reach admin", run in CI. Don't test only the happy path.
4. **Audit logs**: log every sensitive access and every failed authorization check, so you can detect and investigate probing.

Terms: [GLOSSARY](/reference/system-design-glossary/) · Next: [xss and csrf](/backend/security/xss-and-csrf/) · Up: [security mindset](/backend/security/)

