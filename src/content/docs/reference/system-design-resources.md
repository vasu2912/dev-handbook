---
title: System design resources
description: External references for scalability, latency, concurrency, security, and architecture.
sidebar:
  order: 6
---

External sources that the repository links to. Grouped by use.

## Start here

- [Scalability lecture at Harvard](https://www.youtube.com/watch?v=-W9F__D3oY4): video. Vertical scaling, horizontal scaling, caching, load balancing, replication, partitioning.
- [Scalability (Le Cloud)](https://web.archive.org/web/20221030091841/http://www.lecloud.net/tagged/scalability/chrono): four-part article: clones, databases, caches, asynchronism.

## Design method references

- [How to structure a system design discussion](https://web.archive.org/web/20210505130322/https://www.palantir.com/2011/10/how-to-rock-a-systems-design-interview/)
- [System design overview (Hired in tech)](http://www.hiredintech.com/system-design)
- [Introduction to architecture and system design](https://www.youtube.com/watch?v=ZgdS0EUmn70)
- [System design template (LeetCode)](https://leetcode.com/discuss/career/229177/My-System-Design-Template)

## Key references by topic

- [CAP theorem revisited](https://robertgreiner.com/cap-theorem-revisited/)
- [A plain english introduction to CAP theorem](http://ksat.me/a-plain-english-introduction-to-cap-theorem)
- [Scalability, availability, stability, patterns](http://www.slideshare.net/jboner/scalability-availability-stability-patterns/)
- [Scaling up to your first 10 million users](https://www.youtube.com/watch?v=kKjm4ehYiMs): video, walks the whole scaling journey.
- [Scalable system design patterns](http://horicky.blogspot.com/2010/10/scalable-system-design-patterns.html)
- [Intro to architecting systems for scale](http://lethain.com/introduction-to-architecting-systems-for-scale)
- [From cache to in-memory data grid](http://www.slideshare.net/tmatyashovsky/from-cache-to-in-memory-data-grid-introduction-to-hazelcast)
- [Consistent hashing](http://www.paperplanes.de/2011/12/9/the-magic-of-consistent-hashing.html)
- [Roy Fielding's REST dissertation](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm): the original paper that named REST. Companion to [rest theory](/backend/api-design/).

## Latency and numbers

- [Latency numbers every programmer should know](https://gist.github.com/jboner/2841832)
- [Powers of two](https://en.wikipedia.org/wiki/Power_of_two)
## Concurrency & operating systems

- [Operating Systems: Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/): the book for threads, schedulers, and context switches. Companion to [concurrency vs parallelism](/backend/concurrency/).

## Company engineering blogs

The repository lists ~40 engineering blogs (Airbnb, AWS, Netflix, Stripe, Uber, and more). Read a few for the companies you target. The full list is in [appendix](/system-design/appendix/).

## Flashcard decks (Anki)
![System design flashcard deck cover](/images/system-design/vector/system-design-flashcards.svg)

Binary `.apkg` files in the repository, not part of these notes:

- System Design deck
- System Design Exercises deck
- Object Oriented Design Exercises deck

The sister repo adds a coding deck:

![Coding flashcard deck cover](/images/system-design/vector/coding-flashcards.svg)

- [Coding deck](https://github.com/donnemartin/interactive-coding-challenges/tree/master/anki_cards/Coding.apkg)

## Security

- [PortSwigger Academy](https://portswigger.net/web-security): free, hands-on labs for most web vulnerabilities. Companion to [security mindset](/backend/security/).
- [OWASP Top 10](https://owasp.org/www-project-top-ten/): the current list of top web application risks.
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/): best-practice sheets per topic.
