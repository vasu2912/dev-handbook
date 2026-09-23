---
title: Repositories
description: Keep database queries and persistence mapping behind focused data-access interfaces.
sidebar:
  order: 5
---

A repository owns database access for a kind of data. It accepts the values needed for one operation, builds and runs the query, maps the result, and returns it. The service decides how several operations compose.

```text
handler     -> formats, validation, status codes
service     -> business processing and orchestration
repository  -> one database operation and one kind of result
```

## Give each operation one meaning

```ts
type BookRepository = {
	findBookById(id: string): Promise<Book | null>;
	listBooks(input: ListBooksInput): Promise<Page<Book>>;
	insertBook(input: NewBook): Promise<Book>;
	updateBook(id: string, input: BookPatch): Promise<Book | null>;
	deleteBook(id: string): Promise<boolean>;
};
```

Do not overload `getBooks(id?)` so that one call lists every book and another fetches one book. Separate methods make the result shape and not-found behavior clear. Callers can read the interface without studying query branches.

The repository may use SQL, a document store, or a remote data service. Keep that choice inside the adapter. Parameterize values, select only required fields, and map database errors into application errors before they reach a handler. See [databases](/system-design/databases/) and [injection attacks](/backend/security/) for the surrounding concerns.

## Keep orchestration out of the repository

A repository can join tables or use a transaction passed by the service. It should not decide that creating an account also sends a welcome message, updates a counter, and publishes an event. That is use-case orchestration and belongs in the service.

One focused interface makes a useful test seam. A fake repository can return a duplicate, a missing record, or a transient failure without requiring a live database. If a repository interface mirrors every detail of a database client, it is a shallow adapter and callers still know too much.

Continue with [services](/backend/architecture/services/) and [data and storage](/backend/data-and-storage/).
