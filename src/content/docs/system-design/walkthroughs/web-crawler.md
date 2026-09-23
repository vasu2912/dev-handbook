---
title: Design a web crawler
description: A worked design for crawling pages, detecting duplicates, building an index, and serving search results.
sidebar:
  order: 3
---

## Define use cases and constraints

### Use cases (in scope)

- **Service** crawls a list of URLs and generates a reverse index of words to pages, plus static titles and snippets.
- **User** enters a search term and sees relevant pages with titles and snippets (sketch components only).
- **Service** has high availability.

### Out of scope

Search analytics, personalized results, page rank. Do not use existing systems like Solr or Nutch.

### Constraints and assumptions

- Traffic is not evenly distributed.
- Anonymous users only; results must be fast.
- The crawler must not loop forever (a cycle in the link graph causes this).
- 1 billion links, refreshed ~weekly (more often for popular sites) → 4 billion links/month.
- Average page 500 KB; 100 billion searches/month.

### Usage

- **2 PB** of page content/month, 72 PB in 3 years.
- **1,600 writes/s**, **40,000 searches/s**.

## Sketch the high-level design

![High-level web-crawler architecture](/images/system-design/vector/web-crawler-high-level.svg)

## Define the core components

### Crawl a list of URLs

Use a `crawled_links` table for processed links and their page **signatures**, and a `links_to_crawl` set (Redis sorted set ranks pages by popularity).

The **Crawler Service** loops:

1. Takes the top-ranked link.
2. Checks `crawled_links` for a similar signature → if similar, reduces the link's priority (breaks cycles) and continues.
3. Else, crawls it: queues jobs to the **Reverse Index Service** and **Document Service**, generates the signature, removes it from `links_to_crawl`, and inserts it into `crawled_links`.

:::tip[Detect cycles and duplicates]
- Remove duplicate URLs with `sort | unique`, or **MapReduce** (keep entries with frequency 1) at scale.
- Detect duplicate content by comparing page **signatures**: Jaccard index or cosine similarity.
:::

### Freshness

Add a `timestamp` to each crawl result. Refresh after a default period (say one week), more often for popular sites. Optionally honor `Robots.txt`.

### Search

1. Query API parses the query (remove markup, tokenize, fix typos, normalize).
2. **Reverse Index Service** finds and ranks matching documents.
3. **Document Service** returns titles and snippets.

## Scale the design

![Scaled web-crawler architecture](/images/system-design/vector/web-crawler-scaled.svg)

:::caution[Iterate, do not jump]
Benchmark → profile → fix → repeat.
:::

- Popular queries served from a **memory cache** (Redis/Memcached) to spare the reverse index and document services.
- Reverse Index and Document services need heavy [sharding and federation](/system-design/databases/).
- The crawler keeps its own DNS lookup, uses **connection pooling**. Uses UDP for DNS resolution. Standard HTTP crawling uses HTTP/1.1 or HTTP/2 over TCP. HTTP/3 (QUIC) runs over UDP but is not yet standard for crawlers.
- Crawling is bandwidth-heavy: ensure enough bandwidth.

## Additional talking points

- SQL scaling patterns and NoSQL: see [database](/system-design/databases/).
- Cache update policy: see [cache](/system-design/caching/).

---
