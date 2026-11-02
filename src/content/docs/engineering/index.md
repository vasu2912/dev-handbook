---
title: Backend engineering practice
description: Study notes on object design, testing, containers, delivery, observability, debugging, and integration contracts.
---

A backend needs more than a correct request handler. Its design must survive changes, tests must expose important failures, releases must remain compatible, and production signals must make problems diagnosable.

- [Object design and patterns](/engineering/object-design/) explains composition, interfaces, SOLID, and common patterns through responsibilities.
- [Testing boundaries and behavior](/engineering/testing/) compares unit, integration, contract, end-to-end, and performance testing.
- [Containers and Kubernetes](/engineering/containers-and-kubernetes/) follows an image into a running workload with bounded resources.
- [Git, CI, and safe delivery](/engineering/git-and-delivery/) explains history, automated checks, release strategies, and rollback.
- [Observability and debugging](/engineering/observability/) connects metrics, traces, logs, profiling, and incident reasoning.
- [API integration contracts](/engineering/api-integrations/) explains idempotency, webhooks, schema evolution, and file uploads.
- [Python for AI backends](/engineering/python-for-backends/) explains asynchronous execution, the GIL, typing, validation, and service design.
- [Engineering with AI assistants](/engineering/ai-assisted-engineering/) covers verification, ownership, and delivery risks when using coding assistants.

For identity protocols, read [OAuth and OpenID Connect](/backend/security/oauth-and-oidc/). For distributed failure, continue with [microservices study notes](/microservices/).
