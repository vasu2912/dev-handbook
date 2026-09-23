---
title: Services
description: Put business rules and multi-step orchestration behind a transport-independent interface.
sidebar:
  order: 4
---

A service takes validated application data, processes it, and returns a result. It should not know about HTTP request objects, response codes, or JSON binding. If a service method makes sense when called by a queue worker or a CLI, its interface is probably at the right level.

## What a service owns

- Business rules such as eligibility, pricing, and permissions that need domain data.
- Orchestration across multiple repositories or external providers.
- Mapping data from several sources into the result a caller needs.
- Side effects such as sending an email when that action is part of the use case.

Not every service needs a repository. A `sendWelcomeEmail(email)` use case can call an email adapter and return a result without touching a database.

## Keep the interface transport-independent

```ts
type CreateBook = {
	title: string;
	authorId: string;
	ownerId: string;
};

type BookService = {
	createBook(input: CreateBook): Promise<Book>;
};
```

The handler owns how `CreateBook` arrived over HTTP. The service owns what creating a book means. The adapter behind `BookService` may call repositories, an email provider, or both.

| Layer | Owns | Must not own |
| --- | --- | --- |
| Handler or controller | Formats, validation, status codes | Business rules |
| Service | Processing and orchestration | HTTP and response codes |
| Repository | Database operations | Business orchestration |

## Put transaction boundaries around use cases

If several repository calls must succeed or fail together, the service defines the transaction boundary. One repository method can execute one query. A service can open a transaction, call multiple repository methods with that transaction, and commit or roll back.

```text
service: begin transaction
  -> repository: create order
  -> repository: reserve inventory
  -> repository: record payment intent
service: commit, or roll back every operation on error
```

Do not hide a transaction that spans multiple repositories inside one repository. That couples unrelated data operations and makes the use case's atomicity hard to see or test.

Because a service has no HTTP dependency, tests can use in-memory adapters at the seam. The same implementation can serve an HTTP handler, a queue consumer, or a scheduled job. Keep the interface small. A module earns its seam when it hides meaningful processing from several callers.

Continue with [repositories](/backend/architecture/repositories/) and [the request lifecycle](/backend/architecture/request-lifecycle/).
