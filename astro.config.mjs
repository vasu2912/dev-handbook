// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Dev Handbook',
			description: 'Practical guides for understanding software and backend engineering.',
			head: [
				{
					tag: 'link',
					attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
				},
				{
					tag: 'link',
					attrs: {
						rel: 'preconnect',
						href: 'https://fonts.gstatic.com',
						crossorigin: '',
					},
				},
				{
					tag: 'link',
					attrs: {
						rel: 'stylesheet',
						href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap",
					},
				},
				{
					tag: 'script',
					attrs: { src: '/js/site.js', defer: true },
				},
			],
			customCss: ['./src/styles/custom.css', './src/styles/sidebar-icons.css', './src/styles/learning.css'],
			components: {
				TwoColumnContent: './src/components/TwoColumnContent.astro',
			},
			sidebar: [
				{
					label: 'Start here',
					collapsed: true,
					items: [
						{ label: 'How to use this handbook', slug: 'guides/how-to-use-this-handbook' },
						{ label: 'A request from browser to database', slug: 'guides/request-lifecycle' },
					],
				},
				{
					label: 'Backend engineering',
					collapsed: true,
					items: [
						{ label: 'Backend foundations', slug: 'backend' },
						{
							label: 'Architecture',
							collapsed: true,
							items: [
								{ label: 'Backend architecture', slug: 'backend/architecture' },
								{ label: 'Request lifecycle', slug: 'backend/architecture/request-lifecycle' },
								{ label: 'Handlers and controllers', slug: 'backend/architecture/handlers-and-controllers' },
								{ label: 'Services', slug: 'backend/architecture/services' },
								{ label: 'Repositories', slug: 'backend/architecture/repositories' },
								{ label: 'Middleware', slug: 'backend/architecture/middleware' },
								{ label: 'Request context', slug: 'backend/architecture/request-context' },
							],
						},
						{
							label: 'API design',
							collapsed: true,
							items: [
								{ label: 'API design', slug: 'backend/api-design' },
								{ label: 'REST', slug: 'backend/api-design/rest' },
								{ label: 'URL design', slug: 'backend/api-design/url-design' },
								{ label: 'Methods and idempotency', slug: 'backend/api-design/methods-and-idempotency' },
								{ label: 'CRUD endpoints', slug: 'backend/api-design/crud-endpoints' },
								{ label: 'List APIs', slug: 'backend/api-design/list-apis' },
								{ label: 'API consistency', slug: 'backend/api-design/consistency' },
							],
						},
						{
							label: 'Concurrency',
							collapsed: true,
							items: [
								{ label: 'Concurrency', slug: 'backend/concurrency' },
								{ label: 'Concurrency and parallelism', slug: 'backend/concurrency/concurrency-and-parallelism' },
								{ label: 'Threads', slug: 'backend/concurrency/threads' },
								{ label: 'Event loop', slug: 'backend/concurrency/event-loop' },
								{ label: 'Goroutines', slug: 'backend/concurrency/goroutines' },
								{ label: 'Race conditions', slug: 'backend/concurrency/race-conditions' },
							],
						},
						{
							label: 'Security',
							collapsed: true,
							items: [
								{ label: 'Security mindset', slug: 'backend/security' },
								{ label: 'Injection attacks', slug: 'backend/security/injection-attacks' },
								{ label: 'Authentication', slug: 'backend/security/authentication' },
								{ label: 'Authorization', slug: 'backend/security/authorization' },
								{ label: 'XSS and CSRF', slug: 'backend/security/xss-and-csrf' },
								{ label: 'Security misconfiguration', slug: 'backend/security/misconfiguration' },
							],
						},
						{ label: 'HTTP and APIs', slug: 'backend/http-and-apis' },
						{ label: 'Data and storage', slug: 'backend/data-and-storage' },
					],
				},
				{
					label: 'System design',
					collapsed: true,
					items: [
						{ label: 'System design overview', slug: 'system-design' },
						{ label: 'A method for designing systems', slug: 'system-design/design-method' },
						{
							label: 'Core topics',
							collapsed: true,
							items: [
								{ label: 'The application layer', slug: 'system-design/application-layer' },
								{ label: 'Asynchronous processing', slug: 'system-design/asynchronous-processing' },
								{ label: 'Availability and consistency', slug: 'system-design/availability-and-consistency' },
								{ label: 'Availability patterns', slug: 'system-design/availability-patterns' },
								{ label: 'Caching', slug: 'system-design/caching' },
								{ label: 'Content delivery networks', slug: 'system-design/cdn' },
								{ label: 'Communication protocols', slug: 'system-design/communication-protocols' },
								{ label: 'Consistency patterns', slug: 'system-design/consistency-patterns' },
								{ label: 'Databases', slug: 'system-design/databases' },
								{ label: 'Domain name system', slug: 'system-design/dns' },
								{ label: 'Latency and throughput', slug: 'system-design/latency-and-throughput' },
								{ label: 'Load balancing', slug: 'system-design/load-balancing' },
								{ label: 'Performance and scalability', slug: 'system-design/performance-and-scalability' },
								{ label: 'Real-time backends', slug: 'system-design/real-time-backends' },
								{ label: 'Reliability and failure', slug: 'system-design/reliability' },
								{ label: 'Reverse proxies', slug: 'system-design/reverse-proxy' },
								{ label: 'Security overview', slug: 'system-design/security-overview' },
							],
						},
						{ label: 'Appendix', slug: 'system-design/appendix' },
						{
							label: 'Design walkthroughs',
							collapsed: true,
							items: [{ autogenerate: { directory: 'system-design/walkthroughs' } }],
						},
					],
				},
				{
					label: 'Agentic AI',
					collapsed: true,
					items: [
						{ label: 'Agentic AI handbook', slug: 'agentic-ai' },
						{ label: 'Learning paths', slug: 'agentic-ai/learning-paths' },
						{
							label: 'LLM foundations',
							collapsed: true,
							items: [
								{ label: 'How language models generate text', slug: 'agentic-ai/foundations/llms' },
								{ label: 'Tokens and context windows', slug: 'agentic-ai/foundations/tokens-and-context' },
								{ label: 'Transformers and attention', slug: 'agentic-ai/foundations/transformers-and-attention' },
								{ label: 'Sampling and structured output', slug: 'agentic-ai/foundations/generation-and-structured-output' },
								{ label: 'Embeddings and semantic search', slug: 'agentic-ai/foundations/embeddings' },
							],
						},
						{
							label: 'Retrieval and RAG',
							collapsed: true,
							items: [
								{ label: 'Retrieval-augmented generation', slug: 'agentic-ai/rag' },
								{ label: 'Build the retrieval pipeline', slug: 'agentic-ai/rag/retrieval-pipeline' },
								{ label: 'Agentic RAG', slug: 'agentic-ai/rag/agentic-rag' },
								{ label: 'Evaluate and secure RAG', slug: 'agentic-ai/rag/evaluation-and-security' },
							],
						},
						{
							label: 'Agents and tools',
							collapsed: true,
							items: [
								{ label: 'What makes a system an agent', slug: 'agentic-ai/agents' },
								{ label: 'The agent loop', slug: 'agentic-ai/agents/agent-loop' },
								{ label: 'Planning and control', slug: 'agentic-ai/agents/planning-and-control' },
								{ label: 'Tools and function calls', slug: 'agentic-ai/tools' },
								{ label: 'Safe tool execution', slug: 'agentic-ai/tools/safe-execution' },
							],
						},
						{
							label: 'Context and execution',
							collapsed: true,
							items: [
								{ label: 'Context engineering and memory', slug: 'agentic-ai/context-and-memory' },
								{ label: 'Agent orchestration', slug: 'agentic-ai/orchestration' },
								{ label: 'Durable execution', slug: 'agentic-ai/orchestration/durable-execution' },
								{ label: 'Multi-agent systems', slug: 'agentic-ai/multi-agent' },
								{ label: 'Subagents and handoffs', slug: 'agentic-ai/multi-agent/subagents' },
							],
						},
						{
							label: 'Model Context Protocol',
							collapsed: true,
							items: [
								{ label: 'MCP mental model', slug: 'agentic-ai/mcp' },
								{ label: 'Tools, resources, and prompts', slug: 'agentic-ai/mcp/primitives' },
								{ label: 'Transports and lifecycle', slug: 'agentic-ai/mcp/transports-and-lifecycle' },
								{ label: 'Elicitation and tasks', slug: 'agentic-ai/mcp/elicitation-and-tasks' },
								{ label: 'MCP security and operations', slug: 'agentic-ai/mcp/security-and-operations' },
								{ label: 'MCP integration patterns', slug: 'agentic-ai/mcp/integration-patterns' },
							],
						},
						{
							label: 'Production engineering',
							collapsed: true,
							items: [
								{ label: 'Agent security', slug: 'agentic-ai/security' },
								{ label: 'Prompt injection', slug: 'agentic-ai/security/prompt-injection' },
								{ label: 'Identity and sandboxing', slug: 'agentic-ai/security/identity-and-sandboxing' },
								{ label: 'Production readiness', slug: 'agentic-ai/production' },
								{ label: 'Reliability', slug: 'agentic-ai/production/reliability' },
								{ label: 'Observability', slug: 'agentic-ai/production/observability' },
								{ label: 'Evaluation', slug: 'agentic-ai/production/evaluation' },
								{ label: 'Performance and cost', slug: 'agentic-ai/production/performance-and-cost' },
							],
						},
						{
							label: 'Frameworks and tutorials',
							collapsed: true,
							items: [
								{ label: 'Choose an agent framework', slug: 'agentic-ai/frameworks' },
								{ label: 'Build a bounded tool agent', slug: 'agentic-ai/tutorials/tool-agent' },
								{ label: 'Build a small RAG system', slug: 'agentic-ai/tutorials/rag' },
								{ label: 'Build an MCP server', slug: 'agentic-ai/tutorials/mcp-server' },
								{ label: 'Build a subagent workflow', slug: 'agentic-ai/tutorials/subagents' },
							],
						},
						{
							label: 'Design walkthroughs',
							collapsed: true,
							items: [
								{ label: 'Agentic system walkthroughs', slug: 'agentic-ai/walkthroughs' },
								{ label: 'Enterprise assistant', slug: 'agentic-ai/walkthroughs/enterprise-assistant' },
								{ label: 'Coding agent', slug: 'agentic-ai/walkthroughs/coding-agent' },
								{ label: 'DevOps investigation agent', slug: 'agentic-ai/walkthroughs/devops-agent' },
							],
						},
						{
							label: 'Quick reference',
							collapsed: true,
							items: [
								{ label: 'Glossary', slug: 'agentic-ai/reference/glossary' },
								{ label: 'Architecture decision guide', slug: 'agentic-ai/reference/decision-guide' },
								{ label: 'MCP version matrix', slug: 'agentic-ai/reference/mcp-version-matrix' },
								{ label: 'Production checklist', slug: 'agentic-ai/reference/production-checklist' },
								{ label: 'Source registry', slug: 'agentic-ai/reference/source-registry' },
								{ label: 'Question coverage', slug: 'agentic-ai/reference/question-coverage' },
							],
						},
					],
				},
				{
					label: 'Java and Spring Boot',
					collapsed: true,
					items: [
						{ label: 'Spring Boot backend development', slug: 'java-spring' },
						{
							label: 'Foundations',
							collapsed: true,
							items: [
								{ label: 'Java essentials', slug: 'java-spring/java-essentials' },
								{ label: 'What Spring Boot does', slug: 'java-spring/spring-boot' },
								{ label: 'Beans and dependency injection', slug: 'java-spring/beans' },
								{ label: 'Configuration and profiles', slug: 'java-spring/configuration' },
								{ label: 'Proxies and annotation behavior', slug: 'java-spring/proxies' },
							],
						},
						{
							label: 'HTTP and security',
							collapsed: true,
							items: [
								{ label: 'Spring request handling', slug: 'java-spring/request-handling' },
								{ label: 'Validation and error responses', slug: 'java-spring/validation-errors' },
								{ label: 'Spring Security', slug: 'java-spring/security' },
							],
						},
						{
							label: 'Data and transactions',
							collapsed: true,
							items: [
								{ label: 'JPA and entity lifecycle', slug: 'java-spring/jpa-entities' },
								{ label: 'Transaction boundaries', slug: 'java-spring/transactions' },
								{ label: 'Queries and fetching', slug: 'java-spring/queries-fetching' },
								{ label: 'Schema changes and connection pools', slug: 'java-spring/schema-pools' },
							],
						},
						{
							label: 'External calls and background work',
							collapsed: true,
							items: [
								{ label: 'Calling external services', slug: 'java-spring/http-clients' },
								{ label: 'Async work and scheduled jobs', slug: 'java-spring/async-jobs' },
								{ label: 'Application events and messaging', slug: 'java-spring/events-messaging' },
								{ label: 'Caching in Spring', slug: 'java-spring/caching' },
							],
						},
						{
							label: 'Testing and production',
							collapsed: true,
							items: [
								{ label: 'Testing Spring applications', slug: 'java-spring/testing' },
								{ label: 'Observability and troubleshooting', slug: 'java-spring/observability' },
								{ label: 'Running a Spring Boot service', slug: 'java-spring/running-services' },
							],
						},
					],
				},
				{
					label: 'Reference',
					collapsed: true,
					items: [{ autogenerate: { directory: 'reference' } }],
				},
			],
		}),
	],
});
