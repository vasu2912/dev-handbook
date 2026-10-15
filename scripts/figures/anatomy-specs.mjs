// Authored explanations. These describe software behavior, not physical hardware.
// Mechanical parts are mnemonic models; counts and timings are stated explicitly.
const specs = new Map();
const figure = (title, kind, object, takeaway, parts) => ({
  title,
  kind,
  object,
  takeaway,
  parts: parts.map((s) => {
    const [label, ...body] = s.split("|");
    return { label, body: body.join("|") };
  }),
});
function add(slug, figures) {
  figures.forEach((f, i) =>
    specs.set(`${slug.replaceAll("/", "--")}-${i + 1}`, f),
  );
}
const f = figure;
add("agentic-ai/agents/agent-loop", [
  f(
    "The loop belongs to the application",
    "carousel",
    "A four-position indexing table with a guarded stop lever.",
    "A model proposes the next step. Application code controls authority, state, budgets, and when the loop stops.",
    [
      "Observe|Read the goal, constraints, and current state before proposing another action.",
      "Decide|The model proposes one bounded next step. A proposal grants no permission.",
      "Act|Application code validates and authorizes the tool call before it executes.",
      "Record and stop|Record the result and update state. Stop on completion, exhausted budget, or policy; otherwise observe again.",
    ],
  ),
]);
add("agentic-ai/context-and-memory", [
  f(
    "Choose what enters this turn",
    "archive",
    "An archive cabinet beside a selection tray and a reading carriage.",
    "Working context is temporary. Durable memory has its own storage, provenance, and governance.",
    [
      "Candidate inputs|Instructions, the user goal, task state, retrieved evidence, tool results, and conversation history are candidates, not an automatic entitlement to context.",
      "Selection tray|Rank, trim, and label sources. Relevance, freshness, and authorization still need deliberate checks.",
      "Working context|The selected material is the model input for this turn. A larger window does not select useful evidence for you.",
      "Durable memory|Persist governed, versioned state separately. It can outlive the current request without becoming an instruction.",
    ],
  ),
]);
add("agentic-ai/foundations/embeddings", [
  f(
    "Similarity is a distance, not a verdict",
    "comparator",
    "A comparison instrument with reference samples and a movable probe.",
    "Nearby vectors suggest similarity under the same embedding model. They do not establish truth or permission.",
    [
      "Encode|Use the same embedding model and version for the query and compared items. The example query asks how to return a damaged item.",
      "Compare coordinates|A vector such as [0.18, -0.42, 0.07, ...] supplies coordinates for a distance or similarity calculation.",
      "Rank candidates|A returns policy or damaged-item procedure may rank ahead of office catering. This is a model-dependent comparison.",
      "Check evidence|Evaluate the retrieved content for correctness, authorization, and sufficiency before using it.",
    ],
  ),
]);
add("agentic-ai/foundations/generation-and-structured-output", [
  f(
    "A shape check is only the first gate",
    "gate",
    "An inspection fixture with a form die, a policy latch, and a release gate.",
    "Valid JSON can describe an unauthorized action. The application checks meaning after syntax.",
    [
      "Schema die|The schema constrains fields such as action, amount, accountId, and reason.",
      "Generated proposal|The example refund has amount 9000 and account A-17. Syntactic validity does not prove that this refund is allowed.",
      "Semantic latch|Check the account, amount limit, and supporting reason against application state.",
      "Authority gate|Authorize, request approval when required, or reject with a typed error before execution.",
    ],
  ),
]);
add("agentic-ai/foundations/llms", [
  f(
    "Generate one token, then repeat",
    "press",
    "A token stamping press feeding a growing paper strip.",
    "Fluent continuation does not establish truth, authority, or a plan.",
    [
      "Prompt strip|The prompt is already a sequence of tokens: [Write] [a] [safe] [tool] [call].",
      "Prediction press|The transformer computes a distribution over possible next tokens.",
      'Choose one|Illustrative scores are { 0.41, "tool" 0.32, call 0.17, and other 0.10. Selection is a separate step from scoring.',
      "Append and repeat|Append the selected token, here {, to context and compute the next distribution.",
    ],
  ),
]);
add("agentic-ai/foundations/tokens-and-context", [
  f(
    "One request has one token budget",
    "tray",
    "A slotted input tray and a segmented budget holder.",
    "Token counts depend on the tokenizer. Word counts cannot establish context limits.",
    [
      'Input text|The example text is "unbelievable agents!". Characters and words are not the unit the model receives.',
      "Tokenizer|An illustrative split is [un] [believ] [able] [ agents] [!], with IDs 41, 9021, 73, 1884, and 9. Real splits vary by tokenizer.",
      "Context allocation|Instructions, goal, history, retrieved evidence, and tool results share the request budget.",
      "Output reserve|Leave capacity for generated output under the model’s actual context and output limits. The tray is schematic, not a token-capacity scale.",
    ],
  ),
]);
add("agentic-ai/foundations/transformers-and-attention", [
  f(
    "Gather information with learned weights",
    "comparator",
    "A sampling comb and a weighted collection carriage.",
    "Attention weights are learned computations, not a guaranteed explanation of reasoning.",
    [
      "Query|For a current token, the query represents the information being sought.",
      "Keys|Other token positions provide keys. Comparing query and keys produces attention scores.",
      "Weighted values|Normalize scores into weights and combine values. This lets a token gather information from other positions.",
      'Example|In "The robot could not lift the box because it was too heavy", positions can exchange information about the box and its weight. No particular attention weights are asserted here.',
    ],
  ),
]);
add("agentic-ai", [
  f(
    "Terms name different kinds of things",
    "cabinet",
    "A nested storage cabinet beside an independent agent workbench.",
    "An agentic system includes an application around a model; it is not another name for an LLM.",
    [
      "AI, ML, and deep learning|Machine learning is within artificial intelligence; deep learning is within machine learning.",
      "Generative models|Generative AI produces content such as text, images, audio, and code. LLMs are a family of models for token sequences.",
      "Agent system|Combine a model with an execution loop, tools, state, policy, and stop conditions. The system’s behavior is larger than the model.",
    ],
  ),
  f(
    "Proposals pass through an authority gate",
    "gate",
    "A proposal press inside a guarded workbench with separate capability bays.",
    "Structured does not mean authorized or safe.",
    [
      "Assemble context|The user goal and constraints guide application-selected context.",
      "Model proposal|The model can propose restartDeployment with name orders and namespace prod. It does not grant itself production authority.",
      "Validate and authorize|Application code decides whether the proposed operation is valid and permitted.",
      "Capabilities and observation|Tools read or change state; retrieval supplies evidence; a subagent runs bounded work. Record observations for the next turn.",
    ],
  ),
]);
add("agentic-ai/mcp/elicitation-and-tasks", [
  f(
    "Waiting for input differs from background work",
    "dispatch",
    "A request holding bay beside an independent job magazine.",
    "Choose by lifetime: a paused logical request and an independently running task are different mechanisms.",
    [
      "Pause for input|A tool request can return input_required when it needs missing user or client data to finish.",
      "Resume the request|Supply the missing information and resume the same logical request.",
      "Detach a task|Long-running work returns a task ID and working status, with optional progress.",
      "Inspect or cancel|Use the task’s supported get, update, and cancel operations, then retrieve its final result.",
    ],
  ),
]);
add("agentic-ai/mcp", [
  f(
    "The host owns the authority",
    "rack",
    "A host console connected to two separate capability cabinets.",
    "MCP standardizes capability exchange. The host still controls model context and action policy.",
    [
      "Host console|The AI host owns the model, orchestration, policy, and user experience.",
      "Client adapters|Separate MCP clients connect the host to capability servers. Do not assume a protocol session is required.",
      "Filesystem server|An example server offers search, docs:// resources, and a review-doc prompt.",
      "Ticket server|Another offers create_ticket, ticket:// resources, and triage. JSON-RPC travels over supported stdio or Streamable HTTP transports.",
    ],
  ),
]);
add("agentic-ai/mcp/primitives", [
  f(
    "Choose the capability by what it does",
    "cabinet",
    "A tool drawer, an addressable document drawer, and a workflow drawer.",
    "Tools perform operations; resources supply context; prompts start reusable workflows.",
    [
      "Tools|Model-controlled operations have input schemas, possible side effects, and structured results. Example: create_ticket({title, severity}).",
      "Resources|Application-selected content has URI identity, readable content, and possibly subscriptions or templates. Example: policy://returns/v7.",
      "Prompts|User-invoked named templates accept arguments and supply starting messages. Example: review_incident({id}).",
    ],
  ),
]);
add("agentic-ai/mcp/transports-and-lifecycle", [
  f(
    "Discover, then make independent requests",
    "dispatch",
    "A capability catalogue and two request terminals.",
    "The protocol described in this article is stateless. Do not assume the legacy initialize/initialized handshake.",
    [
      "Optional discovery|server/discover obtains a capability snapshot, protocol version, and tools, resources, and prompts metadata.",
      "Independent request|tools/call includes per-request protocol metadata. HTTP also carries the required method and name headers.",
      "Result|The server returns a result, structured content, or a typed error. Discovery is not authority to execute.",
    ],
  ),
]);
add("agentic-ai/multi-agent/subagents", [
  f(
    "Separate work, then merge evidence",
    "dispatch",
    "A supervisor sorter with three isolated work trays.",
    "The merge keeps evidence and disagreements, rather than multiplying conversation.",
    [
      "Supervisor|Split work that can run independently and assign bounded authority.",
      "Research tray|Use a small evidence context and read-only sources. Return cited findings.",
      "Code and operations trays|A code worker returns a scoped patch and tests; an operations worker returns observations from scoped diagnostics.",
      "Merge|Combine structured results while preserving sources and unresolved disagreements.",
    ],
  ),
]);
add("agentic-ai/orchestration/durable-execution", [
  f(
    "Resume from recorded state",
    "carousel",
    "An indexing table with a persistent checkpoint magazine.",
    "A completed effect needs explicit compensation to undo it; replay is not automatic reversal.",
    [
      "Plan and approve|Record PLANNED and APPROVED state before executing effects.",
      "Execute|Record attempt state and an idempotency key at a durable checkpoint.",
      "Recover|After a crash or timeout, resume from known state and reconcile whether the effect already happened.",
      "Verify and complete|VERIFYING establishes the outcome before COMPLETE. Compensate explicitly when a completed effect must be undone.",
    ],
  ),
]);
add("agentic-ai/production/observability", [
  f(
    "Follow one run across boundaries",
    "scope",
    "A trace recorder with nested recording lanes.",
    "A trace explains one run; quality and safety outcomes still need their own evidence.",
    [
      "Run envelope|agent.run carries trace_id 8f3… across the run.",
      "Model and retrieval|Record model, tokens, latency, and retrieval query, filters, and hits.",
      "Tool and network|Connect tool name, arguments, decision, MCP server and method, API status, retries, and effect ID.",
      "Outcome|Evaluate correctness, groundedness, policy compliance, task success, and human override alongside latency, call counts, retries, and cost.",
    ],
  ),
]);
add("agentic-ai/rag", [
  f(
    "Prepare evidence, then retrieve deliberately",
    "archive",
    "An indexing cabinet beside a filtered retrieval carriage.",
    "Generation cannot repair missing or unauthorized evidence.",
    [
      "Prepare offline|Parse and chunk source documents; retain metadata and embed them into an index with access fields.",
      "Keep provenance|Example metadata records source policy-7, version 2026-09-01, and tenant store-42.",
      "Retrieve online|Authorize the user’s retrieval scope, retrieve candidates, then rerank and select.",
      "Generate and cite|Generate from selected evidence and return citations. Check whether the evidence actually supports the answer.",
    ],
  ),
]);
add("agentic-ai/security/prompt-injection", [
  f(
    "Keep outside text outside authority",
    "gate",
    "An input tray separated from an execution gate by independent latches.",
    "Untrusted content remains data, even when it contains instructions.",
    [
      "Untrusted tray|Email, web pages, documents, and tool results can contain hostile text, such as a request to send secrets to evil.example.",
      "Model context|The model may see trusted instructions and untrusted content together. Label provenance and retrieve only authorized sources.",
      "Action latch|Validate and authorize every proposal; require approval for effects covered by policy.",
      "Independent controls|Restrict egress and secrets. Audit the evidence, proposal, decision, and effect at their respective boundaries.",
    ],
  ),
]);
add("agentic-ai/tools/safe-execution", [
  f(
    "Permission comes before execution",
    "gate",
    "An inspection line with independent validation and authority latches.",
    "Reject with a typed error. Do not improvise around policy.",
    [
      "Proposal|The model proposes an operation and arguments.",
      "Checks|Check the schema and semantics, then whether this user is authorized.",
      "Approval and execution|Obtain approval when required. Execute with an idempotency strategy appropriate to the effect.",
      "Verification|Check the actual effect and record an audit trail; a successful call alone is not proof of the intended outcome.",
    ],
  ),
]);

add("backend/api-design/rest", [
  f(
    "Resources have stable addresses",
    "cabinet",
    "A cabinet whose collection drawer contains item and subcollection holders.",
    "Paths identify resources. HTTP methods express the operation.",
    [
      "Collection|/users names the collection.",
      "Item|/users/{id} identifies one user.",
      "Subcollection|/users/{id}/orders identifies that user’s orders.",
      "Nested item|/users/{id}/orders/{id} identifies one order in that scope. Validate access to the requested object.",
    ],
  ),
]);
add("backend/api-design/url-design", [
  f(
    "Read a URL in four pieces",
    "tray",
    "A four-compartment address holder.",
    "Each URL component has a separate job.",
    [
      "Scheme|https selects the protocol.",
      "Host|api.example.com identifies the destination host.",
      "Path|/users/123/orders identifies a collection, item, and subcollection.",
      "Query|filter=value&sort=field supplies request parameters after ?. It does not replace authorization.",
    ],
  ),
]);
add("backend/architecture/handlers-and-controllers", [
  f(
    "A handler translates the HTTP boundary",
    "dispatch",
    "A routing selector beside an input gauge and an output press.",
    "Keep domain decisions in the service. The handler manages the HTTP contract.",
    [
      "Route|Match the HTTP request to a route. No match returns 404 Not Found.",
      "Validate|Validate and parse input before calling the service.",
      "Service|Pass typed application input to the service.",
      "Response|Format the result or mapped error into the HTTP response.",
    ],
  ),
]);
add("backend/architecture/middleware", [
  f(
    "Enter inward, return outward",
    "cabinet",
    "A nested enclosure with an inner handler fixture.",
    "Middleware wraps the next operation. A rejected request can stop before reaching the handler.",
    [
      "CORS|The request first crosses the outer CORS policy.",
      "Logging|Logging wraps the downstream request and response.",
      "Authentication|Authentication can reject the request before the handler runs.",
      "Handler and return|The handler produces a response. It returns through authentication, logging, and CORS in reverse order.",
    ],
  ),
]);
add("backend/architecture/request-lifecycle", [
  f(
    "One request crosses distinct responsibilities",
    "conveyor",
    "A processing line with four purposeful stations.",
    "The response returns through the calling path; each responsibility stays in its own layer.",
    [
      "Client and routing|The client enters the application through routing.",
      "Handler|Parse the HTTP contract and call the application service.",
      "Service|Apply application and domain decisions, then request persistence through a repository.",
      "Repository and database|The repository talks to storage. Return the result through the service and handler to the client.",
    ],
  ),
]);
add("backend/concurrency/concurrency-and-parallelism", [
  f(
    "Overlap is different from simultaneous work",
    "tracks",
    "A two-lane scheduling rig with independently parked workpieces.",
    "Concurrency overlaps task lifetimes. Parallelism executes work simultaneously on multiple cores.",
    [
      "One core|T1 can yield during I/O so T2 runs. Only one task executes on that core at an instant.",
      "Two cores|T1 and T2 can execute at the same time on distinct cores.",
      "I/O wait|Waiting work is not CPU execution. Parallel tasks can also wait on I/O.",
    ],
  ),
]);
add("backend/concurrency/event-loop", [
  f(
    "Callbacks wait for their turn",
    "carousel",
    "A callback indexing table with an I/O holding tray.",
    "The loop dispatches ready callbacks. Starting I/O does not mean waiting synchronously for it.",
    [
      "Poll|Check I/O readiness and the relevant ready-work queues.",
      "Dispatch|Select and run a ready callback.",
      "Start I/O|A callback can initiate asynchronous I/O and register a continuation.",
      "Return to loop|When work is ready, its callback can run on a later turn. Exact phases vary by runtime.",
    ],
  ),
]);
add("backend/concurrency/goroutines", [
  f(
    "Many goroutines share execution capacity",
    "dispatch",
    "A task magazine feeding two scheduler carriages.",
    "Goroutines are scheduled by the Go runtime; one goroutine is not one OS thread.",
    [
      "Goroutines|G1, G2, G3, and G4 are lightweight scheduled work.",
      "Scheduler|The Go scheduler assigns runnable goroutines to available execution capacity.",
      "OS threads|Thread 1 and Thread 2 illustrate shared execution resources, not a universal thread count.",
      "Channels|Channels coordinate communication. They are not an automatic cure for all shared-state races.",
    ],
  ),
]);
add("backend/concurrency/race-conditions", [
  f(
    "Two increments can produce only one",
    "comparator",
    "Two independent read carriages sharing a single counter register.",
    "A read-modify-write operation must be synchronized as a whole.",
    [
      "Both read|Thread A and thread B each read counter 0.",
      "Both compute|Each independently computes 0 + 1 = 1.",
      "Both write|A writes 1; B writes 1. The final counter is 1, not 2.",
      "Protect the operation|Use an appropriate lock, atomic operation, or ownership strategy to prevent the lost update.",
    ],
  ),
]);
add("backend/concurrency/threads", [
  f(
    "Workers draw from one queue",
    "dispatch",
    "A shared job magazine with three worker stations.",
    "Pool size limits active execution. Shared memory still needs synchronization.",
    [
      "Task queue|Pending tasks wait until a worker pulls them.",
      "Worker pool|Worker threads 1, 2, and 3 represent the illustrated process pool.",
      "Shared memory|Workers in a process can share memory. Coordinate conflicting reads and writes.",
    ],
  ),
]);
add("backend/http-and-apis", [
  f(
    "A request and a response have a contract",
    "dispatch",
    "Two message terminals and an envelope inspection tray.",
    "HTTP status, headers, and body carry different parts of the response contract.",
    [
      "Request|The client sends GET /api/users HTTP/1.1, Host: example.com, and Accept: application/json.",
      "Server|The server routes the request and performs the operation.",
      'Response|The example returns HTTP/1.1 200 OK, Content-Type: application/json, and {"users": [...]}.',
    ],
  ),
]);
add("backend/security/authentication", [
  f(
    "Make stolen password hashes expensive to attack",
    "press",
    "A password inspection press with separate salt and cost controls.",
    "Use a modern slow password hash with a unique salt. A salt alone does not make a fast hash suitable.",
    [
      "Plaintext|A database breach directly exposes plaintext passwords such as 12345.",
      "Salt|A unique random salt prevents precomputed lookup reuse. bcrypt already incorporates a salt; it is not an unsalted-hash example.",
      "Cost|Argon2id or bcrypt deliberately makes each guess expensive. Tune cost to your system; 400 ms is illustrative, not a universal requirement.",
      "Store and verify|Store the algorithm’s encoded hash with its parameters and salt. Never use plain MD5 or SHA-256 as a password-storage algorithm.",
    ],
  ),
  f(
    "A cookie points to server-side state",
    "archive",
    "An opaque-key dispenser beside a session archive.",
    "The cookie carries an unguessable identifier; the server owns session state and revocation.",
    [
      "Authenticate|Check the supplied email and password.",
      "Create session|Generate an unpredictable session ID with at least 128 bits of entropy; the example allows 128–256 bits.",
      "Store and set cookie|Store the ID and metadata in a database or Redis. Set appropriate HttpOnly, Secure, and SameSite cookie flags.",
      "Look up on requests|The browser sends the cookie; the server looks up the session to establish identity. Delete or expire state to revoke it.",
    ],
  ),
  f(
    "A signature protects integrity, not secrecy",
    "press",
    "A three-part message holder beside a signing die.",
    "A JWT payload is readable. Never put secrets in it just because it is signed.",
    [
      "Header|The header names the algorithm, illustrated by HS256. JWT segments use base64url encoding.",
      "Payload|Claims such as sub, iat, and role are encoded, not encrypted.",
      "Signature|For HS256, compute the HMAC over header.payload with the secret. Verify the expected algorithm, signature, issuer, audience, and time claims.",
    ],
  ),
  f(
    "Rotate refresh tokens and detect reuse",
    "gate",
    "A single-use credential magazine with a revocation latch.",
    "Refresh-token reuse is a signal to revoke the affected token family and reauthenticate.",
    [
      "Login|Issue an access token and refresh token A. The original example uses a 15-minute access lifetime and a 7-day refresh lifetime.",
      "Access|Use the access token for API calls while it remains valid.",
      "Rotate|An accepted refresh consumes A and returns a replacement refresh token B plus a fresh access token.",
      "Reused A|Reject reuse of the consumed token and apply the system’s token-family revocation policy. Rotation needs server-side tracking.",
    ],
  ),
  f(
    "Combine independent abuse limits",
    "gate",
    "Three independently operated admission latches.",
    "Limits at different scopes catch different attack patterns. These numbers are example policies.",
    [
      "Per IP|The example allows 10 attempts per minute per IP.",
      "Per account|The example locks after 5 failures in 15 minutes. This can catch attempts spread over rotated IPs.",
      "Global|A system-wide limit of N attempts per minute protects total capacity.",
      "Policy|Authentication endpoints need deliberate limits, recovery rules, and protection against lockout abuse.",
    ],
  ),
]);
add("backend/security/authorization", [
  f(
    "Identity and permission are separate checks",
    "gate",
    "An identity gauge beside an independent access latch.",
    "Knowing which user made a request does not establish what that user may do.",
    [
      "Authenticate|Verify identity: which user is this?",
      "Authorize|Check whether that identity may perform this action on this object.",
    ],
  ),
  f(
    "Check ownership where the object is read",
    "archive",
    "A record cabinet with an owner-keyed retrieval latch.",
    "An authenticated user with read:books still cannot read another user’s book.",
    [
      "Route checks|Authentication and a broad read:books permission establish only preliminary access.",
      "Object lookup|Fetching book id 5 without checking its owner can expose another user’s data.",
      "Owner filter|Scope the query with the authenticated context, such as AND user_id = context.user_id. Do not accept the owner from untrusted input.",
    ],
  ),
  f(
    "Avoid turning denial into an existence oracle",
    "gate",
    "A request inspector with a uniform denial chute.",
    "Choose denial behavior deliberately so an attacker cannot infer protected object existence.",
    [
      "Guess|An attacker guesses id 7.",
      "Leaking response|Different externally visible responses can reveal whether a protected object exists.",
      "Consistent denial|Use the application’s intended 403 or 404 policy consistently while preserving internal diagnostics.",
    ],
  ),
  f(
    "An admin URL needs an admin check",
    "gate",
    "A privileged control panel with a role-keyed latch.",
    "Hiding an endpoint is not access control.",
    [
      "Hidden address|An unlisted /admin/invoices URL still accepts requests unless protected.",
      "Role latch|Check the authenticated user’s permission to use admin functions.",
      "Object scope|Even authorized functions need appropriate object-level scope for the operation.",
    ],
  ),
  f(
    "Unpredictable identifiers do not grant permission",
    "cabinet",
    "A record drawer with a numbered key and an opaque key.",
    "UUIDs can reduce easy enumeration; every object still needs authorization.",
    [
      "Sequential ID|/invoices/102 suggests neighboring IDs 101, 103, and 104.",
      "Opaque ID|An unpredictable identifier is harder to guess. UUID properties depend on the version and generation method.",
      "Access check|A leaked or discovered opaque ID must still fail access checks for the wrong user.",
    ],
  ),
  f(
    "Check both the owner and the function",
    "gate",
    "Two independent access latches on a shared control console.",
    "Horizontal and vertical authorization failures require different checks.",
    [
      "Horizontal|User A reaches user B’s data at the same privilege level. Apply owner or tenant scope at data access.",
      "Vertical|A member reaches an admin-only function. Apply the required role or permission check.",
      "Both|A valid role does not replace object ownership checks, and object ownership does not grant admin privileges.",
    ],
  ),
]);
add("backend/security", [
  f(
    "Security controls live in different contexts",
    "cabinet",
    "A four-compartment enclosure with separate controls.",
    "Browser, network, operating system, and application are distinct security contexts.",
    [
      "Browser|HTML, JavaScript, and cookies run in the client context.",
      "Network|HTTP traffic and transport encryption have their own controls.",
      "Server OS|Processes, shells, and operating-system permissions form another context.",
      "Backend application|Application code enforces its own input and access policies. This chapter focuses here.",
    ],
  ),
  f(
    "Each destination speaks a different language",
    "dispatch",
    "An output selector with SQL, document, and shell receptacles.",
    "Treat data according to the destination interpreter, not as an interchangeable string.",
    [
      "Database|SQL syntax and values must be kept separate.",
      "Browser|HTML, CSS, and JavaScript each require context-appropriate output handling.",
      "Operating system|Avoid shell interpretation of untrusted input; prefer argument-based process APIs.",
    ],
  ),
  f(
    "Keep incoming data out of executable syntax",
    "gate",
    "An input holder separated from a program control die.",
    "Injection occurs when an interpreter receives attacker-controlled text as code.",
    [
      "User input|Treat external input as untrusted data.",
      "Interpreter boundary|SQL, shell, and HTML/JavaScript have different syntax rules.",
      "Control|Use parameterization, safe APIs, and context-appropriate encoding to preserve the data/code distinction.",
    ],
  ),
  f(
    "Independent controls cover different failures",
    "gate",
    "A guarded fixture with independent inspection latches.",
    "One check cannot replace all the other security controls.",
    [
      "Validate|Validate fields and parse expected types at input boundaries.",
      "Parameterize|Keep data separate from executable statements and commands.",
      "Authorize|Check permission at the actual point of access.",
      "Constrain and observe|Apply appropriate headers, browser policies, cookie flags, logging, monitoring, and audit trails.",
    ],
  ),
]);
add("backend/security/injection-attacks", [
  f(
    "Do not assemble code from untrusted text",
    "press",
    "A program die and a separate value feed.",
    "Keep the statement structure fixed and provide external values through a data channel.",
    [
      "Trusted program|Application code selects the intended statement or operation.",
      "Untrusted value|User input belongs in a value channel.",
      "Injection|Concatenating input into executable syntax lets data change the operation.",
    ],
  ),
  f(
    "A quote can change the whole query",
    "press",
    "An open text press with an uncontrolled syntax feed.",
    "The example payload changes query logic when concatenated into SQL.",
    [
      "Payload|The attacker supplies an apostrophe followed by OR with the always-true comparison '1'='1', then a SQL comment marker.",
      "Altered statement|The first quote ends the intended value. OR changes the WHERE logic; the comment can remove the remaining constraint.",
      "Exposure|The demonstrated vulnerable query returns all matching rows rather than just the intended user. Parameterize it.",
    ],
  ),
  f(
    "A bound value cannot rewrite the statement",
    "gate",
    "A fixed statement die beside an isolated value holder.",
    "Parameterization preserves the distinction between SQL code and data.",
    [
      "Statement|Use a fixed statement such as WHERE email = $1.",
      "Bound value|Bind the entire malicious-looking input as one string value.",
      "Database|The database compares the value as data. The example finds no matching email; the payload does not become SQL syntax.",
    ],
  ),
  f(
    "A shell separator creates another command",
    "gate",
    "An argument inspection fixture beside a guarded process control.",
    "Avoid handing untrusted input to a shell interpreter.",
    [
      "Intended operation|The example intends to invoke ffmpeg with input and output arguments.",
      "Injected separator|A semicolon in a concatenated shell command can begin a second command, illustrated by rm -rf /.",
      "Safe process API|Pass arguments separately without a shell, and validate application-specific path and option constraints.",
    ],
  ),
]);
add("backend/security/misconfiguration", [
  f(
    "Keep secrets out of source history",
    "archive",
    "A versioned document archive beside a separate key vault.",
    "Once a secret leaks, rotate it. Removing its current source line does not erase history.",
    [
      "Source history|A hardcoded secret is visible to readers of the repository and remains in previous commits.",
      "Secret delivery|Use an appropriate secret manager or deployment mechanism. Environment variables still require access and logging controls.",
      "Rotate|Revoke the leaked credential and issue a replacement. Removing the old text is not revocation.",
    ],
  ),
  f(
    "Logs need deliberate disclosure rules",
    "scope",
    "A recorder with a filtered output gate.",
    "Log level alone is not a secrecy guarantee. Keep sensitive values out at every level.",
    [
      "Diagnostic detail|Debug logs can expose SQL, stack traces, or sensitive values when instrumentation is careless.",
      "Production events|Choose useful operational events and deliberate verbosity for production.",
      "Redact and restrict|Avoid logging secrets and private data, sanitize unsafe content, and restrict access and retention.",
    ],
  ),
]);
add("backend/security/xss-and-csrf", [
  f(
    "Stored content must stay content",
    "press",
    "A content archive feeding a browser rendering press.",
    "Stored XSS occurs when attacker-controlled content is interpreted as executable browser code.",
    [
      "Attacker content|An attacker posts content containing a script, illustrated by stealCookies().",
      "Store|Storing the text does not make it trusted.",
      "Render|Unsafe HTML insertion can turn the stored text into executable DOM content.",
      "Defend|Use context-appropriate escaping or deliberate sanitization for allowed HTML. HttpOnly restricts cookie reads but does not eliminate XSS.",
    ],
  ),
  f(
    "A cookie can accompany an unwanted request",
    "gate",
    "A browser dispatch mechanism carrying an attached session key.",
    "The browser’s attached credentials do not establish that the user intended the action.",
    [
      "Session|The user is signed into bank.com and has its authentication cookie.",
      "Attacker site|evil.com attempts to cause a request to the bank, for example with a submitted form.",
      "Credential attachment|When cookie policy permits, the browser attaches credentials automatically.",
      "Defend|Enforce appropriate CSRF controls, such as validated tokens and origin checks, with deliberate SameSite cookie policy.",
    ],
  ),
]);
add("guides/request-lifecycle", [
  f(
    "Follow the round trip",
    "dispatch",
    "A name-resolution catalogue beside a request processing line.",
    "Name lookup precedes the illustrated HTTP path; the response travels back to the browser.",
    [
      "Resolve|The browser resolves the domain through DNS and receives an IP address, unless a usable cache answers.",
      "Enter|The HTTP request reaches the edge or load balancer and routes to the application.",
      "Query|The application queries the database, which returns the requested data.",
      "Return|The application sends its HTTP response through the edge to the browser.",
    ],
  ),
]);
add("java-spring/async-jobs", [
  f(
    "A future is not durable job storage",
    "dispatch",
    "A caller terminal beside an in-memory work holder.",
    "The caller’s future tracks completion in this process. It does not make r42 recoverable after a crash.",
    [
      "Caller|The caller receives a future that is still pending.",
      "Worker|The worker owns r42 in memory while executing it.",
      "Process lifetime|A process crash can lose in-memory work. Use durable workflow or queue storage when recovery is required.",
    ],
  ),
  f(
    "A full pool needs a rejection policy",
    "dispatch",
    "Two worker clamps beside a two-slot waiting magazine.",
    "Two occupied workers and two full queue slots leave no place for r5.",
    [
      "Workers|r1 and r2 occupy both of the two illustrated workers.",
      "Queue|r3 and r4 occupy both of the two illustrated queue slots.",
      "Rejection|r5 is rejected rather than queued. Handle that outcome according to the configured executor policy.",
    ],
  ),
]);
add("java-spring/beans", [
  f(
    "Injection selects one registered candidate",
    "dispatch",
    "A connector selector beside two registered component holders.",
    "The email qualifier selects the dependency; it does not unregister the archive bean.",
    [
      "Dependency|ReceiptService requires a ReceiptSender.",
      "Selected bean|The email qualifier selects EmailReceiptSender, bean name email.",
      "Other bean|ArchiveReceiptSender, bean name archive, remains registered but is not injected at this point.",
    ],
  ),
]);
add("java-spring/caching", [
  f(
    "Commit and eviction leave different state",
    "archive",
    "A durable record cabinet beside an empty cache tray.",
    "The database contains committed version 2 while the cache entry is absent.",
    [
      "Database|The update commits version 2.",
      "Cache|The acme p7 entry is evicted. An empty cache does not mean the database is empty.",
      "Next read|A subsequent cache miss can reload the committed value.",
    ],
  ),
  f(
    "An old reader can repopulate stale data",
    "archive",
    "A read carriage holding an old record beside an evicted cache tray.",
    "Eviction alone does not stop an in-flight reader from caching an older value.",
    [
      "Old read|Reader A has already read version 1.",
      "New commit|The database now contains committed version 2 and the cache has been evicted.",
      "Late population|Reader A stores its old version 1 in cache. The cache is now stale despite the successful update and eviction.",
    ],
  ),
]);
add("java-spring/events-messaging", [
  f(
    "Before commit, neither write survives",
    "archive",
    "A transaction tray beside an empty broker magazine.",
    "The transaction rolls back the order change and outbox entry together.",
    [
      "Order|The durable order o42 remains DRAFT.",
      "Outbox|There is no committed e42 row to publish.",
      "Broker|The broker has no e42. The relay cannot publish an uncommitted outbox row.",
    ],
  ),
  f(
    "After commit, publication can recover",
    "archive",
    "A durable outbox holder beside a broker waiting bay.",
    "The stored publication intent survives when the relay stops before publishing.",
    [
      "Database|Order o42 is PLACED after commit.",
      "Outbox|Event e42 is committed and pending.",
      "Broker|The broker has no e42 yet. A restarted relay can find the pending row.",
    ],
  ),
  f(
    "A retry can deliver the same event twice",
    "dispatch",
    "A pending outbox holder feeding a duplicate-capable broker magazine.",
    "Use stable event identity and idempotent consumption; an outbox does not guarantee exactly-once delivery.",
    [
      "Publish|The relay publishes e42 to the broker.",
      "Interrupted marking|The relay stops before recording publication success, so the row still appears pending.",
      "Retry|A restarted relay publishes e42 again. The broker can deliver e42 twice with the same event ID.",
    ],
  ),
]);
add("java-spring/http-clients", [
  f(
    "A timeout can hide a successful payment",
    "dispatch",
    "A request terminal with separate send and return holding bays.",
    "A failed connection and a lost response imply different knowledge about the effect.",
    [
      "Connect failure|In the illustrated refused connection, no payment request reaches the provider.",
      "Accepted request|The provider can accept POST o42 before its response reaches the caller.",
      "Lost response|A caller timeout leaves the outcome unknown. It does not prove the payment failed.",
      "Reconcile|Use operation identity, idempotency, or a status query to establish what happened before retrying an effect.",
    ],
  ),
]);
add("java-spring/jpa-entities", [
  f(
    "Object state controls persistence behavior",
    "carousel",
    "A four-position entity-state holder.",
    "Entity states are persistence-context states, not four copies of the same database row.",
    [
      "New|The object is not yet managed. persist can make a new entity managed.",
      "Managed|The persistence context tracks the entity. Changes can be synchronized by flush.",
      "Detached|detach or clear removes management. Later changes to that detached object are not automatically tracked.",
      "Removed|remove on a managed entity schedules deletion; flush and transaction outcome still matter.",
    ],
  ),
  f(
    "Flush sends work; commit makes it durable",
    "press",
    "A managed record fixture feeding a transaction commit latch.",
    "A rollback after flush can still undo the update.",
    [
      "Managed object|The managed name is Ada Lovelace.",
      "Flush|Flush sends the UPDATE within the current transaction.",
      "Commit|After successful commit, a new transaction reads Ada Lovelace from the stored row.",
    ],
  ),
  f(
    "A detached change does not update the row",
    "comparator",
    "A detached record holder beside an independent durable drawer.",
    "The detached object and committed row can disagree.",
    [
      "Detached object|The object contains Augusta Ada.",
      "Database|The committed row still contains Ada Lovelace.",
      "Flush|A flush does not generate an UPDATE for changes to this detached object.",
    ],
  ),
]);
add("java-spring/observability", [
  f(
    "Most of this request waits before SQL",
    "scope",
    "A calibrated trace recorder with separate acquisition and execution lanes.",
    "This is invented teaching data: a 1200 ms request, with 900 ms spent acquiring a connection.",
    [
      "Parent span|POST /orders lasts 1200 ms from 0 to 1200.",
      "Acquire|Connection acquisition starts at 20 ms and lasts 900 ms, ending at 920 ms.",
      "SQL and inventory|SQL runs from 920 to 960 ms, taking 40 ms. Inventory HTTP runs from 960 to 1100 ms, taking 140 ms.",
      "Uncovered time|The child spans total 1080 ms. The other 120 ms are outside these children: 20 ms before acquisition and 100 ms after inventory.",
    ],
  ),
]);
add("java-spring/proxies", [
  f(
    "Cross the proxy to enter transaction advice",
    "gate",
    "An advice latch before the target execution fixture.",
    "The proxy interceptor begins a transaction before invoking the target.",
    [
      "Caller|An external caller invokes the proxied operation.",
      "Proxy|The proxy finds transaction metadata and the transaction manager begins a transaction.",
      "Target|The target method runs with that transaction active.",
    ],
  ),
  f(
    "A self-call does not cross the proxy",
    "gate",
    "An internal return track that stays inside the target fixture.",
    "Proxy-based transaction advice does not intercept this direct call on this.",
    [
      "Inside target|throughThis() executes on the target.",
      "Self-call|this.insideTransaction() calls the target directly without going through the proxy.",
      "Consequence|This inner call does not begin a transaction through that interceptor. An already-existing outer transaction is a separate question.",
    ],
  ),
]);
add("java-spring/running-services", [
  f(
    "Readiness is a routing decision",
    "carousel",
    "A startup indexing fixture with a separate traffic latch.",
    "Withdraw routing before draining, and keep shutdown within the platform deadline.",
    [
      "Configure and start|Load and validate external settings. Start the context, migrations, and runners while readiness waits.",
      "Admit traffic|When ready, a correctly configured router observes readiness and admits traffic.",
      "Withdraw|The platform removes routing and accounts for propagation time.",
      "Drain and close|SIGTERM initiates graceful shutdown. Finish accepted work and close resources before the outer deadline.",
    ],
  ),
]);
add("java-spring/spring-boot", [
  f(
    "Auto-configuration backs off for your bean",
    "dispatch",
    "A classpath detector beside an application-bean selector.",
    "The default is conditional; it does not override an application DataSource.",
    [
      "Classpath|The simplified example first checks whether JDBC classes are available.",
      "Application bean|If the application supplies a DataSource, use that bean and back off default creation.",
      "Default branch|Otherwise, creating a default needs suitable driver and connection settings plus the applicable conditions.",
    ],
  ),
]);
add("java-spring/transactions", [
  f(
    "One rollback removes both writes",
    "archive",
    "A single transaction holder containing the order and audit records.",
    "Both writes share T1, so a rollback removes both effects.",
    [
      "Write order|T1 contains the order write.",
      "Write audit|The audit write also belongs to T1.",
      "Rollback|Rolling back T1 leaves neither committed row from these writes.",
    ],
  ),
  f(
    "An independent commit can survive the outer rollback",
    "archive",
    "Two separate transaction holders with an outer suspension latch.",
    "Suspending T1 and committing T2 does not commit the pending order in T1.",
    [
      "Outer T1|The order write is pending in the suspended outer transaction.",
      "Independent T2|The audit write commits in its independent transaction.",
      "Resume T1|T1 resumes afterward. Its later outcome does not undo the already-committed audit in T2.",
    ],
  ),
]);
add("reference/system-design-resources", [
  f(
    "Practice explaining architecture",
    "binder",
    "A study-card dispenser with a review holder.",
    "Use the deck as a prompt to explain decisions, constraints, and failure modes.",
    [
      "Architecture notes|Study cards cue system-design concepts.",
      "Recall|Attempt an explanation before checking the notes.",
      "Review|Use gaps in the explanation to guide the next study session.",
    ],
  ),
  f(
    "Practice solving and explaining",
    "binder",
    "A coding-card dispenser with a working-notes holder.",
    "The cards support practice; the implementation and explanation still need your reasoning.",
    [
      "Coding prompt|Read the practice problem.",
      "Solve|Work through an implementation and its edge cases.",
      "Review|Compare the result with the practice notes and revisit missed reasoning.",
    ],
  ),
]);
add("system-design/appendix", [
  f(
    "Latency spans many orders of magnitude",
    "dial",
    "A logarithmic comparison dial with an operation selector.",
    "These are historical approximate teaching values, not measurements of your hardware.",
    [
      "CPU and caches|Illustrative values: CPU cycle 1 ns, L1 cache 0.5 ns, branch mispredict 5 ns, and L2 cache 7 ns.",
      "Memory|Mutex lock 25 ns and main memory 100 ns are illustrative values from the original reference.",
      "Storage|The original reference gives an SSD read as approximately 150 μs.",
      "Network|A network round trip is illustrated as 150 ms. Hardware, locality, load, and network distance change these values. Source: Jeff Dean’s latency numbers.",
    ],
  ),
  f(
    "Writes prepare data for several read paths",
    "rack",
    "A publishing sorter beside a timeline archive and delivery console.",
    "The architecture has separate fan-out, search, timeline, push, and batch paths.",
    [
      "Write path|The post composer enters the Write API, ingester, and fan-out service.",
      "Indexes and timelines|Search index and Earlybird shards support search; timeline cache and Redis lists support timeline reads.",
      "Read composition|Blender and timeline services compose results for web and mobile clients.",
      "Other delivery|Push compute supports HTTP and mobile push, while Hadoop batch jobs support offline processing.",
    ],
  ),
]);
add("system-design/application-layer", [
  f(
    "Scale separate responsibilities separately",
    "rack",
    "A front-end rack beside a worker rack and a storage cabinet.",
    "Stateless web capacity and business-work capacity can grow independently.",
    [
      "Entry|The request reaches a load balancer.",
      "Web tier|Several web servers handle request-facing work.",
      "Platform tier|Several application workers handle business work.",
      "Database|The data tier has its own replication and scaling constraints.",
    ],
  ),
]);
const asyncParts = [
  "Accept|The API accepts the client’s job and returns 202 Accepted with a job ID. Acceptance is not completion.",
  "Queue|The job waits in a queue. Queue depth and admission policy control back pressure.",
  "Worker|A worker consumes the job and writes the result to storage.",
  "Status|The client later reads job status or the stored result.",
];
add("system-design/asynchronous-processing", [
  f(
    "Acknowledgement comes before completion",
    "dispatch",
    "A submission terminal beside a waiting magazine and worker fixture.",
    "Slow work runs outside the immediate request path.",
    asyncParts,
  ),
  f(
    "Follow a queued job to its stored result",
    "conveyor",
    "A job feeder, work fixture, and completed-record tray.",
    "A 202 response supplies a job ID; it does not assert that the job succeeded.",
    asyncParts,
  ),
]);
add("system-design/availability-and-consistency", [
  f(
    "A partition forces an operational choice",
    "balance",
    "Two replica holders with a disconnected communication bridge.",
    "During a partition, a system cannot guarantee both linearizable consistency and a response to every request.",
    [
      "Partition|Messages between replicas may be lost or delayed.",
      "Consistency choice|Wait for the required coordination or return an error when it cannot complete.",
      "Availability choice|Serve from a reachable replica, accepting that its value may be stale.",
      "Recovery|Reconcile according to the data model when communication returns. CAP is about behavior during the partition.",
    ],
  ),
]);
add("system-design/availability-patterns", [
  f(
    "Standby promotion differs from shared service",
    "dispatch",
    "A traffic selector beside active and reserve worker bays.",
    "Health detection, promotion, and unreplicated writes still need explicit policies.",
    [
      "Active-passive|The router sends traffic to the active node; a standby waits.",
      "Promote|After health failure is established, promote the standby according to the failover rules.",
      "Active-active|Both nodes serve traffic. Remove an unhealthy node from routing.",
      "Data risk|Decide how to handle stale or unreplicated writes; a routing switch does not recover them by itself.",
    ],
  ),
]);
add("system-design/caching", [
  f(
    "A hit avoids downstream work",
    "archive",
    "A fast retrieval drawer beside a worker magazine and durable archive.",
    "The dispatcher can return a cached hit; a miss needs downstream work.",
    [
      "Dispatch|The client sends a request to the dispatcher.",
      "Cache hit|Return the cached value without executing the illustrated worker/database path.",
      "Cache miss|A worker from the pool reads durable storage and produces the result.",
      "Pool|Worker 1, Worker 2, and Worker n illustrate independent work capacity. Cache freshness still needs a policy.",
    ],
  ),
  f(
    "Load on a miss, then populate the cache",
    "archive",
    "A lookup drawer with a transfer carriage to the durable archive.",
    "In cache-aside, the application owns the cache lookup and population.",
    [
      "Lookup|The application checks the cache.",
      "Miss|On a miss, the application loads the value from the database.",
      "Populate|The application stores the loaded value in cache.",
      "Return|Return the result. Cache and database can diverge without an appropriate invalidation strategy.",
    ],
  ),
  f(
    "Acknowledge only after the durable write",
    "press",
    "A coupled write fixture with a downstream commit latch.",
    "The write-through acknowledgement follows database success.",
    [
      "Write cache path|The application sends the write through the cache.",
      "Database|The cache synchronously writes the database.",
      "Acknowledge|Acknowledge the application after database success. Handle failure so the cache does not falsely advertise success.",
    ],
  ),
  f(
    "A fast response leaves durable work pending",
    "dispatch",
    "A write tray feeding a durable queue and later storage press.",
    "Write-behind separates acknowledgement from the later database write.",
    [
      "Write|The application writes through the cache path.",
      "Enqueue|Record pending persistence work in a durable queue according to the design.",
      "Acknowledge|The application can receive success before the database update finishes.",
      "Persist later|An event worker writes the database. Recovery, ordering, and failure policy remain necessary.",
    ],
  ),
  f(
    "Refresh before the cached value expires",
    "dial",
    "A cache drawer beside an expiry dial and refresh carriage.",
    "Refresh-ahead aims to reload before expiry; refresh failure still needs a freshness policy.",
    [
      "Read|The client reads the cached value.",
      "Near expiry|The refresh policy identifies an entry approaching its TTL.",
      "Reload|A refresh worker loads the current value from storage.",
      "Replace|Replace the cache entry before expiry when refresh succeeds.",
    ],
  ),
]);
add("system-design/cdn", [
  f(
    "Keep content closer to its readers",
    "archive",
    "An origin archive beside a nearby edge retrieval drawer.",
    "A hit can return the edge copy. A miss must obtain content from the origin.",
    [
      "Origin|The origin holds source content.",
      "Nearby edge|The user requests content from an edge chosen by the delivery network.",
      "Hit|A usable cached response is served without contacting origin for that response.",
      "Miss|The edge fetches from origin and applies the configured caching policy.",
    ],
  ),
  f(
    "Push prepares the edge; pull waits for demand",
    "dispatch",
    "An upload feeder beside a demand-triggered retrieval drawer.",
    "Both strategies need cache lifetime and invalidation rules.",
    [
      "Push|Upload or distribute content to the edge before a user requests it.",
      "Pull miss|The first uncached request causes the edge to fetch from origin.",
      "Later hit|Subsequent requests can use the stored edge response while it remains usable.",
    ],
  ),
]);
add("system-design/communication-protocols", [
  f(
    "Seven responsibilities, one conceptual stack",
    "cabinet",
    "A seven-drawer network cabinet arranged from the medium upward.",
    "The OSI model is a teaching model; real protocols do not always fit cleanly into one drawer.",
    [
      "1 · Physical|Transmit bits through a medium, such as cable or radio.",
      "2 · Data link|Frame data on a local link. Examples include Ethernet, Wi-Fi, and switches.",
      "3 · Network|Route packets between networks. Examples include IP, ICMP, and routers.",
      "4 · Transport|Provide stream or datagram transport, illustrated by TCP and UDP.",
      "5 · Session|Model establishment, management, and closure of sessions.",
      "6 · Presentation|Model data representation, encryption, and compression. TLS, JSON, and JPEG are illustrative associations, not exact OSI implementations.",
      "7 · Application|Provide application-facing network services such as HTTP, DNS, and SMTP.",
    ],
  ),
  f(
    "TCP repairs loss in an ordered byte stream",
    "tracks",
    "Two transport terminals with a replay holder and acknowledgement carriage.",
    "TCP transports an ordered byte stream. It does not preserve application message boundaries.",
    [
      "Handshake|Client and server exchange SYN, SYN-ACK, and ACK.",
      "Data|Sequence numbers identify byte positions; acknowledgements identify received progress.",
      "Loss|A missing segment prevents complete ordered delivery of the affected bytes.",
      "Retransmit|TCP retransmits under its recovery rules. The example illustrates a timeout, not every loss-recovery mechanism.",
    ],
  ),
  f(
    "UDP sends each datagram independently",
    "tracks",
    "A datagram feeder with independent delivery and drop trays.",
    "UDP supplies no built-in handshake, retransmission, ordering guarantee, or congestion-control loop.",
    [
      "Send|The client sends independent datagrams without a TCP-style handshake.",
      "Deliver or lose|Datagrams 1 and 3 arrive in the example; datagram 2 is lost.",
      "Application policy|The application decides whether and how to recover missing data and control its traffic.",
    ],
  ),
  f(
    "Choose who waits and who can send",
    "dispatch",
    "A pair of messaging terminals with selectable transfer modes.",
    "Polling, SSE, and WebSocket differ in request lifetime and communication direction.",
    [
      "Short polling|The client repeatedly sends requests for new information.",
      "Long polling|A request waits until a reply is available or its timeout is reached, then the client starts another request.",
      "SSE|A server-to-client event stream runs over a long-lived HTTP response.",
      "WebSocket|A connection permits messages in both directions.",
    ],
  ),
  f(
    "A remote call still crosses a fallible network",
    "press",
    "A client encoding press beside a server decoding fixture.",
    "A familiar procedure-call interface does not remove network failures.",
    [
      "Client stub|The client program calls a stub that encodes and sends a request.",
      "Network|The request crosses a network with latency, timeout, and failure possibilities.",
      "Server stub|The server decodes the request and invokes the procedure.",
      "Reply|Encode and return the result through the same abstraction. A timeout can leave effect status unknown.",
    ],
  ),
]);
add("system-design/consistency-patterns", [
  f(
    "When success returns changes what a reader can see",
    "tracks",
    "A primary write fixture beside a replica with a selectable acknowledgement latch.",
    "Consistency depends on the guarantee and the required coordination, not merely having replicas.",
    [
      "Strong example|The illustrated write waits for required synchronous replication acknowledgement before returning success.",
      "Eventual example|Success returns before asynchronous replication completes, creating a stale-data window.",
      "Weak example|The illustrated replication can be dropped; the reader cannot rely on eventual propagation from this mechanism.",
      "Guarantee|Implement and document the actual consistency contract. Synchronous copying alone does not establish every strong-consistency guarantee.",
    ],
  ),
]);
add("system-design/databases", [
  f(
    "Differentiate write authority from read capacity",
    "rack",
    "A primary storage cabinet beside replica and hot-read drawers.",
    "Replicas increase read capacity; they do not remove the write-primary bottleneck.",
    [
      "Web fleet|Stateless web instances serve requests.",
      "Hot reads|A shared cache serves suitable repeated reads.",
      "Write primary|Writes go to the primary.",
      "Read replicas|Replica reads can increase capacity. Replication lag affects what those readers observe.",
    ],
  ),
  f(
    "One primary feeds read replicas",
    "archive",
    "A primary archive with two replica holders.",
    "The primary accepts writes; replicas receive copies and serve appropriate reads.",
    [
      "Primary|The read/write client sends writes to the primary.",
      "Replication|The primary propagates changes to Replica 1 and Replica 2.",
      "Reads|Read-only clients can use replicas under the application’s consistency policy.",
    ],
  ),
  f(
    "Two writers need a conflict policy",
    "comparator",
    "Two writable record fixtures with a bidirectional synchronization selector.",
    "Multi-primary replication requires conflict handling.",
    [
      "Primary A|Client A reads and writes Primary A.",
      "Primary B|Client B reads and writes Primary B.",
      "Replicate|Changes propagate in both directions. Concurrent incompatible writes need a deterministic conflict policy.",
    ],
  ),
  f(
    "Separate databases by business function",
    "cabinet",
    "Three independently keyed archive cabinets.",
    "Federation divides responsibility by function, not by ranges of the same entity key.",
    [
      "Forums|Forum operations route to the forums database.",
      "Users|User operations route to the users database.",
      "Products|Product operations route to the products database. Each illustrated database can have its own primary and replicas.",
    ],
  ),
  f(
    "Route each key to its owning shard",
    "cabinet",
    "Four range-keyed drawers with a routing selector.",
    "Each shard owns one illustrated user-ID range. User 42 belongs to Shard 1.",
    [
      "Shard 0|User IDs 0–24 belong to Shard 0.",
      "Shard 1|User IDs 25–49 belong to Shard 1. The illustrated user_id = 42 routes here.",
      "Shard 2|User IDs 50–74 belong to Shard 2.",
      "Shard 3|User IDs 75–99 belong to Shard 3. These ranges are an example partition rule.",
    ],
  ),
  f(
    "An index narrows the search",
    "archive",
    "A branching catalogue beside a sequential record carriage.",
    "The diagram compares search paths, not a guaranteed fixed number of disk reads.",
    [
      "B-tree|Follow the root and relevant branches to the matching entry. Search height is logarithmic in the number of entries.",
      "Full scan|Inspect rows in sequence from row 1 through row N when no useful access path narrows the work.",
      "Trade-off|Indexes also consume storage and add write-maintenance cost.",
    ],
  ),
  f(
    "One row key holds grouped columns",
    "cabinet",
    "A row-keyed cabinet containing address and website drawers.",
    "Column families group related columns under one row key.",
    [
      "Row key|The example row key is user:42.",
      "Address family|city = San Francisco, state = California, and street = Kearny St.",
      "Website family|subdomain = www, domain = example.com, and protocol = https.",
    ],
  ),
  f(
    "Relationships are stored with the entities",
    "comparator",
    "Three entity holders on a relationship inspection fixture.",
    "Edges have direction and meaning; a relationship name is part of the model.",
    [
      "People|Alice has id 1; Bob has id 2.",
      "Group|The chess group has id 3.",
      "Relationships|The example uses knows between people, member of from a person to the group, and has members from the group to its members.",
    ],
  ),
  f(
    "Tables and documents organize data differently",
    "binder",
    "A tabular record holder beside a nested document binder.",
    "SQL and NoSQL are broad families. Choose from the required data and consistency model.",
    [
      "Relational table|Fixed columns id, name, and status hold rows such as 42/Ada/active, 43/Lin/pending, and 44/Sam/active.",
      'Document|The example document nests id 42, name Ada, and tags ["admin"] in one JSON object.',
      "Constraints and queries|Relational systems support joins and constraints; document systems support nested shapes. Actual capabilities depend on the database.",
    ],
  ),
]);
add("system-design/design-method", [
  f(
    "Move from requirements to measured scale",
    "carousel",
    "A four-stage design review holder.",
    "Scale the components that the requirements and bottlenecks actually justify.",
    [
      "Use cases|Define users, operations, constraints, and expected demand.",
      "High-level design|Identify the main responsibilities and request paths.",
      "Core components|Specify data models, interfaces, correctness, and failure behavior.",
      "Scale|Address measured or justified limits without discarding the earlier correctness requirements.",
    ],
  ),
]);
add("system-design/dns", [
  f(
    "Resolve a name, then reuse its answer",
    "archive",
    "A name catalogue beside a cached-address drawer.",
    "The recursive resolver makes iterative queries when its cache cannot answer.",
    [
      "Client cache|Browser or OS caches may already have a usable answer for www.example.com.",
      "Resolver|On a miss, the client asks a recursive resolver.",
      "Delegations|A root directs the resolver toward the TLD, which directs it to an authoritative server. The authoritative example returns A: 192.0.2.10.",
      "TTL|Cache the answer for its applicable TTL. A lower TTL can reduce stale-cache duration but increase lookup traffic.",
    ],
  ),
]);
add("system-design/latency-and-throughput", [
  f(
    "Queues grow near capacity",
    "dial",
    "A work-capacity instrument with an admission dial and waiting magazine.",
    "Beyond the illustrated knee, added demand mainly increases waiting rather than useful throughput.",
    [
      "Below capacity|The service has spare capacity and little queueing.",
      "Knee|As utilization rises, queueing delays become significant.",
      "Saturation|The maximum sustainable throughput is bounded; more offered load can increase latency and errors.",
      "Measure|The instrument is qualitative. Real capacity and latency curves require workload measurements.",
    ],
  ),
]);
add("system-design/load-balancing", [
  f(
    "Send work only to eligible capacity",
    "dispatch",
    "A traffic selector feeding three independently gated workers.",
    "Routing policy applies among eligible healthy nodes.",
    [
      "Client|The client sends a request to the load balancer.",
      "Health|Node C is unhealthy in the example and receives no traffic.",
      "Policy|The balancer chooses healthy Node A or B according to policy: round robin, least loaded, weighted, random, or a session key.",
      "Response|The illustrated response path returns through the load balancer. Actual network topology can differ.",
    ],
  ),
  f(
    "L4 and L7 inspect different information",
    "dispatch",
    "A transport address selector beside an HTTP-aware routing selector.",
    "The available routing information determines the policy you can apply.",
    [
      "Layer 4|Use transport information such as IP address and port to choose S1 or S2.",
      "Layer 7|Inspect HTTP information such as path and headers to route to an API pool or static-content pool.",
    ],
  ),
]);
add("system-design/performance-and-scalability", [
  f(
    "Added resources must address the bottleneck",
    "dial",
    "A capacity gauge beside an expandable worker holder.",
    "Scaling delays saturation only when the added resources address the actual limiting work.",
    [
      "Increasing load|More concurrent users or request rate consumes capacity.",
      "Unchanged bottleneck|A non-scalable path reaches a bottleneck and latency rises.",
      "Useful scaling|Resources added at the limiting component can increase sustainable capacity.",
      "New saturation|Every design still has limits. This instrument shows a qualitative relationship, not a measured curve.",
    ],
  ),
]);
add("system-design/real-time-backends", [
  f(
    "Resume after the last applied event",
    "carousel",
    "A cursor register beside a retained event magazine.",
    "A snapshot boundary, retained events, and a cursor make connection gaps recoverable.",
    [
      "Open|GET a snapshot at cursor 40 and open the stream.",
      "Apply|Apply events 41 and 42; record cursor 42 as the last applied event.",
      "Gap|The connection drops before event 43 arrives. The service retains 43 while the client still holds cursor 42.",
      "Replay|Reconnect after cursor 42, receive and apply 43, and advance the cursor. Retention and replay-window policy limit recovery.",
    ],
  ),
  f(
    "Instances deliver to their own sockets",
    "dispatch",
    "A broker sorter feeding two local connection consoles.",
    "The broker delivers to instances. Each instance writes to its own connected browsers.",
    [
      "Write|Browser A sends an HTTP write to Instance 1, which validates and commits.",
      "Publish|Publish the board-412 event to the broker. An outbox or CDC path can also append to an optional durable log.",
      "Deliver to instances|The broker delivers to subscribed Instance 1 and Instance 2.",
      "Local sockets|Instance 1 writes to its Browser C socket; Instance 2 writes to its Browser B socket. Each enforces subscription and authorization.",
    ],
  ),
]);
add("system-design/reverse-proxy", [
  f(
    "One public entry mediates internal access",
    "gate",
    "A public entry fixture before a private worker enclosure.",
    "A reverse proxy forwards requests and returns responses under explicit configuration.",
    [
      "Public entry|The internet client reaches the proxy’s public address.",
      "Proxy work|The proxy can terminate TLS, apply access controls, compress, cache, or serve static files as configured.",
      "Internal server|Forward the request to a private web server and return its response.",
    ],
  ),
]);
add("system-design/security-overview", [
  f(
    "Apply controls at their actual boundary",
    "gate",
    "A guarded entry fixture with independent application and data latches.",
    "Defense in depth assigns different jobs to different controls.",
    [
      "Edge and proxy|The edge can provide CDN, WAF, and DDoS controls; a proxy can terminate TLS and enforce configured rate limits.",
      "HTTP boundary|An API gateway or middleware applies authentication, CORS policy, and security headers.",
      "Application|Authorize each action and validate its input.",
      "Database|Use parameterized queries and least-privilege access. None of these layers replaces object-level authorization.",
    ],
  ),
]);
const architecture = (title, object, takeaway, parts) =>
  f(title, "rack", object, takeaway, parts);
add("system-design/walkthroughs/mint", [
  architecture(
    "Separate bank jobs from interactive reads",
    "A service console beside an asynchronous job magazine and financial archive.",
    "Raw transaction logs and structured application state have different storage jobs.",
    [
      "Entry|The client reaches a web server and the accounts, transaction, category, and notification services.",
      "Jobs|A queue separates slow account-extraction jobs from immediate requests.",
      "Storage|SQL stores structured data; object storage holds raw transaction logs.",
      "Notifications|Notification processing communicates job or account outcomes.",
    ],
  ),
  architecture(
    "Protect reads while extraction runs asynchronously",
    "An edge console beside a worker magazine and replicated archive.",
    "Read scaling does not remove the need to coordinate account-extraction work.",
    [
      "Entry|DNS, CDN, and a load balancer precede web servers.",
      "Account work|Accounts, transactions, category, and notification services use asynchronous queue-backed work for slow bank operations.",
      "Reads|A Read API, memory cache, and SQL read replicas serve suitable reads.",
      "Durable data|The SQL write primary and object storage hold structured writes and raw transaction material.",
    ],
  ),
]);
add("system-design/walkthroughs/object-oriented-design", [
  f(
    "A lookup index and an order structure cooperate",
    "archive",
    "An indexed record cabinet beside an ordered-node magazine.",
    "The cache’s dictionary locates nodes; its linked list maintains the intended cache order.",
    [
      "Cache interface|get(query) reads a stored result; set(query, results) writes one.",
      "Lookup|The lookup dictionary identifies the node for a query.",
      "Order|The linked list tracks node order for the cache policy.",
      "Node|Each node stores a query and its results. Keep the two structures consistent when entries move or leave.",
    ],
  ),
]);
add("system-design/walkthroughs/pastebin", [
  architecture(
    "Separate paste metadata from paste bodies",
    "A read/write console beside a metadata cabinet and body archive.",
    "SQL metadata locates a paste; object storage holds its body.",
    [
      "Entry|The client reaches the web server.",
      "Operations|Write, read, and analytics APIs handle their separate request types.",
      "Metadata|SQL holds metadata for fast lookups.",
      "Bodies|Object storage holds paste content; the read path combines content with metadata.",
    ],
  ),
  architecture(
    "Scale reads without mixing storage roles",
    "An edge console beside cache, database, and body-storage holders.",
    "Caches and replicas protect the read path; analytics has its own storage.",
    [
      "Entry|DNS and CDN precede the load balancer and web servers.",
      "APIs|Write, read, and analytics APIs retain separate responsibilities.",
      "Hot reads and writes|Memory cache and SQL read replicas handle suitable reads; SQL writes go to the primary.",
      "Other storage|Object storage holds paste bodies; a warehouse supports analytics.",
    ],
  ),
]);
add("system-design/walkthroughs/query-cache", [
  architecture(
    "A miss joins index results with documents",
    "A query console beside a fast result drawer and document archive.",
    "A cache hit avoids the index/document join.",
    [
      "Query|A client reaches the web server and Query API.",
      "Hit|The API can return a result from memory cache.",
      "Miss|Query the reverse index for IDs and the document service for snippets.",
      "Result|Join the data into a result and apply the cache policy.",
    ],
  ),
  architecture(
    "Distribute cache ownership by key",
    "A routing console beside range-independent cache drawers and an index archive.",
    "Consistent hashing limits key movement when cache membership changes; it does not prevent every miss.",
    [
      "Entry|DNS, CDN, a load balancer, and web servers precede the Query API.",
      "Ownership|A consistent hashing rule routes keys across Cache shards 1, 2, and 3.",
      "Miss path|Cache misses query the reverse-index and document-service clusters.",
      "Membership|When nodes change, only the key ranges reassigned by the hashing rule move.",
    ],
  ),
]);
add("system-design/walkthroughs/sales-rank", [
  architecture(
    "Publish rankings from batch aggregation",
    "A sales-input feeder beside an aggregation fixture and rank archive.",
    "The example publishes hourly category rankings from raw sales logs.",
    [
      "Entry|The client reaches the web server, Sales API, and Read API.",
      "Sales records|Persist structured sales data in SQL and raw logs in object storage.",
      "Aggregation|The sales-rank service processes raw logs in batch.",
      "Ranking reads|Read the published category rankings through the read path.",
    ],
  ),
  architecture(
    "Cache published rankings for read demand",
    "An edge console beside a batch fixture and cached rank drawer.",
    "Batch aggregation and interactive ranking reads have different capacity needs.",
    [
      "Entry|DNS, CDN, a load balancer, and web servers precede the APIs.",
      "Write path|The Sales API writes through the SQL primary and raw-log storage path.",
      "Batch path|Sales-rank jobs aggregate object-storage logs into an hourly rank table.",
      "Read path|The Read API uses memory cache and appropriate SQL replicas to serve published results.",
    ],
  ),
]);
add("system-design/walkthroughs/scaling-on-aws", [
  architecture(
    "Start with distinct application and storage roles",
    "A small service console beside relational and object archives.",
    "The initial design keeps few deployed components while retaining distinct responsibilities.",
    [
      "Client and routing|The client resolves DNS and can obtain configured static content from the CDN.",
      "Application|One web-server instance handles application traffic.",
      "Relational data|The instance reads and writes a SQL database.",
      "Content|Object storage holds stored content. A single application instance remains a capacity and availability limit.",
    ],
  ),
  architecture(
    "Add capacity at the measured bottleneck",
    "An expandable service rack beside a job magazine and replicated archive.",
    "Each scaling stage should address an observed or justified constraint.",
    [
      "Edge and fleet|DNS, CDN, a load balancer, web servers, and autoscaling address delivery and web concurrency.",
      "Background work|A queue and worker service absorb appropriate slow or bursty work.",
      "Hot reads|Read/write APIs and memory cache reduce repeated database work.",
      "Data capacity|A SQL primary, replicas, NoSQL, and object storage support their respective data access patterns.",
    ],
  ),
]);
add("system-design/walkthroughs/social-feed", [
  architecture(
    "Prepare timelines on the write path",
    "A publishing sorter beside timeline and user-graph archives.",
    "Reads combine timeline IDs with tweet and user data; writes prepare fan-out.",
    [
      "Entry|The client reaches a web server and read, write, and search APIs.",
      "Write fan-out|Tweet info, fan-out, and user-graph services populate timelines.",
      "Read composition|Timeline reads join cached IDs with tweet and user information.",
      "Storage and search|Memory cache, SQL, object storage, and search support their respective data paths.",
    ],
  ),
  architecture(
    "Choose fan-out work by audience size",
    "An expanded publishing sorter beside timeline and search cabinets.",
    "The example can merge celebrity posts on read to avoid excessive write fan-out.",
    [
      "Entry|DNS, CDN, a load balancer, and web servers precede read, write, and search APIs.",
      "Timelines|Timeline, fan-out, and user-graph services prepare appropriate cached feed data.",
      "Search and notification|A search cluster and notification queue support independent demand.",
      "Read storage|Memory cache, SQL replicas, and object storage supply feed data. Celebrity accounts can use a read-time merge policy.",
    ],
  ),
]);
add("system-design/walkthroughs/social-graph", [
  architecture(
    "Traverse across the owning graph shards",
    "A traversal carriage beside a shard-location catalogue.",
    "The graph service performs breadth-first search; lookup finds the shard that owns an ID.",
    [
      "Entry|The client reaches a web server and Search API.",
      "Traversal|The user-graph service explores graph neighbors with breadth-first search.",
      "Lookup|A lookup service routes person IDs to their graph shard.",
      "Person servers|Person servers A, B, and C hold the illustrated shards.",
    ],
  ),
  architecture(
    "Reduce cross-shard traversal work",
    "A traversal console beside cached lookups and shard cabinets.",
    "Caching and batching reduce machine-to-machine calls during graph traversal.",
    [
      "Entry|DNS, a load balancer, and web servers precede the Query API.",
      "Graph service|The user-graph service performs the traversal.",
      "Lookup and cache|The lookup service routes IDs; memory cache supplies suitable hot results.",
      "Batched shards|Person servers A, B, and C serve batched shard requests under the graph’s ownership rule.",
    ],
  ),
]);
add("system-design/walkthroughs/web-crawler", [
  architecture(
    "Queue fetches, then build searchable records",
    "A crawl-job feeder beside document and reverse-index archives.",
    "Crawl scheduling, document storage, and search indexing have separate jobs.",
    [
      "Query entry|The client reaches the web server and Query API.",
      "Crawl queue|The crawl queue schedules work for the crawler service.",
      "Documents|The document service and NoSQL store retain fetched content or metadata.",
      "Index|The reverse index maps search terms to documents for the query path.",
    ],
  ),
  architecture(
    "Absorb crawl bursts without blocking queries",
    "An expanded crawl feeder beside cached queries and index cabinets.",
    "Queues absorb crawl bursts; shards handle document and index volume.",
    [
      "Entry|DNS, a load balancer, and web servers precede the Query API.",
      "Crawl work|Crawl queues feed the crawler service independently of query demand.",
      "Index and documents|Reverse-index and document services use NoSQL storage for their data paths.",
      "Hot queries|Memory cache serves suitable repeated queries while underlying volume scales through the data services.",
    ],
  ),
]);
// Several steps can inspect the same real part. Keep a cache lookup and
// cache population on the cache fixture, not on an unrelated storage cabinet.
specs.get("system-design--caching-1").kind = "rack";
for (const [id, focus] of [
  ["system-design--caching-2", [0, 2, 0, 1]],
  ["system-design--caching-3", [1, 2, 0]],
  ["system-design--caching-4", [0, 1, 0, 2]],
  ["system-design--caching-5", [1, 0, 2, 1]],
  ["agentic-ai--context-and-memory-1", [0, 1, 1, 2]],
  ["agentic-ai--rag-1", [0, 0, 1, 2]],
])
  specs.get(id).focus = focus;
specs.get("agentic-ai--rag-1").kind = "binder";
specs.get("java-spring--async-jobs-2").kind = "bounded-pool";
specs.get("java-spring--observability-1").bands = [
  [[0, 1200]],
  [[20, 900]],
  [
    [920, 40],
    [960, 140],
  ],
  [
    [0, 20],
    [1100, 100],
  ],
];
export function anatomySpec(id) {
  const spec = specs.get(id);
  if (!spec) throw new Error(`Missing authored Anatomy explanation: ${id}`);
  return spec;
}
export const anatomySpecs = specs;
