If you’re preparing for **GenAI + Agentic AI + AI Agents + Subagents + MCP**, these are the questions I’d prepare. For a software-engineer interview, focus heavily on **architecture, orchestration, tool calling, reliability, security, evaluation, and production scenarios**, not just LLM theory.

### 1. Generative AI / LLM fundamentals

1. What is Generative AI?
2. What is an LLM and how does it work at a high level?
3. What is a transformer?
4. Explain self-attention.
5. What are tokens and tokenization?
6. What is a context window?
7. What happens when the context window is exceeded?
8. What is temperature?
9. What are top-p and top-k sampling?
10. What is the difference between deterministic and probabilistic generation?
11. What is hallucination?
12. Why do LLMs hallucinate?
13. How can hallucinations be reduced?
14. What is grounding?
15. What is prompt engineering?
16. System prompt vs user prompt vs assistant message?
17. What are few-shot and zero-shot prompting?
18. What is chain-of-thought prompting?
19. What is structured output?
20. How do you make an LLM return valid JSON?
21. What are embeddings?
22. How are embeddings generated?
23. What is cosine similarity?
24. Embedding model vs generative model?
25. What is semantic search?
26. What is a vector database?
27. Vector database vs relational database?
28. What is RAG?
29. Explain a complete RAG pipeline.
30. RAG vs fine-tuning.
31. When would you fine-tune instead of using RAG?
32. What is chunking?
33. What chunk size would you choose?
34. What is chunk overlap?
35. What is hybrid search?
36. What is reranking?
37. What is query rewriting?
38. What is semantic caching?
39. What are prompt injection attacks?
40. What is model jailbreak?

---

# 2. Agentic AI fundamentals

41. What is Agentic AI?
42. How is Agentic AI different from Generative AI?
43. What makes an AI system an "agent"?
44. What are the core components of an AI agent?
45. What is the agent loop?
46. Explain **Observe → Reason → Act → Observe**.
47. What is tool calling?
48. What is function calling?
49. Tool calling vs API calling?
50. What is agent orchestration?
51. What is an autonomous agent?
52. What is a semi-autonomous agent?
53. When should an agent ask for human approval?
54. What is Human-in-the-Loop?
55. What is Human-on-the-Loop?
56. Agent vs chatbot?
57. Agent vs workflow?
58. Agent vs traditional microservice?
59. Agent vs RPA?
60. Agent vs Copilot?
61. What is an agent's environment?
62. What is an agent's state?
63. What is agent memory?
64. Short-term memory vs long-term memory?
65. Episodic memory vs semantic memory?
66. What is working memory?
67. What information should not be stored in agent memory?
68. How do you prevent memory poisoning?
69. What is agent planning?
70. What is task decomposition?
71. What is reflection in an AI agent?
72. What is self-correction?
73. What is ReAct?
74. What does **Reason + Act** mean?
75. What is Plan-and-Execute?
76. ReAct vs Plan-and-Execute?
77. What is Tree of Thoughts?
78. What is graph-based agent orchestration?
79. What is an agent state machine?
80. What makes an agent deterministic vs non-deterministic?

---

# 3. Agent architecture questions

81. Design a production AI agent architecture.
82. What components would your agent platform contain?
83. Where should business logic reside: prompt or application code?
84. What should the LLM decide vs what should deterministic code decide?
85. How do you implement an agent loop?
86. How do you stop an infinite agent loop?
87. How do you limit the number of tool calls?
88. How do you implement agent timeout?
89. How do you implement an agent execution budget?
90. How do you handle token budgets?
91. How would you handle retries?
92. When should tool calls be retried?
93. What is exponential backoff?
94. How do you make agent execution idempotent?
95. How do you checkpoint agent state?
96. How do you resume a failed agent workflow?
97. How do you persist conversation state?
98. Stateless agents vs stateful agents?
99. How would you scale agents horizontally?
100. Where would you store agent state in Kubernetes?
101. Would you keep an agent running continuously?
102. How would you design asynchronous agents?
103. How do queues help in agent systems?
104. Kafka vs RabbitMQ/SQS for agent orchestration?
105. How do you prevent duplicate agent jobs?
106. How do you implement distributed locking?
107. How do you handle long-running agent tasks?
108. How do you handle partial failures?
109. How would you implement Saga-like compensation for agent actions?
110. How do you roll back an agent's actions?

---

# 4. Tool calling

111. What is an AI tool?
112. How does an LLM decide which tool to call?
113. How is a tool schema presented to an LLM?
114. What information should a tool schema contain?
115. Why are good tool descriptions important?
116. What happens if two tools have similar descriptions?
117. How do you improve tool selection accuracy?
118. Should an LLM directly execute a tool?
119. How do you validate tool arguments?
120. What happens if the model generates invalid arguments?
121. How do you handle tool exceptions?
122. How do you handle tool timeouts?
123. How do you handle tool permission failures?
124. How do you restrict dangerous tools?
125. Read-only tool vs write tool?
126. How do you implement approval before executing a write action?
127. What tools should always require confirmation?
128. How do you prevent an LLM from calling unauthorized tools?
129. How do you stop a tool result from injecting malicious instructions?
130. Can tool output be trusted?
131. Why must tool responses be considered untrusted input?
132. What is tool-result sanitization?
133. How would you design a database query tool safely?
134. Would you allow an agent to execute arbitrary SQL?
135. How do you prevent destructive database operations?
136. How would you implement a filesystem tool safely?
137. How do you sandbox code execution?
138. How would you give an agent access to Kubernetes?
139. Should an AI agent receive cluster-admin access?
140. How do you audit every tool call?

---

# 5. MCP — Model Context Protocol

These are increasingly important.

141. What is MCP?
142. Why was MCP created?
143. What problem does MCP solve?
144. What are the major components of MCP?
145. What is an MCP host?
146. What is an MCP client?
147. What is an MCP server?
148. How does an MCP client communicate with an MCP server?
149. What capabilities can an MCP server expose?
150. What are MCP tools?
151. What are MCP resources?
152. What are MCP prompts?
153. Tools vs resources vs prompts in MCP?
154. What is MCP capability negotiation?
155. How does an MCP client discover available tools?
156. How are tool input schemas defined?
157. How does MCP tool invocation work?
158. What happens after a tool result is returned?
159. Does MCP itself decide which tool to call?
160. Where does LLM reasoning occur in an MCP architecture?
161. MCP vs ordinary REST API?
162. MCP vs OpenAPI?
163. MCP vs function calling?
164. MCP vs LangChain tools?
165. MCP vs plugin architecture?
166. Can an MCP server call another MCP server?
167. Can one agent connect to multiple MCP servers?
168. Can multiple agents use the same MCP server?
169. What is an MCP gateway?
170. Why would an enterprise use an MCP gateway?
171. How would you build an MCP server around an existing REST API?
172. How would you wrap a database as an MCP server?
173. How would you expose GitHub/Jira/Confluence through MCP?
174. How would you expose internal documentation through MCP?
175. MCP local server vs remote server?
176. How do MCP servers authenticate users?
177. How do you authorize MCP tool calls?
178. How do OAuth and MCP work together?
179. How do you handle user identity propagation through MCP?
180. How do you manage secrets in MCP servers?
181. How do you enforce RBAC for MCP tools?
182. How do you prevent unauthorized tool discovery?
183. How do you prevent prompt injection through MCP resources?
184. How do you protect against a malicious MCP server?
185. Should MCP server output be trusted?
186. How do you version MCP tools?
187. How do you handle schema evolution?
188. How do you test an MCP server?
189. How do you monitor MCP calls?
190. How do you trace agent → MCP → API calls?
191. How do you handle MCP server downtime?
192. How do you rate-limit MCP calls?
193. How do you cache MCP resources?
194. How do you implement MCP in a microservices architecture?
195. What information should remain outside MCP?

---

# 6. MCP scenario questions

196. Design an MCP server for Jira.
197. Design an MCP server for Kubernetes.
198. Design an MCP server for internal documentation.
199. Design an MCP server that accesses customer records.
200. Design an MCP server exposing 50 internal microservices.
201. Would you expose each microservice as an MCP server?
202. One large MCP server vs multiple domain MCP servers?
203. How would service discovery work for MCP?
204. How would you secure an MCP server running inside Kubernetes?
205. How would you expose a legacy SOAP API through MCP?
206. How would you expose Kafka functionality through MCP?
207. Should an agent be allowed to publish Kafka events directly?
208. How do you support tenant isolation in MCP?
209. How would you prevent one tenant from accessing another tenant's data?
210. How would you implement audit logging?
211. How would you handle MCP server version upgrades without breaking agents?

---

# 7. Multi-agent systems

212. What is a multi-agent system?
213. Why use multiple agents instead of one?
214. When should you avoid multi-agent architecture?
215. What is agent specialization?
216. What is an orchestrator agent?
217. What is a supervisor agent?
218. What is a worker agent?
219. What is agent delegation?
220. What is agent handoff?
221. What is agent-to-agent communication?
222. How do agents share context?
223. Should all agents share the complete conversation?
224. How do you minimize context passed between agents?
225. How do you prevent context leakage?
226. How do you coordinate multiple agents?
227. Centralized vs decentralized orchestration?
228. Supervisor-worker vs peer-to-peer agents?
229. What happens if two agents disagree?
230. How do you select which agent should perform a task?
231. How do you prevent circular delegation?
232. How do you prevent agent deadlocks?
233. How do you enforce a maximum delegation depth?
234. How do you implement retries for failed subagents?
235. How do you aggregate responses from multiple agents?
236. How do you resolve conflicting agent outputs?
237. Can agents call the same tools?
238. Should every agent have access to every tool?
239. How do you implement least privilege for agents?
240. How would you monitor a multi-agent workflow?

---

# 8. Subagents

241. What is a subagent?
242. Agent vs subagent?
243. Why use subagents?
244. How does a parent agent delegate work?
245. What information should be passed to a subagent?
246. Should a subagent inherit the parent's full context?
247. What is context isolation?
248. Why is context isolation important?
249. Should subagents have independent system prompts?
250. Can a subagent create another subagent?
251. How deep should subagent nesting go?
252. How do you prevent uncontrolled recursive delegation?
253. How does the parent agent determine that a subagent has completed its task?
254. How do you structure a subagent response?
255. How do you pass structured results back to the parent?
256. What happens if a subagent fails?
257. Can subagents work in parallel?
258. How do you execute multiple subagents concurrently?
259. How do you aggregate parallel subagent results?
260. When would sequential subagents be preferable?
261. How do you manage token usage across subagents?
262. What are the disadvantages of subagents?
263. How do subagents improve context management?
264. How do subagents improve specialization?
265. How would you implement a research subagent?
266. How would you implement a coding subagent?
267. How would you implement a database subagent?
268. How would you restrict tools available to a subagent?
269. What happens when a subagent produces hallucinated results?
270. How does the parent validate a subagent's output?

---

# 9. Multi-agent architecture scenarios

271. Design an AI software-development agent.

272. Design it using:
     **Planner → Coding Agent → Test Agent → Reviewer Agent**.

273. How would the planner break down requirements?

274. How would the coding agent modify source code?

275. How would the testing agent execute tests safely?

276. How would the reviewer verify changes?

277. Who gets permission to merge code?

278. How do you prevent an AI from pushing broken code?

279. How do you isolate agent workspaces?

280. How do you support parallel development agents?

281. Design a customer-support multi-agent system.

282. Router Agent → Billing Agent → Technical Agent → Escalation Agent.

283. How would routing work?

284. How would you handle ambiguous queries?

285. When should the agent escalate to a human?

286. How do you keep customer data isolated?

287. Design an SRE agent.

288. It detects an alert and investigates logs.

289. How would you prevent it from deleting infrastructure?

290. How would you allow safe remediation?

291. How do you integrate Grafana, Kubernetes, Splunk and GitHub?

292. Where would MCP fit?

---

# 10. Context engineering

293. What is context engineering?
294. Context engineering vs prompt engineering?
295. What information should be provided to an agent?
296. Why is more context not always better?
297. What is context pollution?
298. What is context compression?
299. What is conversation summarization?
300. How do you decide what history to retain?
301. What is context retrieval?
302. How do you dynamically inject relevant context?
303. How would you implement a context manager?
304. How do subagents help reduce context size?
305. What should be in the system prompt?
306. What should not be in the system prompt?
307. How do you protect a system prompt?
308. Can you fully prevent a user from discovering system instructions?
309. What information should be fetched just-in-time rather than stored in the prompt?

---

# 11. Agent memory

310. What is memory in an AI system?
311. What is conversational memory?
312. What is semantic memory?
313. What is episodic memory?
314. What is procedural memory?
315. Vector memory vs relational memory?
316. How do you decide what information should become long-term memory?
317. How do you expire memory?
318. How do you update incorrect memory?
319. How do you prevent duplicate memories?
320. How do you retrieve relevant memories?
321. How do you rank memories?
322. How do you implement user-specific memory?
323. How do you implement organization-level memory?
324. How do you enforce tenant isolation?
325. How do you handle GDPR/"forget me" requirements?
326. Why is automatically storing everything dangerous?

---

# 12. RAG for agents

327. Why do agents need RAG?
328. What is Agentic RAG?
329. Normal RAG vs Agentic RAG?
330. What is iterative retrieval?
331. What is adaptive retrieval?
332. What is multi-hop retrieval?
333. What is query decomposition?
334. What is self-query retrieval?
335. What is corrective RAG?
336. What happens if retrieval returns no relevant documents?
337. How does an agent determine whether another retrieval is necessary?
338. How can you evaluate RAG quality?
339. Precision vs recall in retrieval?
340. How do you evaluate document relevance?
341. How do metadata filters improve RAG?
342. How do you secure retrieved documents?

---

# 13. Security — very important

343. What is prompt injection?
344. Direct vs indirect prompt injection?
345. Give an example of indirect prompt injection.
346. How can a webpage attack an AI agent?
347. How could an email attack an AI agent?
348. How could an MCP resource inject malicious instructions?
349. How do you defend against prompt injection?
350. Can prompt injection be completely eliminated?
351. What is tool poisoning?
352. What is MCP server poisoning?
353. What is context poisoning?
354. What is memory poisoning?
355. What is retrieval poisoning?
356. How do you distinguish data from instructions?
357. Why should external content never automatically override system policy?
358. What is least privilege for AI agents?
359. How do you implement scoped credentials?
360. Why shouldn't API keys be placed inside prompts?
361. How should credentials be stored?
362. How should agents access secrets?
363. What is credential delegation?
364. What is identity propagation?
365. How do you authorize actions for individual users?
366. How do you audit agent actions?
367. What are high-risk tools?
368. What actions should require user confirmation?
369. How do you prevent data exfiltration?
370. How do you prevent cross-tenant leakage?
371. How do you sandbox an agent?
372. What is code execution sandboxing?
373. What network restrictions would you apply to an agent?
374. How do you protect against SSRF through agent tools?
375. How do you prevent command injection?
376. How do you prevent SQL injection from AI-generated SQL?

---

# 14. Reliability / production engineering

377. What happens when the LLM provider is unavailable?
378. How would you implement fallback models?
379. What happens when a tool is unavailable?
380. What happens when a subagent crashes?
381. How do you retry agent operations?
382. Which operations must not automatically retry?
383. How do you design idempotent agent operations?
384. How do you handle duplicate tool execution?
385. How do you prevent duplicate emails/payments/tickets?
386. How do you manage transaction boundaries?
387. Can an AI agent guarantee exactly-once execution?
388. How do you make agent execution eventually consistent?
389. How do you checkpoint an agent graph?
390. How do you recover from a partially completed workflow?
391. What is a dead-letter queue for agent jobs?
392. How do you implement circuit breaking?
393. How do you implement rate limiting?
394. How do you handle model rate limits?
395. How do you control concurrency?
396. How do you manage backpressure?
397. How do you implement request cancellation?

---

# 15. Observability

398. How do you monitor AI agents?
399. What metrics should you monitor?
400. What would you log?
401. Should you log prompts?
402. What security issues arise from logging prompts?
403. What is agent tracing?
404. What is a trace span in an agent execution?
405. How would you trace:

`User → Agent → Subagent → MCP → API → DB`

406. What is tool-call latency?
407. How do you measure token consumption?
408. How do you measure cost per agent task?
409. How do you find which tool caused a failure?
410. How do you debug non-deterministic behavior?
411. How do you replay an agent execution?
412. How do you correlate agent traces with application logs?
413. What would an agent observability dashboard contain?

---

# 16. Evaluation

414. How do you evaluate an AI agent?
415. How is agent evaluation different from LLM evaluation?
416. What is task completion rate?
417. What is tool selection accuracy?
418. What is tool argument accuracy?
419. What is trajectory evaluation?
420. What is an agent trajectory?
421. How do you evaluate reasoning without relying solely on final output?
422. What is an LLM-as-a-judge?
423. What are problems with LLM-as-a-judge?
424. What are golden datasets?
425. How do you create an evaluation dataset?
426. How do you regression-test prompts?
427. How do you test MCP tools?
428. How do you evaluate multi-agent workflows?
429. How do you evaluate RAG?
430. How do you measure hallucination?
431. How do you test prompt-injection resistance?
432. How do you evaluate tool-call safety?
433. How would you test an agent before production?
434. Offline evaluation vs online evaluation?
435. What is A/B testing for agents?

---

# 17. Performance and cost

436. Why can agents become expensive?
437. What contributes to agent cost?
438. How do you reduce LLM token usage?
439. How do you reduce context size?
440. When should you use a smaller model?
441. Can different subagents use different models?
442. How would you choose models per task?
443. How do you cache LLM responses?
444. What is semantic caching?
445. What should never be cached?
446. How do you cache tool results?
447. How do you parallelize independent tool calls?
448. Parallel tool calls vs sequential calls?
449. How do you reduce agent latency?
450. How do you set token and cost budgets per request?
451. What happens when the budget is exhausted?

---

# 18. Framework questions

Expect these if the JD mentions specific frameworks.

### LangChain

452. What is LangChain?
453. What are chains?
454. What are tools?
455. What are retrievers?
456. What is an agent executor?
457. What are callbacks?
458. How is state maintained?

### LangGraph

459. What is LangGraph?
460. Why use LangGraph rather than a simple LangChain agent?
461. What is a graph node?
462. What is an edge?
463. What are conditional edges?
464. What is graph state?
465. What is checkpointing?
466. How do you implement Human-in-the-Loop?
467. How do you model retries?
468. How do you implement parallel branches?
469. Why are graph-based agents easier to control?

### AutoGen / CrewAI / agent frameworks

470. What is an agent crew?
471. What is role-based agent architecture?
472. What is agent conversation?
473. How do CrewAI/AutoGen-style approaches differ from graph orchestration?
474. When would you avoid these abstractions and build your own orchestration?

---

# 19. Coding questions

You should be ready to implement small versions of these.

475. Write a basic tool-calling agent.
476. Create an LLM tool for:

```text
getWeather(city)
```

477. Validate tool arguments.
478. Implement max 5 agent iterations.
479. Implement agent timeout.
480. Implement retries with exponential backoff.
481. Implement an idempotency key for tool execution.
482. Implement parallel tool calls.
483. Build a parent-agent/subagent architecture.
484. Create a planner agent.
485. Create a researcher subagent.
486. Aggregate responses from 3 subagents.
487. Implement conversation memory.
488. Implement vector search.
489. Implement a simple RAG pipeline.
490. Implement chunking.
491. Implement cosine similarity.
492. Write an MCP server exposing a tool.
493. Create an MCP tool that queries a database.
494. Validate MCP tool input.
495. Add authentication to an MCP server.
496. Add logging/auditing around MCP calls.
497. Implement a tool approval flow.

---

# 20. System-design questions

These are the highest-value questions for experienced engineers.

### Design an enterprise AI assistant

498. Design an internal enterprise assistant that can access:

* Jira
* GitHub
* Confluence
* Slack
* databases

499. Where would you use MCP?
500. How would authentication work?
501. How would permissions flow from the user?
502. How would you prevent unauthorized data access?
503. Where would RAG be used?
504. How would you implement memory?
505. How would you audit every action?

### Design an AI coding agent

506. How would you give an agent repository access?
507. How would it understand a large repository?
508. How would you let it edit files?
509. How would it run tests?
510. How would you sandbox commands?
511. How would you create a PR automatically?
512. What actions should require confirmation?

### Design an AI DevOps agent

513. Agent receives a production alert.
514. It checks logs.
515. Checks Kubernetes.
516. Checks metrics.
517. Finds the probable root cause.
518. Suggests remediation.
519. Optionally performs remediation.

Be ready to explain:

* permissions
* MCP
* Kubernetes RBAC
* audit trails
* approval
* rollback
* observability

---

# 21. Scenario / tricky interview questions

520. The agent repeatedly calls the same tool. What do you do?
521. Your agent enters an infinite loop. How do you debug it?
522. The correct tool exists but the model never chooses it.
523. Two tools have almost identical functionality.
524. The agent calls a destructive API accidentally.
525. A customer email contains `"Ignore all previous instructions"`.
526. A retrieved webpage instructs the agent to upload secrets.
527. An MCP server suddenly exposes a new dangerous tool.
528. The LLM generates valid JSON but semantically incorrect parameters.
529. An API call succeeds but the agent thinks it failed and retries.
530. The agent creates two Jira tickets instead of one.
531. A subagent times out.
532. Two subagents return contradictory answers.
533. One subagent uses 90% of your token budget.
534. Your agent works in development but behaves unpredictably in production.
535. Agent latency increases from 4 seconds to 40 seconds.
536. Model cost increases 5× after introducing multi-agent architecture.
537. Your RAG system retrieves irrelevant documents.
538. Relevant documents exist but aren't returned.
539. Users discover data belonging to other tenants.
540. A tool returns malicious text that manipulates subsequent model behavior.

---

# 22. Questions interviewers ask experienced developers

You should have particularly strong answers for these:

541. **Why do I need an agent instead of writing normal code?**
542. **When should you NOT use an AI agent?**
543. **What business logic should never be delegated to an LLM?**
544. **What is deterministic vs non-deterministic orchestration?**
545. **Why are agents fundamentally harder to test than microservices?**
546. **How do you make an agent production-ready?**
547. **How do you guarantee safety when agents can take real actions?**
548. **How do you implement least-privilege tool access?**
549. **How do you handle failures in a multi-agent system?**
550. **How would you debug an agent making incorrect decisions?**
551. **How do you prevent hallucinated actions?**
552. **How do you separate reasoning from execution?**
553. **How do you make an agent auditable?**
554. **How do you make an agent idempotent?**
555. **How do you keep an agent's costs predictable?**
556. **How do you secure MCP in an enterprise?**
557. **Why use MCP instead of custom API integrations?**
558. **How does MCP change agent architecture?**
559. **Subagents vs tools—when would you use each?**
560. **Single agent vs multi-agent—how do you choose?**

For your **Java/Spring Boot + microservices background**, I would prioritize these 10 areas:

1. **Agent architecture and agent loops**
2. **Tool/function calling**
3. **MCP architecture and security**
4. **Agents vs subagents vs tools**
5. **Multi-agent orchestration**
6. **RAG + Agentic RAG**
7. **Prompt injection / tool security**
8. **Retries, idempotency, Saga and failure handling**
9. **Observability/evaluation**
10. **Designing agents around existing microservices**

A very common senior-level question will look like:

```text
We have 20 Spring Boot microservices.

We want an AI agent that can investigate customer issues,
query databases, inspect logs, create Jira tickets and trigger
safe operational actions.

Design the architecture.
```

A strong answer should naturally cover:

```text
                         ┌─────────────┐
User ──► API/Auth ──►    │ Orchestrator│
                         │    Agent    │
                         └──────┬──────┘
                                │
             ┌──────────────────┼─────────────────┐
             │                  │                 │
        Research           Operations         Ticket
        Subagent           Subagent           Subagent
             │                  │                 │
             └──────────────────┼─────────────────┘
                                │
                           MCP Gateway
                                │
                 ┌──────────────┼──────────────┐
                 │              │              │
               Jira          Splunk         Kubernetes
                 │
          Internal APIs
                 │
        Spring Boot Services
```

Then discuss **RBAC, scoped credentials, MCP tool schemas, HITL for writes, idempotency, retries, audit logs, tracing, token budgets, sandboxing, and evaluation**.

That combination is much closer to what a **5+ year engineer / senior GenAI engineer interview** will test than memorizing LLM definitions.
