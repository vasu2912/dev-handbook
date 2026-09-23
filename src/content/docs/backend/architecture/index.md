---
title: Backend architecture
description: Place request handling, business rules, data access, and cross-cutting concerns at clear seams.
sidebar:
  order: 1
---

An application stays easier to change when each part owns one kind of decision. A handler translates HTTP, a service applies business rules, and a repository talks to a data store. Middleware handles work shared by many requests.

These are deep modules when their interfaces stay small while their implementations hide the detail callers do not need. A service can use several repositories without making every handler understand transactions or query shape. A repository can change SQL without changing the service interface.

## The request path

```text
client -> entry point and router -> middleware -> handler
       -> service -> repository -> database
       <- response flows back through the same request path
```

Read [the request lifecycle](/backend/architecture/request-lifecycle/) for the complete path. The following pages describe the seams:

- [Handlers and controllers](/backend/architecture/handlers-and-controllers/) translate request and response formats.
- [Services](/backend/architecture/services/) apply business rules and coordinate work.
- [Repositories](/backend/architecture/repositories/) own database operations.
- [Middleware](/backend/architecture/middleware/) handles cross-cutting request and response work.
- [Request context](/backend/architecture/request-context/) carries per-request identity, tracing, and deadlines.

## Keep the seams useful

Do not split code because a diagram has three boxes. Split it when the interface removes complexity from callers, gives a test a meaningful seam, or keeps a change local. A layer that only forwards every argument is a shallow module and may not earn its extra files.

The same request path also touches [the application layer](/system-design/application-layer/), [communication protocols](/system-design/communication-protocols/), and [databases](/system-design/databases/). Those pages cover the surrounding system choices.
