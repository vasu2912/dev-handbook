---
title: Build an MCP server
description: Build and inspect a TypeScript MCP 2026 server that exposes one validated tool over stdio.
---

This tutorial builds a local stdio MCP server with the TypeScript SDK v2. The v2 line implements protocol revision `2026-07-28` and uses different package paths from older tutorials.

## Create the project

```sh
mkdir order-status-mcp
cd order-status-mcp
npm init -y
npm pkg set type=module
npm install @modelcontextprotocol/server zod tsx
mkdir src
```

The SDK ships ES modules, so the package needs `type=module`.

## Register a read-only tool

Create `src/index.ts`:

```ts
import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';

function createServer(): McpServer {
	const server = new McpServer({
		name: 'order-status',
		version: '1.0.0',
	});

	server.registerTool(
		'get-order-status',
		{
			description: 'Read the current status of one order by its ord_ identifier. This tool does not change the order.',
			inputSchema: z.object({
				orderId: z.string().regex(/^ord_[0-9]+$/),
			}),
			outputSchema: z.object({
				orderId: z.string(),
				status: z.enum(['pending', 'paid', 'shipped', 'cancelled']),
			}),
		},
		async ({ orderId }) => {
			const output = { orderId, status: 'shipped' as const };
			return {
				content: [{ type: 'text', text: JSON.stringify(output) }],
				structuredContent: output,
			};
		},
	);

	return server;
}

void serveStdio(createServer);
console.error('order-status MCP server running on stdio');
```

The schema rejects malformed identifiers before the handler runs. A real handler must also apply authenticated user and tenant authorization. The fixed result keeps this tutorial focused on the protocol.

## Run the server through the Inspector

```sh
npx @modelcontextprotocol/inspector npx tsx src/index.ts
```

Connect in the opened browser, select **Tools**, and call `get-order-status` with:

```json
{ "orderId": "ord_42" }
```

The tool returns:

```json
{ "orderId": "ord_42", "status": "shipped" }
```

Try `42` as the identifier. The SDK should reject the input before the handler executes.

## Keep stdout clean

Stdio uses standard output for JSON-RPC. Log to standard error. One `console.log` can corrupt the protocol stream.

## Move to remote hosting deliberately

Remote deployment uses Streamable HTTP and adds authentication, authorization, TLS, origins, rate limits, and resource-server metadata. Reuse the server factory, but follow the SDK's current HTTP serving guide rather than copying a v1 `StreamableHTTPServerTransport` example.

## Sources

- [MCP TypeScript SDK v2](https://ts.sdk.modelcontextprotocol.io/v2/)
- [Build your first server](https://ts.sdk.modelcontextprotocol.io/v2/get-started/first-server)

*Last verified: September 23, 2026.*
