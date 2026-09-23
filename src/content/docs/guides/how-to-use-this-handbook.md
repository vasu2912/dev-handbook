---
title: How to use this handbook
description: Choose the right kind of page and turn a vague backend question into a concrete one.
---

This handbook is a set of working notes, not a course with a finish line. Start with the question in front of you, then choose the page type that matches the job.

## Choose a page type

- **Guide:** Follow a path to complete a task, such as tracing a request or checking a system's failure modes.
- **Explanation:** Build a mental model for one idea, such as why a queue changes the shape of a system.
- **Reference:** Look up a stable fact, field, status code, or term.

If you are still forming the question, read an explanation first. If you know the outcome you need, open a guide.

## Read for constraints

Every design choice in a backend has a cost. As you read, ask four questions:

1. What does this part make easier?
2. What does it make slower, less reliable, or harder to change?
3. What must be true for the choice to work?
4. What happens when that assumption fails?

Those questions turn a list of technologies into a model you can use.

## Keep a small example

When an idea feels abstract, attach it to one request. For example, `POST /orders` might validate input, write an order, publish an event, and return `201 Created`. The details expose the real questions: what can retry, what must be atomic, and what does the client see when the event publish fails?

Continue with [a request from browser to database](/guides/request-lifecycle/).
