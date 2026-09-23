---
title: Agentic AI question coverage
description: Map all 560 source questions to the handbook pages that teach the underlying topics.
---

This index proves coverage of the original study list. The handbook uses a dependency-based learning order instead of presenting 560 isolated answers.

Questions retain their original wording. A mapping identifies the primary reading page. Related links on that page lead to deeper material.

## Generative AI and LLM foundations

| # | Source question | Primary reading |
|---:|---|---|
| 1 | What is Generative AI? | [How language models generate text](/agentic-ai/foundations/llms/) |
| 2 | What is an LLM and how does it work at a high level? | [How language models generate text](/agentic-ai/foundations/llms/) |
| 3 | What is a transformer? | [Transformers and attention](/agentic-ai/foundations/transformers-and-attention/) |
| 4 | Explain self-attention. | [Transformers and attention](/agentic-ai/foundations/transformers-and-attention/) |
| 5 | What are tokens and tokenization? | [Tokens and context windows](/agentic-ai/foundations/tokens-and-context/) |
| 6 | What is a context window? | [Tokens and context windows](/agentic-ai/foundations/tokens-and-context/) |
| 7 | What happens when the context window is exceeded? | [Tokens and context windows](/agentic-ai/foundations/tokens-and-context/) |
| 8 | What is temperature? | [Sampling and structured output](/agentic-ai/foundations/generation-and-structured-output/) |
| 9 | What are top-p and top-k sampling? | [Sampling and structured output](/agentic-ai/foundations/generation-and-structured-output/) |
| 10 | What is the difference between deterministic and probabilistic generation? | [Sampling and structured output](/agentic-ai/foundations/generation-and-structured-output/) |
| 11 | What is hallucination? | [How language models generate text](/agentic-ai/foundations/llms/) |
| 12 | Why do LLMs hallucinate? | [How language models generate text](/agentic-ai/foundations/llms/) |
| 13 | How can hallucinations be reduced? | [How language models generate text](/agentic-ai/foundations/llms/) |
| 14 | What is grounding? | [How language models generate text](/agentic-ai/foundations/llms/) |
| 15 | What is prompt engineering? | [Sampling and structured output](/agentic-ai/foundations/generation-and-structured-output/) |
| 16 | System prompt vs user prompt vs assistant message? | [Sampling and structured output](/agentic-ai/foundations/generation-and-structured-output/) |
| 17 | What are few-shot and zero-shot prompting? | [Sampling and structured output](/agentic-ai/foundations/generation-and-structured-output/) |
| 18 | What is chain-of-thought prompting? | [Sampling and structured output](/agentic-ai/foundations/generation-and-structured-output/) |
| 19 | What is structured output? | [Sampling and structured output](/agentic-ai/foundations/generation-and-structured-output/) |
| 20 | How do you make an LLM return valid JSON? | [Sampling and structured output](/agentic-ai/foundations/generation-and-structured-output/) |
| 21 | What are embeddings? | [Embeddings and semantic search](/agentic-ai/foundations/embeddings/) |
| 22 | How are embeddings generated? | [Embeddings and semantic search](/agentic-ai/foundations/embeddings/) |
| 23 | What is cosine similarity? | [Embeddings and semantic search](/agentic-ai/foundations/embeddings/) |
| 24 | Embedding model vs generative model? | [Embeddings and semantic search](/agentic-ai/foundations/embeddings/) |
| 25 | What is semantic search? | [Embeddings and semantic search](/agentic-ai/foundations/embeddings/) |
| 26 | What is a vector database? | [Embeddings and semantic search](/agentic-ai/foundations/embeddings/) |
| 27 | Vector database vs relational database? | [Embeddings and semantic search](/agentic-ai/foundations/embeddings/) |
| 28 | What is RAG? | [Retrieval-augmented generation](/agentic-ai/rag/) |
| 29 | Explain a complete RAG pipeline. | [Retrieval-augmented generation](/agentic-ai/rag/) |
| 30 | RAG vs fine-tuning. | [Retrieval-augmented generation](/agentic-ai/rag/) |
| 31 | When would you fine-tune instead of using RAG? | [Retrieval-augmented generation](/agentic-ai/rag/) |
| 32 | What is chunking? | [Build the retrieval pipeline](/agentic-ai/rag/retrieval-pipeline/) |
| 33 | What chunk size would you choose? | [Build the retrieval pipeline](/agentic-ai/rag/retrieval-pipeline/) |
| 34 | What is chunk overlap? | [Build the retrieval pipeline](/agentic-ai/rag/retrieval-pipeline/) |
| 35 | What is hybrid search? | [Build the retrieval pipeline](/agentic-ai/rag/retrieval-pipeline/) |
| 36 | What is reranking? | [Build the retrieval pipeline](/agentic-ai/rag/retrieval-pipeline/) |
| 37 | What is query rewriting? | [Build the retrieval pipeline](/agentic-ai/rag/retrieval-pipeline/) |
| 38 | What is semantic caching? | [Agent performance and cost](/agentic-ai/production/performance-and-cost/) |
| 39 | What are prompt injection attacks? | [Prompt injection](/agentic-ai/security/prompt-injection/) |
| 40 | What is model jailbreak? | [Prompt injection](/agentic-ai/security/prompt-injection/) |

## Agentic AI foundations

| # | Source question | Primary reading |
|---:|---|---|
| 41 | What is Agentic AI? | [What makes a system an agent](/agentic-ai/agents/) |
| 42 | How is Agentic AI different from Generative AI? | [What makes a system an agent](/agentic-ai/agents/) |
| 43 | What makes an AI system an "agent"? | [What makes a system an agent](/agentic-ai/agents/) |
| 44 | What are the core components of an AI agent? | [What makes a system an agent](/agentic-ai/agents/) |
| 45 | What is the agent loop? | [What makes a system an agent](/agentic-ai/agents/) |
| 46 | Explain **Observe → Reason → Act → Observe**. | [What makes a system an agent](/agentic-ai/agents/) |
| 47 | What is tool calling? | [The agent loop](/agentic-ai/agents/agent-loop/) |
| 48 | What is function calling? | [The agent loop](/agentic-ai/agents/agent-loop/) |
| 49 | Tool calling vs API calling? | [The agent loop](/agentic-ai/agents/agent-loop/) |
| 50 | What is agent orchestration? | [The agent loop](/agentic-ai/agents/agent-loop/) |
| 51 | What is an autonomous agent? | [The agent loop](/agentic-ai/agents/agent-loop/) |
| 52 | What is a semi-autonomous agent? | [The agent loop](/agentic-ai/agents/agent-loop/) |
| 53 | When should an agent ask for human approval? | [The agent loop](/agentic-ai/agents/agent-loop/) |
| 54 | What is Human-in-the-Loop? | [The agent loop](/agentic-ai/agents/agent-loop/) |
| 55 | What is Human-on-the-Loop? | [The agent loop](/agentic-ai/agents/agent-loop/) |
| 56 | Agent vs chatbot? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 57 | Agent vs workflow? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 58 | Agent vs traditional microservice? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 59 | Agent vs RPA? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 60 | Agent vs Copilot? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 61 | What is an agent's environment? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 62 | What is an agent's state? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 63 | What is agent memory? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 64 | Short-term memory vs long-term memory? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 65 | Episodic memory vs semantic memory? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 66 | What is working memory? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 67 | What information should not be stored in agent memory? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 68 | How do you prevent memory poisoning? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 69 | What is agent planning? | [Planning and control](/agentic-ai/agents/planning-and-control/) |
| 70 | What is task decomposition? | [Planning and control](/agentic-ai/agents/planning-and-control/) |
| 71 | What is reflection in an AI agent? | [Planning and control](/agentic-ai/agents/planning-and-control/) |
| 72 | What is self-correction? | [Planning and control](/agentic-ai/agents/planning-and-control/) |
| 73 | What is ReAct? | [Planning and control](/agentic-ai/agents/planning-and-control/) |
| 74 | What does **Reason + Act** mean? | [Planning and control](/agentic-ai/agents/planning-and-control/) |
| 75 | What is Plan-and-Execute? | [Planning and control](/agentic-ai/agents/planning-and-control/) |
| 76 | ReAct vs Plan-and-Execute? | [Planning and control](/agentic-ai/agents/planning-and-control/) |
| 77 | What is Tree of Thoughts? | [Planning and control](/agentic-ai/agents/planning-and-control/) |
| 78 | What is graph-based agent orchestration? | [Planning and control](/agentic-ai/agents/planning-and-control/) |
| 79 | What is an agent state machine? | [Planning and control](/agentic-ai/agents/planning-and-control/) |
| 80 | What makes an agent deterministic vs non-deterministic? | [Planning and control](/agentic-ai/agents/planning-and-control/) |

## Agent architecture

| # | Source question | Primary reading |
|---:|---|---|
| 81 | Design a production AI agent architecture. | [Agent orchestration](/agentic-ai/orchestration/) |
| 82 | What components would your agent platform contain? | [Agent orchestration](/agentic-ai/orchestration/) |
| 83 | Where should business logic reside: prompt or application code? | [Agent orchestration](/agentic-ai/orchestration/) |
| 84 | What should the LLM decide vs what should deterministic code decide? | [Agent orchestration](/agentic-ai/orchestration/) |
| 85 | How do you implement an agent loop? | [Agent orchestration](/agentic-ai/orchestration/) |
| 86 | How do you stop an infinite agent loop? | [Agent orchestration](/agentic-ai/orchestration/) |
| 87 | How do you limit the number of tool calls? | [Agent orchestration](/agentic-ai/orchestration/) |
| 88 | How do you implement agent timeout? | [Agent orchestration](/agentic-ai/orchestration/) |
| 89 | How do you implement an agent execution budget? | [Agent orchestration](/agentic-ai/orchestration/) |
| 90 | How do you handle token budgets? | [Agent orchestration](/agentic-ai/orchestration/) |
| 91 | How would you handle retries? | [Durable agent execution](/agentic-ai/orchestration/durable-execution/) |
| 92 | When should tool calls be retried? | [Durable agent execution](/agentic-ai/orchestration/durable-execution/) |
| 93 | What is exponential backoff? | [Durable agent execution](/agentic-ai/orchestration/durable-execution/) |
| 94 | How do you make agent execution idempotent? | [Durable agent execution](/agentic-ai/orchestration/durable-execution/) |
| 95 | How do you checkpoint agent state? | [Durable agent execution](/agentic-ai/orchestration/durable-execution/) |
| 96 | How do you resume a failed agent workflow? | [Durable agent execution](/agentic-ai/orchestration/durable-execution/) |
| 97 | How do you persist conversation state? | [Durable agent execution](/agentic-ai/orchestration/durable-execution/) |
| 98 | Stateless agents vs stateful agents? | [Durable agent execution](/agentic-ai/orchestration/durable-execution/) |
| 99 | How would you scale agents horizontally? | [Durable agent execution](/agentic-ai/orchestration/durable-execution/) |
| 100 | Where would you store agent state in Kubernetes? | [Durable agent execution](/agentic-ai/orchestration/durable-execution/) |
| 101 | Would you keep an agent running continuously? | [Durable agent execution](/agentic-ai/orchestration/durable-execution/) |
| 102 | How would you design asynchronous agents? | [Durable agent execution](/agentic-ai/orchestration/durable-execution/) |
| 103 | How do queues help in agent systems? | [Durable agent execution](/agentic-ai/orchestration/durable-execution/) |
| 104 | Kafka vs RabbitMQ/SQS for agent orchestration? | [Durable agent execution](/agentic-ai/orchestration/durable-execution/) |
| 105 | How do you prevent duplicate agent jobs? | [Durable agent execution](/agentic-ai/orchestration/durable-execution/) |
| 106 | How do you implement distributed locking? | [Durable agent execution](/agentic-ai/orchestration/durable-execution/) |
| 107 | How do you handle long-running agent tasks? | [Durable agent execution](/agentic-ai/orchestration/durable-execution/) |
| 108 | How do you handle partial failures? | [Durable agent execution](/agentic-ai/orchestration/durable-execution/) |
| 109 | How would you implement Saga-like compensation for agent actions? | [Durable agent execution](/agentic-ai/orchestration/durable-execution/) |
| 110 | How do you roll back an agent's actions? | [Durable agent execution](/agentic-ai/orchestration/durable-execution/) |

## Tool calling

| # | Source question | Primary reading |
|---:|---|---|
| 111 | What is an AI tool? | [Tools and function calls](/agentic-ai/tools/) |
| 112 | How does an LLM decide which tool to call? | [Tools and function calls](/agentic-ai/tools/) |
| 113 | How is a tool schema presented to an LLM? | [Tools and function calls](/agentic-ai/tools/) |
| 114 | What information should a tool schema contain? | [Tools and function calls](/agentic-ai/tools/) |
| 115 | Why are good tool descriptions important? | [Tools and function calls](/agentic-ai/tools/) |
| 116 | What happens if two tools have similar descriptions? | [Tools and function calls](/agentic-ai/tools/) |
| 117 | How do you improve tool selection accuracy? | [Tools and function calls](/agentic-ai/tools/) |
| 118 | Should an LLM directly execute a tool? | [Tools and function calls](/agentic-ai/tools/) |
| 119 | How do you validate tool arguments? | [Tools and function calls](/agentic-ai/tools/) |
| 120 | What happens if the model generates invalid arguments? | [Tools and function calls](/agentic-ai/tools/) |
| 121 | How do you handle tool exceptions? | [Tools and function calls](/agentic-ai/tools/) |
| 122 | How do you handle tool timeouts? | [Tools and function calls](/agentic-ai/tools/) |
| 123 | How do you handle tool permission failures? | [Safe tool execution](/agentic-ai/tools/safe-execution/) |
| 124 | How do you restrict dangerous tools? | [Safe tool execution](/agentic-ai/tools/safe-execution/) |
| 125 | Read-only tool vs write tool? | [Safe tool execution](/agentic-ai/tools/safe-execution/) |
| 126 | How do you implement approval before executing a write action? | [Safe tool execution](/agentic-ai/tools/safe-execution/) |
| 127 | What tools should always require confirmation? | [Safe tool execution](/agentic-ai/tools/safe-execution/) |
| 128 | How do you prevent an LLM from calling unauthorized tools? | [Safe tool execution](/agentic-ai/tools/safe-execution/) |
| 129 | How do you stop a tool result from injecting malicious instructions? | [Safe tool execution](/agentic-ai/tools/safe-execution/) |
| 130 | Can tool output be trusted? | [Safe tool execution](/agentic-ai/tools/safe-execution/) |
| 131 | Why must tool responses be considered untrusted input? | [Safe tool execution](/agentic-ai/tools/safe-execution/) |
| 132 | What is tool-result sanitization? | [Safe tool execution](/agentic-ai/tools/safe-execution/) |
| 133 | How would you design a database query tool safely? | [Safe tool execution](/agentic-ai/tools/safe-execution/) |
| 134 | Would you allow an agent to execute arbitrary SQL? | [Safe tool execution](/agentic-ai/tools/safe-execution/) |
| 135 | How do you prevent destructive database operations? | [Safe tool execution](/agentic-ai/tools/safe-execution/) |
| 136 | How would you implement a filesystem tool safely? | [Safe tool execution](/agentic-ai/tools/safe-execution/) |
| 137 | How do you sandbox code execution? | [Safe tool execution](/agentic-ai/tools/safe-execution/) |
| 138 | How would you give an agent access to Kubernetes? | [Safe tool execution](/agentic-ai/tools/safe-execution/) |
| 139 | Should an AI agent receive cluster-admin access? | [Safe tool execution](/agentic-ai/tools/safe-execution/) |
| 140 | How do you audit every tool call? | [Safe tool execution](/agentic-ai/tools/safe-execution/) |

## Model Context Protocol

| # | Source question | Primary reading |
|---:|---|---|
| 141 | What is MCP? | [MCP mental model](/agentic-ai/mcp/) |
| 142 | Why was MCP created? | [MCP mental model](/agentic-ai/mcp/) |
| 143 | What problem does MCP solve? | [MCP mental model](/agentic-ai/mcp/) |
| 144 | What are the major components of MCP? | [MCP mental model](/agentic-ai/mcp/) |
| 145 | What is an MCP host? | [MCP mental model](/agentic-ai/mcp/) |
| 146 | What is an MCP client? | [MCP mental model](/agentic-ai/mcp/) |
| 147 | What is an MCP server? | [MCP mental model](/agentic-ai/mcp/) |
| 148 | How does an MCP client communicate with an MCP server? | [MCP mental model](/agentic-ai/mcp/) |
| 149 | What capabilities can an MCP server expose? | [MCP mental model](/agentic-ai/mcp/) |
| 150 | What are MCP tools? | [MCP mental model](/agentic-ai/mcp/) |
| 151 | What are MCP resources? | [MCP mental model](/agentic-ai/mcp/) |
| 152 | What are MCP prompts? | [MCP mental model](/agentic-ai/mcp/) |
| 153 | Tools vs resources vs prompts in MCP? | [MCP mental model](/agentic-ai/mcp/) |
| 154 | What is MCP capability negotiation? | [MCP mental model](/agentic-ai/mcp/) |
| 155 | How does an MCP client discover available tools? | [MCP mental model](/agentic-ai/mcp/) |
| 156 | How are tool input schemas defined? | [MCP mental model](/agentic-ai/mcp/) |
| 157 | How does MCP tool invocation work? | [MCP mental model](/agentic-ai/mcp/) |
| 158 | What happens after a tool result is returned? | [MCP mental model](/agentic-ai/mcp/) |
| 159 | Does MCP itself decide which tool to call? | [MCP mental model](/agentic-ai/mcp/) |
| 160 | Where does LLM reasoning occur in an MCP architecture? | [MCP mental model](/agentic-ai/mcp/) |
| 161 | MCP vs ordinary REST API? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 162 | MCP vs OpenAPI? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 163 | MCP vs function calling? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 164 | MCP vs LangChain tools? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 165 | MCP vs plugin architecture? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 166 | Can an MCP server call another MCP server? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 167 | Can one agent connect to multiple MCP servers? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 168 | Can multiple agents use the same MCP server? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 169 | What is an MCP gateway? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 170 | Why would an enterprise use an MCP gateway? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 171 | How would you build an MCP server around an existing REST API? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 172 | How would you wrap a database as an MCP server? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 173 | How would you expose GitHub/Jira/Confluence through MCP? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 174 | How would you expose internal documentation through MCP? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 175 | MCP local server vs remote server? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 176 | How do MCP servers authenticate users? | [MCP security and operations](/agentic-ai/mcp/security-and-operations/) |
| 177 | How do you authorize MCP tool calls? | [MCP security and operations](/agentic-ai/mcp/security-and-operations/) |
| 178 | How do OAuth and MCP work together? | [MCP security and operations](/agentic-ai/mcp/security-and-operations/) |
| 179 | How do you handle user identity propagation through MCP? | [MCP security and operations](/agentic-ai/mcp/security-and-operations/) |
| 180 | How do you manage secrets in MCP servers? | [MCP security and operations](/agentic-ai/mcp/security-and-operations/) |
| 181 | How do you enforce RBAC for MCP tools? | [MCP security and operations](/agentic-ai/mcp/security-and-operations/) |
| 182 | How do you prevent unauthorized tool discovery? | [MCP security and operations](/agentic-ai/mcp/security-and-operations/) |
| 183 | How do you prevent prompt injection through MCP resources? | [MCP security and operations](/agentic-ai/mcp/security-and-operations/) |
| 184 | How do you protect against a malicious MCP server? | [MCP security and operations](/agentic-ai/mcp/security-and-operations/) |
| 185 | Should MCP server output be trusted? | [MCP security and operations](/agentic-ai/mcp/security-and-operations/) |
| 186 | How do you version MCP tools? | [MCP security and operations](/agentic-ai/mcp/security-and-operations/) |
| 187 | How do you handle schema evolution? | [MCP security and operations](/agentic-ai/mcp/security-and-operations/) |
| 188 | How do you test an MCP server? | [MCP security and operations](/agentic-ai/mcp/security-and-operations/) |
| 189 | How do you monitor MCP calls? | [MCP security and operations](/agentic-ai/mcp/security-and-operations/) |
| 190 | How do you trace agent → MCP → API calls? | [MCP security and operations](/agentic-ai/mcp/security-and-operations/) |
| 191 | How do you handle MCP server downtime? | [MCP security and operations](/agentic-ai/mcp/security-and-operations/) |
| 192 | How do you rate-limit MCP calls? | [MCP security and operations](/agentic-ai/mcp/security-and-operations/) |
| 193 | How do you cache MCP resources? | [MCP security and operations](/agentic-ai/mcp/security-and-operations/) |
| 194 | How do you implement MCP in a microservices architecture? | [MCP security and operations](/agentic-ai/mcp/security-and-operations/) |
| 195 | What information should remain outside MCP? | [MCP security and operations](/agentic-ai/mcp/security-and-operations/) |

## MCP scenarios

| # | Source question | Primary reading |
|---:|---|---|
| 196 | Design an MCP server for Jira. | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 197 | Design an MCP server for Kubernetes. | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 198 | Design an MCP server for internal documentation. | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 199 | Design an MCP server that accesses customer records. | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 200 | Design an MCP server exposing 50 internal microservices. | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 201 | Would you expose each microservice as an MCP server? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 202 | One large MCP server vs multiple domain MCP servers? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 203 | How would service discovery work for MCP? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 204 | How would you secure an MCP server running inside Kubernetes? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 205 | How would you expose a legacy SOAP API through MCP? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 206 | How would you expose Kafka functionality through MCP? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 207 | Should an agent be allowed to publish Kafka events directly? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 208 | How do you support tenant isolation in MCP? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 209 | How would you prevent one tenant from accessing another tenant's data? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 210 | How would you implement audit logging? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 211 | How would you handle MCP server version upgrades without breaking agents? | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |

## Multi-agent systems

| # | Source question | Primary reading |
|---:|---|---|
| 212 | What is a multi-agent system? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 213 | Why use multiple agents instead of one? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 214 | When should you avoid multi-agent architecture? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 215 | What is agent specialization? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 216 | What is an orchestrator agent? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 217 | What is a supervisor agent? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 218 | What is a worker agent? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 219 | What is agent delegation? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 220 | What is agent handoff? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 221 | What is agent-to-agent communication? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 222 | How do agents share context? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 223 | Should all agents share the complete conversation? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 224 | How do you minimize context passed between agents? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 225 | How do you prevent context leakage? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 226 | How do you coordinate multiple agents? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 227 | Centralized vs decentralized orchestration? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 228 | Supervisor-worker vs peer-to-peer agents? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 229 | What happens if two agents disagree? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 230 | How do you select which agent should perform a task? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 231 | How do you prevent circular delegation? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 232 | How do you prevent agent deadlocks? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 233 | How do you enforce a maximum delegation depth? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 234 | How do you implement retries for failed subagents? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 235 | How do you aggregate responses from multiple agents? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 236 | How do you resolve conflicting agent outputs? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 237 | Can agents call the same tools? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 238 | Should every agent have access to every tool? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 239 | How do you implement least privilege for agents? | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 240 | How would you monitor a multi-agent workflow? | [Multi-agent systems](/agentic-ai/multi-agent/) |

## Subagents

| # | Source question | Primary reading |
|---:|---|---|
| 241 | What is a subagent? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 242 | Agent vs subagent? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 243 | Why use subagents? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 244 | How does a parent agent delegate work? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 245 | What information should be passed to a subagent? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 246 | Should a subagent inherit the parent's full context? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 247 | What is context isolation? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 248 | Why is context isolation important? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 249 | Should subagents have independent system prompts? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 250 | Can a subagent create another subagent? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 251 | How deep should subagent nesting go? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 252 | How do you prevent uncontrolled recursive delegation? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 253 | How does the parent agent determine that a subagent has completed its task? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 254 | How do you structure a subagent response? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 255 | How do you pass structured results back to the parent? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 256 | What happens if a subagent fails? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 257 | Can subagents work in parallel? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 258 | How do you execute multiple subagents concurrently? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 259 | How do you aggregate parallel subagent results? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 260 | When would sequential subagents be preferable? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 261 | How do you manage token usage across subagents? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 262 | What are the disadvantages of subagents? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 263 | How do subagents improve context management? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 264 | How do subagents improve specialization? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 265 | How would you implement a research subagent? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 266 | How would you implement a coding subagent? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 267 | How would you implement a database subagent? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 268 | How would you restrict tools available to a subagent? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 269 | What happens when a subagent produces hallucinated results? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 270 | How does the parent validate a subagent's output? | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |

## Multi-agent architecture scenarios

| # | Source question | Primary reading |
|---:|---|---|
| 271 | Design an AI software-development agent. | [Agentic system walkthroughs](/agentic-ai/walkthroughs/) |
| 272 | Design it using: | [Agentic system walkthroughs](/agentic-ai/walkthroughs/) |
| 273 | How would the planner break down requirements? | [Agentic system walkthroughs](/agentic-ai/walkthroughs/) |
| 274 | How would the coding agent modify source code? | [Agentic system walkthroughs](/agentic-ai/walkthroughs/) |
| 275 | How would the testing agent execute tests safely? | [Agentic system walkthroughs](/agentic-ai/walkthroughs/) |
| 276 | How would the reviewer verify changes? | [Agentic system walkthroughs](/agentic-ai/walkthroughs/) |
| 277 | Who gets permission to merge code? | [Agentic system walkthroughs](/agentic-ai/walkthroughs/) |
| 278 | How do you prevent an AI from pushing broken code? | [Agentic system walkthroughs](/agentic-ai/walkthroughs/) |
| 279 | How do you isolate agent workspaces? | [Agentic system walkthroughs](/agentic-ai/walkthroughs/) |
| 280 | How do you support parallel development agents? | [Agentic system walkthroughs](/agentic-ai/walkthroughs/) |
| 281 | Design a customer-support multi-agent system. | [Agentic system walkthroughs](/agentic-ai/walkthroughs/) |
| 282 | Router Agent → Billing Agent → Technical Agent → Escalation Agent. | [Agentic system walkthroughs](/agentic-ai/walkthroughs/) |
| 283 | How would routing work? | [Agentic system walkthroughs](/agentic-ai/walkthroughs/) |
| 284 | How would you handle ambiguous queries? | [Agentic system walkthroughs](/agentic-ai/walkthroughs/) |
| 285 | When should the agent escalate to a human? | [Agentic system walkthroughs](/agentic-ai/walkthroughs/) |
| 286 | How do you keep customer data isolated? | [Agentic system walkthroughs](/agentic-ai/walkthroughs/) |
| 287 | Design an SRE agent. | [Agentic system walkthroughs](/agentic-ai/walkthroughs/) |
| 288 | It detects an alert and investigates logs. | [Agentic system walkthroughs](/agentic-ai/walkthroughs/) |
| 289 | How would you prevent it from deleting infrastructure? | [Agentic system walkthroughs](/agentic-ai/walkthroughs/) |
| 290 | How would you allow safe remediation? | [Agentic system walkthroughs](/agentic-ai/walkthroughs/) |
| 291 | How do you integrate Grafana, Kubernetes, Splunk and GitHub? | [Agentic system walkthroughs](/agentic-ai/walkthroughs/) |
| 292 | Where would MCP fit? | [Agentic system walkthroughs](/agentic-ai/walkthroughs/) |

## Context engineering

| # | Source question | Primary reading |
|---:|---|---|
| 293 | What is context engineering? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 294 | Context engineering vs prompt engineering? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 295 | What information should be provided to an agent? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 296 | Why is more context not always better? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 297 | What is context pollution? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 298 | What is context compression? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 299 | What is conversation summarization? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 300 | How do you decide what history to retain? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 301 | What is context retrieval? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 302 | How do you dynamically inject relevant context? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 303 | How would you implement a context manager? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 304 | How do subagents help reduce context size? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 305 | What should be in the system prompt? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 306 | What should not be in the system prompt? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 307 | How do you protect a system prompt? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 308 | Can you fully prevent a user from discovering system instructions? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 309 | What information should be fetched just-in-time rather than stored in the prompt? | [Context engineering and memory](/agentic-ai/context-and-memory/) |

## Agent memory

| # | Source question | Primary reading |
|---:|---|---|
| 310 | What is memory in an AI system? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 311 | What is conversational memory? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 312 | What is semantic memory? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 313 | What is episodic memory? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 314 | What is procedural memory? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 315 | Vector memory vs relational memory? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 316 | How do you decide what information should become long-term memory? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 317 | How do you expire memory? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 318 | How do you update incorrect memory? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 319 | How do you prevent duplicate memories? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 320 | How do you retrieve relevant memories? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 321 | How do you rank memories? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 322 | How do you implement user-specific memory? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 323 | How do you implement organization-level memory? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 324 | How do you enforce tenant isolation? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 325 | How do you handle GDPR/"forget me" requirements? | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 326 | Why is automatically storing everything dangerous? | [Context engineering and memory](/agentic-ai/context-and-memory/) |

## RAG for agents

| # | Source question | Primary reading |
|---:|---|---|
| 327 | Why do agents need RAG? | [Agentic RAG](/agentic-ai/rag/agentic-rag/) |
| 328 | What is Agentic RAG? | [Agentic RAG](/agentic-ai/rag/agentic-rag/) |
| 329 | Normal RAG vs Agentic RAG? | [Agentic RAG](/agentic-ai/rag/agentic-rag/) |
| 330 | What is iterative retrieval? | [Agentic RAG](/agentic-ai/rag/agentic-rag/) |
| 331 | What is adaptive retrieval? | [Agentic RAG](/agentic-ai/rag/agentic-rag/) |
| 332 | What is multi-hop retrieval? | [Agentic RAG](/agentic-ai/rag/agentic-rag/) |
| 333 | What is query decomposition? | [Agentic RAG](/agentic-ai/rag/agentic-rag/) |
| 334 | What is self-query retrieval? | [Agentic RAG](/agentic-ai/rag/agentic-rag/) |
| 335 | What is corrective RAG? | [Agentic RAG](/agentic-ai/rag/agentic-rag/) |
| 336 | What happens if retrieval returns no relevant documents? | [Agentic RAG](/agentic-ai/rag/agentic-rag/) |
| 337 | How does an agent determine whether another retrieval is necessary? | [Agentic RAG](/agentic-ai/rag/agentic-rag/) |
| 338 | How can you evaluate RAG quality? | [Evaluate and secure RAG](/agentic-ai/rag/evaluation-and-security/) |
| 339 | Precision vs recall in retrieval? | [Evaluate and secure RAG](/agentic-ai/rag/evaluation-and-security/) |
| 340 | How do you evaluate document relevance? | [Evaluate and secure RAG](/agentic-ai/rag/evaluation-and-security/) |
| 341 | How do metadata filters improve RAG? | [Evaluate and secure RAG](/agentic-ai/rag/evaluation-and-security/) |
| 342 | How do you secure retrieved documents? | [Evaluate and secure RAG](/agentic-ai/rag/evaluation-and-security/) |

## Security

| # | Source question | Primary reading |
|---:|---|---|
| 343 | What is prompt injection? | [Prompt injection](/agentic-ai/security/prompt-injection/) |
| 344 | Direct vs indirect prompt injection? | [Prompt injection](/agentic-ai/security/prompt-injection/) |
| 345 | Give an example of indirect prompt injection. | [Prompt injection](/agentic-ai/security/prompt-injection/) |
| 346 | How can a webpage attack an AI agent? | [Prompt injection](/agentic-ai/security/prompt-injection/) |
| 347 | How could an email attack an AI agent? | [Prompt injection](/agentic-ai/security/prompt-injection/) |
| 348 | How could an MCP resource inject malicious instructions? | [Prompt injection](/agentic-ai/security/prompt-injection/) |
| 349 | How do you defend against prompt injection? | [Prompt injection](/agentic-ai/security/prompt-injection/) |
| 350 | Can prompt injection be completely eliminated? | [Prompt injection](/agentic-ai/security/prompt-injection/) |
| 351 | What is tool poisoning? | [Prompt injection](/agentic-ai/security/prompt-injection/) |
| 352 | What is MCP server poisoning? | [Prompt injection](/agentic-ai/security/prompt-injection/) |
| 353 | What is context poisoning? | [Prompt injection](/agentic-ai/security/prompt-injection/) |
| 354 | What is memory poisoning? | [Prompt injection](/agentic-ai/security/prompt-injection/) |
| 355 | What is retrieval poisoning? | [Prompt injection](/agentic-ai/security/prompt-injection/) |
| 356 | How do you distinguish data from instructions? | [Prompt injection](/agentic-ai/security/prompt-injection/) |
| 357 | Why should external content never automatically override system policy? | [Prompt injection](/agentic-ai/security/prompt-injection/) |
| 358 | What is least privilege for AI agents? | [Identity and sandboxing](/agentic-ai/security/identity-and-sandboxing/) |
| 359 | How do you implement scoped credentials? | [Identity and sandboxing](/agentic-ai/security/identity-and-sandboxing/) |
| 360 | Why shouldn't API keys be placed inside prompts? | [Identity and sandboxing](/agentic-ai/security/identity-and-sandboxing/) |
| 361 | How should credentials be stored? | [Identity and sandboxing](/agentic-ai/security/identity-and-sandboxing/) |
| 362 | How should agents access secrets? | [Identity and sandboxing](/agentic-ai/security/identity-and-sandboxing/) |
| 363 | What is credential delegation? | [Identity and sandboxing](/agentic-ai/security/identity-and-sandboxing/) |
| 364 | What is identity propagation? | [Identity and sandboxing](/agentic-ai/security/identity-and-sandboxing/) |
| 365 | How do you authorize actions for individual users? | [Identity and sandboxing](/agentic-ai/security/identity-and-sandboxing/) |
| 366 | How do you audit agent actions? | [Identity and sandboxing](/agentic-ai/security/identity-and-sandboxing/) |
| 367 | What are high-risk tools? | [Identity and sandboxing](/agentic-ai/security/identity-and-sandboxing/) |
| 368 | What actions should require user confirmation? | [Identity and sandboxing](/agentic-ai/security/identity-and-sandboxing/) |
| 369 | How do you prevent data exfiltration? | [Identity and sandboxing](/agentic-ai/security/identity-and-sandboxing/) |
| 370 | How do you prevent cross-tenant leakage? | [Identity and sandboxing](/agentic-ai/security/identity-and-sandboxing/) |
| 371 | How do you sandbox an agent? | [Identity and sandboxing](/agentic-ai/security/identity-and-sandboxing/) |
| 372 | What is code execution sandboxing? | [Identity and sandboxing](/agentic-ai/security/identity-and-sandboxing/) |
| 373 | What network restrictions would you apply to an agent? | [Identity and sandboxing](/agentic-ai/security/identity-and-sandboxing/) |
| 374 | How do you protect against SSRF through agent tools? | [Identity and sandboxing](/agentic-ai/security/identity-and-sandboxing/) |
| 375 | How do you prevent command injection? | [Identity and sandboxing](/agentic-ai/security/identity-and-sandboxing/) |
| 376 | How do you prevent SQL injection from AI-generated SQL? | [Identity and sandboxing](/agentic-ai/security/identity-and-sandboxing/) |

## Reliability and production engineering

| # | Source question | Primary reading |
|---:|---|---|
| 377 | What happens when the LLM provider is unavailable? | [Agent reliability](/agentic-ai/production/reliability/) |
| 378 | How would you implement fallback models? | [Agent reliability](/agentic-ai/production/reliability/) |
| 379 | What happens when a tool is unavailable? | [Agent reliability](/agentic-ai/production/reliability/) |
| 380 | What happens when a subagent crashes? | [Agent reliability](/agentic-ai/production/reliability/) |
| 381 | How do you retry agent operations? | [Agent reliability](/agentic-ai/production/reliability/) |
| 382 | Which operations must not automatically retry? | [Agent reliability](/agentic-ai/production/reliability/) |
| 383 | How do you design idempotent agent operations? | [Agent reliability](/agentic-ai/production/reliability/) |
| 384 | How do you handle duplicate tool execution? | [Agent reliability](/agentic-ai/production/reliability/) |
| 385 | How do you prevent duplicate emails/payments/tickets? | [Agent reliability](/agentic-ai/production/reliability/) |
| 386 | How do you manage transaction boundaries? | [Agent reliability](/agentic-ai/production/reliability/) |
| 387 | Can an AI agent guarantee exactly-once execution? | [Agent reliability](/agentic-ai/production/reliability/) |
| 388 | How do you make agent execution eventually consistent? | [Agent reliability](/agentic-ai/production/reliability/) |
| 389 | How do you checkpoint an agent graph? | [Agent reliability](/agentic-ai/production/reliability/) |
| 390 | How do you recover from a partially completed workflow? | [Agent reliability](/agentic-ai/production/reliability/) |
| 391 | What is a dead-letter queue for agent jobs? | [Agent reliability](/agentic-ai/production/reliability/) |
| 392 | How do you implement circuit breaking? | [Agent reliability](/agentic-ai/production/reliability/) |
| 393 | How do you implement rate limiting? | [Agent reliability](/agentic-ai/production/reliability/) |
| 394 | How do you handle model rate limits? | [Agent reliability](/agentic-ai/production/reliability/) |
| 395 | How do you control concurrency? | [Agent reliability](/agentic-ai/production/reliability/) |
| 396 | How do you manage backpressure? | [Agent reliability](/agentic-ai/production/reliability/) |
| 397 | How do you implement request cancellation? | [Agent reliability](/agentic-ai/production/reliability/) |

## Observability

| # | Source question | Primary reading |
|---:|---|---|
| 398 | How do you monitor AI agents? | [Agent observability](/agentic-ai/production/observability/) |
| 399 | What metrics should you monitor? | [Agent observability](/agentic-ai/production/observability/) |
| 400 | What would you log? | [Agent observability](/agentic-ai/production/observability/) |
| 401 | Should you log prompts? | [Agent observability](/agentic-ai/production/observability/) |
| 402 | What security issues arise from logging prompts? | [Agent observability](/agentic-ai/production/observability/) |
| 403 | What is agent tracing? | [Agent observability](/agentic-ai/production/observability/) |
| 404 | What is a trace span in an agent execution? | [Agent observability](/agentic-ai/production/observability/) |
| 405 | How would you trace: | [Agent observability](/agentic-ai/production/observability/) |
| 406 | What is tool-call latency? | [Agent observability](/agentic-ai/production/observability/) |
| 407 | How do you measure token consumption? | [Agent observability](/agentic-ai/production/observability/) |
| 408 | How do you measure cost per agent task? | [Agent observability](/agentic-ai/production/observability/) |
| 409 | How do you find which tool caused a failure? | [Agent observability](/agentic-ai/production/observability/) |
| 410 | How do you debug non-deterministic behavior? | [Agent observability](/agentic-ai/production/observability/) |
| 411 | How do you replay an agent execution? | [Agent observability](/agentic-ai/production/observability/) |
| 412 | How do you correlate agent traces with application logs? | [Agent observability](/agentic-ai/production/observability/) |
| 413 | What would an agent observability dashboard contain? | [Agent observability](/agentic-ai/production/observability/) |

## Evaluation

| # | Source question | Primary reading |
|---:|---|---|
| 414 | How do you evaluate an AI agent? | [Agent evaluation](/agentic-ai/production/evaluation/) |
| 415 | How is agent evaluation different from LLM evaluation? | [Agent evaluation](/agentic-ai/production/evaluation/) |
| 416 | What is task completion rate? | [Agent evaluation](/agentic-ai/production/evaluation/) |
| 417 | What is tool selection accuracy? | [Agent evaluation](/agentic-ai/production/evaluation/) |
| 418 | What is tool argument accuracy? | [Agent evaluation](/agentic-ai/production/evaluation/) |
| 419 | What is trajectory evaluation? | [Agent evaluation](/agentic-ai/production/evaluation/) |
| 420 | What is an agent trajectory? | [Agent evaluation](/agentic-ai/production/evaluation/) |
| 421 | How do you evaluate reasoning without relying solely on final output? | [Agent evaluation](/agentic-ai/production/evaluation/) |
| 422 | What is an LLM-as-a-judge? | [Agent evaluation](/agentic-ai/production/evaluation/) |
| 423 | What are problems with LLM-as-a-judge? | [Agent evaluation](/agentic-ai/production/evaluation/) |
| 424 | What are golden datasets? | [Agent evaluation](/agentic-ai/production/evaluation/) |
| 425 | How do you create an evaluation dataset? | [Agent evaluation](/agentic-ai/production/evaluation/) |
| 426 | How do you regression-test prompts? | [Agent evaluation](/agentic-ai/production/evaluation/) |
| 427 | How do you test MCP tools? | [Agent evaluation](/agentic-ai/production/evaluation/) |
| 428 | How do you evaluate multi-agent workflows? | [Agent evaluation](/agentic-ai/production/evaluation/) |
| 429 | How do you evaluate RAG? | [Agent evaluation](/agentic-ai/production/evaluation/) |
| 430 | How do you measure hallucination? | [Agent evaluation](/agentic-ai/production/evaluation/) |
| 431 | How do you test prompt-injection resistance? | [Agent evaluation](/agentic-ai/production/evaluation/) |
| 432 | How do you evaluate tool-call safety? | [Agent evaluation](/agentic-ai/production/evaluation/) |
| 433 | How would you test an agent before production? | [Agent evaluation](/agentic-ai/production/evaluation/) |
| 434 | Offline evaluation vs online evaluation? | [Agent evaluation](/agentic-ai/production/evaluation/) |
| 435 | What is A/B testing for agents? | [Agent evaluation](/agentic-ai/production/evaluation/) |

## Performance and cost

| # | Source question | Primary reading |
|---:|---|---|
| 436 | Why can agents become expensive? | [Agent performance and cost](/agentic-ai/production/performance-and-cost/) |
| 437 | What contributes to agent cost? | [Agent performance and cost](/agentic-ai/production/performance-and-cost/) |
| 438 | How do you reduce LLM token usage? | [Agent performance and cost](/agentic-ai/production/performance-and-cost/) |
| 439 | How do you reduce context size? | [Agent performance and cost](/agentic-ai/production/performance-and-cost/) |
| 440 | When should you use a smaller model? | [Agent performance and cost](/agentic-ai/production/performance-and-cost/) |
| 441 | Can different subagents use different models? | [Agent performance and cost](/agentic-ai/production/performance-and-cost/) |
| 442 | How would you choose models per task? | [Agent performance and cost](/agentic-ai/production/performance-and-cost/) |
| 443 | How do you cache LLM responses? | [Agent performance and cost](/agentic-ai/production/performance-and-cost/) |
| 444 | What is semantic caching? | [Agent performance and cost](/agentic-ai/production/performance-and-cost/) |
| 445 | What should never be cached? | [Agent performance and cost](/agentic-ai/production/performance-and-cost/) |
| 446 | How do you cache tool results? | [Agent performance and cost](/agentic-ai/production/performance-and-cost/) |
| 447 | How do you parallelize independent tool calls? | [Agent performance and cost](/agentic-ai/production/performance-and-cost/) |
| 448 | Parallel tool calls vs sequential calls? | [Agent performance and cost](/agentic-ai/production/performance-and-cost/) |
| 449 | How do you reduce agent latency? | [Agent performance and cost](/agentic-ai/production/performance-and-cost/) |
| 450 | How do you set token and cost budgets per request? | [Agent performance and cost](/agentic-ai/production/performance-and-cost/) |
| 451 | What happens when the budget is exhausted? | [Agent performance and cost](/agentic-ai/production/performance-and-cost/) |

## Frameworks

| # | Source question | Primary reading |
|---:|---|---|
| 452 | What is LangChain? | [Choose an agent framework](/agentic-ai/frameworks/) |
| 453 | What are chains? | [Choose an agent framework](/agentic-ai/frameworks/) |
| 454 | What are tools? | [Choose an agent framework](/agentic-ai/frameworks/) |
| 455 | What are retrievers? | [Choose an agent framework](/agentic-ai/frameworks/) |
| 456 | What is an agent executor? | [Choose an agent framework](/agentic-ai/frameworks/) |
| 457 | What are callbacks? | [Choose an agent framework](/agentic-ai/frameworks/) |
| 458 | How is state maintained? | [Choose an agent framework](/agentic-ai/frameworks/) |
| 459 | What is LangGraph? | [Choose an agent framework](/agentic-ai/frameworks/) |
| 460 | Why use LangGraph rather than a simple LangChain agent? | [Choose an agent framework](/agentic-ai/frameworks/) |
| 461 | What is a graph node? | [Choose an agent framework](/agentic-ai/frameworks/) |
| 462 | What is an edge? | [Choose an agent framework](/agentic-ai/frameworks/) |
| 463 | What are conditional edges? | [Choose an agent framework](/agentic-ai/frameworks/) |
| 464 | What is graph state? | [Choose an agent framework](/agentic-ai/frameworks/) |
| 465 | What is checkpointing? | [Choose an agent framework](/agentic-ai/frameworks/) |
| 466 | How do you implement Human-in-the-Loop? | [Choose an agent framework](/agentic-ai/frameworks/) |
| 467 | How do you model retries? | [Choose an agent framework](/agentic-ai/frameworks/) |
| 468 | How do you implement parallel branches? | [Choose an agent framework](/agentic-ai/frameworks/) |
| 469 | Why are graph-based agents easier to control? | [Choose an agent framework](/agentic-ai/frameworks/) |
| 470 | What is an agent crew? | [Choose an agent framework](/agentic-ai/frameworks/) |
| 471 | What is role-based agent architecture? | [Choose an agent framework](/agentic-ai/frameworks/) |
| 472 | What is agent conversation? | [Choose an agent framework](/agentic-ai/frameworks/) |
| 473 | How do CrewAI/AutoGen-style approaches differ from graph orchestration? | [Choose an agent framework](/agentic-ai/frameworks/) |
| 474 | When would you avoid these abstractions and build your own orchestration? | [Choose an agent framework](/agentic-ai/frameworks/) |

## Coding exercises

| # | Source question | Primary reading |
|---:|---|---|
| 475 | Write a basic tool-calling agent. | [Build a bounded tool agent](/agentic-ai/tutorials/tool-agent/) |
| 476 | Create an LLM tool for: | [Build a bounded tool agent](/agentic-ai/tutorials/tool-agent/) |
| 477 | Validate tool arguments. | [Build a bounded tool agent](/agentic-ai/tutorials/tool-agent/) |
| 478 | Implement max 5 agent iterations. | [Build a bounded tool agent](/agentic-ai/tutorials/tool-agent/) |
| 479 | Implement agent timeout. | [Build a bounded tool agent](/agentic-ai/tutorials/tool-agent/) |
| 480 | Implement retries with exponential backoff. | [Build a bounded tool agent](/agentic-ai/tutorials/tool-agent/) |
| 481 | Implement an idempotency key for tool execution. | [Build a bounded tool agent](/agentic-ai/tutorials/tool-agent/) |
| 482 | Implement parallel tool calls. | [Build a bounded tool agent](/agentic-ai/tutorials/tool-agent/) |
| 483 | Build a parent-agent/subagent architecture. | [Build a subagent workflow](/agentic-ai/tutorials/subagents/) |
| 484 | Create a planner agent. | [Build a subagent workflow](/agentic-ai/tutorials/subagents/) |
| 485 | Create a researcher subagent. | [Build a subagent workflow](/agentic-ai/tutorials/subagents/) |
| 486 | Aggregate responses from 3 subagents. | [Build a subagent workflow](/agentic-ai/tutorials/subagents/) |
| 487 | Implement conversation memory. | [Context engineering and memory](/agentic-ai/context-and-memory/) |
| 488 | Implement vector search. | [Embeddings and semantic search](/agentic-ai/foundations/embeddings/) |
| 489 | Implement a simple RAG pipeline. | [Build a small RAG system](/agentic-ai/tutorials/rag/) |
| 490 | Implement chunking. | [Build a small RAG system](/agentic-ai/tutorials/rag/) |
| 491 | Implement cosine similarity. | [Build a small RAG system](/agentic-ai/tutorials/rag/) |
| 492 | Write an MCP server exposing a tool. | [Build an MCP server](/agentic-ai/tutorials/mcp-server/) |
| 493 | Create an MCP tool that queries a database. | [Build an MCP server](/agentic-ai/tutorials/mcp-server/) |
| 494 | Validate MCP tool input. | [Build an MCP server](/agentic-ai/tutorials/mcp-server/) |
| 495 | Add authentication to an MCP server. | [MCP security and operations](/agentic-ai/mcp/security-and-operations/) |
| 496 | Add logging/auditing around MCP calls. | [MCP security and operations](/agentic-ai/mcp/security-and-operations/) |
| 497 | Implement a tool approval flow. | [Build a bounded tool agent](/agentic-ai/tutorials/tool-agent/) |

## System design

| # | Source question | Primary reading |
|---:|---|---|
| 498 | Design an internal enterprise assistant that can access: | [Enterprise assistant](/agentic-ai/walkthroughs/enterprise-assistant/) |
| 499 | Where would you use MCP? | [Enterprise assistant](/agentic-ai/walkthroughs/enterprise-assistant/) |
| 500 | How would authentication work? | [Enterprise assistant](/agentic-ai/walkthroughs/enterprise-assistant/) |
| 501 | How would permissions flow from the user? | [Enterprise assistant](/agentic-ai/walkthroughs/enterprise-assistant/) |
| 502 | How would you prevent unauthorized data access? | [Enterprise assistant](/agentic-ai/walkthroughs/enterprise-assistant/) |
| 503 | Where would RAG be used? | [Enterprise assistant](/agentic-ai/walkthroughs/enterprise-assistant/) |
| 504 | How would you implement memory? | [Enterprise assistant](/agentic-ai/walkthroughs/enterprise-assistant/) |
| 505 | How would you audit every action? | [Enterprise assistant](/agentic-ai/walkthroughs/enterprise-assistant/) |
| 506 | How would you give an agent repository access? | [Coding agent](/agentic-ai/walkthroughs/coding-agent/) |
| 507 | How would it understand a large repository? | [Coding agent](/agentic-ai/walkthroughs/coding-agent/) |
| 508 | How would you let it edit files? | [Coding agent](/agentic-ai/walkthroughs/coding-agent/) |
| 509 | How would it run tests? | [Coding agent](/agentic-ai/walkthroughs/coding-agent/) |
| 510 | How would you sandbox commands? | [Coding agent](/agentic-ai/walkthroughs/coding-agent/) |
| 511 | How would you create a PR automatically? | [Coding agent](/agentic-ai/walkthroughs/coding-agent/) |
| 512 | What actions should require confirmation? | [Coding agent](/agentic-ai/walkthroughs/coding-agent/) |
| 513 | Agent receives a production alert. | [DevOps investigation agent](/agentic-ai/walkthroughs/devops-agent/) |
| 514 | It checks logs. | [DevOps investigation agent](/agentic-ai/walkthroughs/devops-agent/) |
| 515 | Checks Kubernetes. | [DevOps investigation agent](/agentic-ai/walkthroughs/devops-agent/) |
| 516 | Checks metrics. | [DevOps investigation agent](/agentic-ai/walkthroughs/devops-agent/) |
| 517 | Finds the probable root cause. | [DevOps investigation agent](/agentic-ai/walkthroughs/devops-agent/) |
| 518 | Suggests remediation. | [DevOps investigation agent](/agentic-ai/walkthroughs/devops-agent/) |
| 519 | Optionally performs remediation. | [DevOps investigation agent](/agentic-ai/walkthroughs/devops-agent/) |

## Failure scenarios

| # | Source question | Primary reading |
|---:|---|---|
| 520 | The agent repeatedly calls the same tool. What do you do? | [The agent loop](/agentic-ai/agents/agent-loop/) |
| 521 | Your agent enters an infinite loop. How do you debug it? | [The agent loop](/agentic-ai/agents/agent-loop/) |
| 522 | The correct tool exists but the model never chooses it. | [Tools and function calls](/agentic-ai/tools/) |
| 523 | Two tools have almost identical functionality. | [Tools and function calls](/agentic-ai/tools/) |
| 524 | The agent calls a destructive API accidentally. | [Safe tool execution](/agentic-ai/tools/safe-execution/) |
| 525 | A customer email contains `"Ignore all previous instructions"`. | [Prompt injection](/agentic-ai/security/prompt-injection/) |
| 526 | A retrieved webpage instructs the agent to upload secrets. | [Prompt injection](/agentic-ai/security/prompt-injection/) |
| 527 | An MCP server suddenly exposes a new dangerous tool. | [MCP security and operations](/agentic-ai/mcp/security-and-operations/) |
| 528 | The LLM generates valid JSON but semantically incorrect parameters. | [Safe tool execution](/agentic-ai/tools/safe-execution/) |
| 529 | An API call succeeds but the agent thinks it failed and retries. | [Agent reliability](/agentic-ai/production/reliability/) |
| 530 | The agent creates two Jira tickets instead of one. | [Agent reliability](/agentic-ai/production/reliability/) |
| 531 | A subagent times out. | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 532 | Two subagents return contradictory answers. | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 533 | One subagent uses 90% of your token budget. | [Agent performance and cost](/agentic-ai/production/performance-and-cost/) |
| 534 | Your agent works in development but behaves unpredictably in production. | [Agent evaluation](/agentic-ai/production/evaluation/) |
| 535 | Agent latency increases from 4 seconds to 40 seconds. | [Agent performance and cost](/agentic-ai/production/performance-and-cost/) |
| 536 | Model cost increases 5× after introducing multi-agent architecture. | [Agent performance and cost](/agentic-ai/production/performance-and-cost/) |
| 537 | Your RAG system retrieves irrelevant documents. | [Evaluate and secure RAG](/agentic-ai/rag/evaluation-and-security/) |
| 538 | Relevant documents exist but aren't returned. | [Evaluate and secure RAG](/agentic-ai/rag/evaluation-and-security/) |
| 539 | Users discover data belonging to other tenants. | [Identity and sandboxing](/agentic-ai/security/identity-and-sandboxing/) |
| 540 | A tool returns malicious text that manipulates subsequent model behavior. | [Prompt injection](/agentic-ai/security/prompt-injection/) |

## Senior engineering decisions

| # | Source question | Primary reading |
|---:|---|---|
| 541 | **Why do I need an agent instead of writing normal code?** | [Agent architecture decision guide](/agentic-ai/reference/decision-guide/) |
| 542 | **When should you NOT use an AI agent?** | [Agent architecture decision guide](/agentic-ai/reference/decision-guide/) |
| 543 | **What business logic should never be delegated to an LLM?** | [Agent architecture decision guide](/agentic-ai/reference/decision-guide/) |
| 544 | **What is deterministic vs non-deterministic orchestration?** | [Agent architecture decision guide](/agentic-ai/reference/decision-guide/) |
| 545 | **Why are agents fundamentally harder to test than microservices?** | [Agent architecture decision guide](/agentic-ai/reference/decision-guide/) |
| 546 | **How do you make an agent production-ready?** | [Production readiness](/agentic-ai/production/) |
| 547 | **How do you guarantee safety when agents can take real actions?** | [Agent security](/agentic-ai/security/) |
| 548 | **How do you implement least-privilege tool access?** | [Identity and sandboxing](/agentic-ai/security/identity-and-sandboxing/) |
| 549 | **How do you handle failures in a multi-agent system?** | [Multi-agent systems](/agentic-ai/multi-agent/) |
| 550 | **How would you debug an agent making incorrect decisions?** | [Agent observability](/agentic-ai/production/observability/) |
| 551 | **How do you prevent hallucinated actions?** | [Safe tool execution](/agentic-ai/tools/safe-execution/) |
| 552 | **How do you separate reasoning from execution?** | [Safe tool execution](/agentic-ai/tools/safe-execution/) |
| 553 | **How do you make an agent auditable?** | [Agent observability](/agentic-ai/production/observability/) |
| 554 | **How do you make an agent idempotent?** | [Agent reliability](/agentic-ai/production/reliability/) |
| 555 | **How do you keep an agent's costs predictable?** | [Agent performance and cost](/agentic-ai/production/performance-and-cost/) |
| 556 | **How do you secure MCP in an enterprise?** | [MCP security and operations](/agentic-ai/mcp/security-and-operations/) |
| 557 | **Why use MCP instead of custom API integrations?** | [MCP integration patterns](/agentic-ai/mcp/integration-patterns/) |
| 558 | **How does MCP change agent architecture?** | [MCP mental model](/agentic-ai/mcp/) |
| 559 | **Subagents vs tools—when would you use each?** | [Subagents and handoffs](/agentic-ai/multi-agent/subagents/) |
| 560 | **Single agent vs multi-agent—how do you choose?** | [Multi-agent systems](/agentic-ai/multi-agent/) |

## Coverage check

- Questions mapped: 560
- Expected sequence: 1 through 560
- Generated by `scripts/build-agentic-ai-question-map.mjs` from the preserved source list.
