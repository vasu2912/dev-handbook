---
title: Design a paste-sharing service
description: A worked design for storing text pastes, serving links quickly, and handling expiration and analytics.
sidebar:
  order: 1
---

## Define use cases and constraints

### Use cases (in scope)

- **User** enters a block of text and gets a randomly generated link.
  - Default: never expires. Optional: timed expiration.
- **User** enters a paste's URL and views the contents.
- **User** is anonymous.
- **Service** tracks page analytics (monthly visit stats).
- **Service** deletes expired pastes.
- **Service** has high availability.

### Out of scope

Account registration, email verification, login, editing, visibility settings, custom shortlinks.

### Constraints and assumptions

- Traffic is not evenly distributed.
- Following a short link must be fast.
- Pastes are text only.
- Page-view analytics do not need to be real time.
- 10 million users, 10 million writes/month, 100 million reads/month → **10:1 read:write**.

### Usage

- ~1.27 KB per paste → **12.7 GB** of new content per month, ~450 GB in 3 years.
- 360 million shortlinks in 3 years.
- **4 writes/second**, **40 reads/second**.

## Sketch the high-level design

<div data-anatomy="system-design--walkthroughs--pastebin-1"></div>

## Define the core components

### Write: user pastes text, gets a link

1. Client → Web Server ([reverse proxy](/system-design/load-balancing/)) → Write API.
2. Write API:
   - Generates a unique URL and checks the database for a duplicate.
   - Saves to the `pastes` table and to an **Object Store** (S3).
   - Returns the URL.

```
shortlink char(7) NOT NULL
expiration_length_in_minutes int NOT NULL
created_at datetime NOT NULL
paste_path varchar(255) NOT NULL
PRIMARY KEY(shortlink)
```

:::tip[Indexing]
`shortlink` as the primary key enforces uniqueness. Add an index on `created_at` to keep lookups logarithmic and in memory.
:::

### URL generation

- Take the **MD5** hash of `ip_address + timestamp` (uniform, 128-bit).
- **Base62** encode it to `[a-zA-Z0-9]`: safe for URLs, deterministic.
- Take the first **7 characters** → 62⁷ possible values, far more than the 360 million needed.

### Read: user views a paste

1. Client → Web Server → Read API.
2. Read API checks the database for the URL; on a hit it fetches the contents from the Object Store, else returns an error.

### Analytics

Realtime analytics are not required → **MapReduce** the web server logs to produce hit counts.

### Expiration

Scan the table for entries whose expiration timestamp is past, then delete or mark them expired.

## Scale the design

<div data-anatomy="system-design--walkthroughs--pastebin-2"></div>

:::caution[Iterate, do not jump]
State that you would benchmark, profile, fix, and repeat: not jump to the final design.
:::

- **Load balancer** + multiple web servers; **CDN**; **master-slave replicas**.
- 40 reads/s (higher at peak) → serve popular pastes from a **memory cache**.
- 4 writes/s → a single master-slave is enough; else [federation, sharding, denormalization, SQL tuning](/system-design/databases/).
- Analytics → data warehouse (Redshift, BigQuery). Object store (S3) handles the 12.7 GB/month.

## Additional talking points

- NoSQL alternatives: key-value or document store (discuss [SQL vs NoSQL](/system-design/databases/)).
- Cache strategies and update policy: see [cache](/system-design/caching/).

---
