---
title: Design a social feed
description: A worked design for timelines, fan-out, search indexing, and notification delivery at scale.
sidebar:
  order: 2
---

## Define use cases and constraints

### Use cases (in scope)

- **User** posts a tweet; the service pushes it to followers (push notifications + emails).
- **User** views the user timeline (own activity).
- **User** views the home timeline (activity from people they follow).
- **User** searches keywords.
- **Service** has high availability.

### Out of scope

Firehose/stream pushes, visibility stripping (hide @reply, hide retweets), analytics.

### Constraints and assumptions

- Traffic is not evenly distributed.
- Posting a tweet must be fast; fan-out must be fast (unless the user has millions of followers).
- 100 million active users, 500 million tweets/day, ~10 fan-out deliveries per tweet.
- 250 billion reads/month, 10 billion searches/month.
- Ingesting tweets is write-heavy; viewing timelines and search are read-heavy.

### Usage

- ~10 KB per tweet → **150 TB** new content/month, 5.4 PB in 3 years.
- **100 thousand reads/s**, **6,000 tweets/s**, **60 thousand fan-out deliveries/s**, **4,000 searches/s**.

## Sketch the high-level design

<div data-anatomy="system-design--walkthroughs--social-feed-1"></div>

## Define the core components

### Post a tweet

1. Client → Web Server ([reverse proxy](/system-design/load-balancing/)) → Write API.
2. Write API stores the tweet in the user's timeline on SQL.
3. Write API calls the **Fan Out Service**:
   - Queries the **User Graph Service** for followers (in a memory cache).
   - Stores the tweet in each follower's **home timeline** in a memory cache: an **O(n)** operation (1,000 followers = 1,000 inserts).
   - Stores the tweet in the **Search Index Service**.
   - Stores media in an **Object Store**.
   - Uses the **Notification Service** (with a queue) to notify followers asynchronously.

:::tip[Data layout in Redis]
Use a native Redis list. Each entry: `tweet_id | user_id | meta`.
:::

### View the home timeline

1. Timeline Service reads tweet ids from the **memory cache**: O(1).
2. Queries **Tweet Info Service** and **User Info Service** with a multiget: O(n).

### View the user timeline

Reads the user's own tweets from the SQL database.

### Search keywords

1. Search API → Search Service: parse, remove markup, tokenize, fix typos, normalize, build boolean query.
2. Query the **Search Cluster** (Lucene): **scatter-gather** across servers, then merge, rank, sort, and return.

## Scale the design

<div data-anatomy="system-design--walkthroughs--social-feed-2"></div>

:::caution[The fan-out bottleneck]
A user with millions of followers takes minutes to fan out, risking race conditions with @replies. Mitigations:
- Avoid fan-out for highly-followed users. Find their tweets via search, merge with the home timeline, re-order at serve time.
- Keep only a few hundred tweets per home timeline in memory.
- Keep only active users (past 30 days) in memory; rebuild others from SQL on demand.
:::

- The **Search Cluster** keeps tweets in memory for low latency.
- SQL read replicas may not handle all cache misses → [federation, sharding, denormalization, SQL tuning](/system-design/databases/), and consider moving data to NoSQL.

## Additional talking points

- Caching placement and update policy: see [cache](/system-design/caching/).
- Asynchronism for notifications: see [asynchronism](/backend/concurrency/).

---
