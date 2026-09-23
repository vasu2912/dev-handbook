import re
import os

diagrams = {
    "src/content/docs/backend/concurrency/concurrency-and-parallelism.md": """
<svg viewBox="0 0 700 200" style="max-width:100%;height:auto;font-family:'Inter',system-ui,sans-serif; margin: 1.5rem 0;" role="img" aria-label="Timeline showing concurrent vs parallel execution">
  <rect width="700" height="200" fill="var(--diagram-bg)" rx="8" stroke="var(--diagram-border)"/>
  <text x="20" y="30" fill="var(--diagram-ink)" font-weight="bold" font-size="14">Concurrent (1 Core)</text>
  <rect x="150" y="20" width="40" height="20" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)"/>
  <text x="170" y="34" fill="var(--diagram-accent-fill)" font-size="12" text-anchor="middle">T1</text>
  <rect x="190" y="26" width="60" height="8" fill="var(--diagram-muted)" stroke="none" rx="4"/>
  <text x="220" y="18" fill="var(--diagram-muted)" font-size="10" text-anchor="middle">I/O</text>
  <rect x="250" y="20" width="40" height="20" fill="var(--diagram-green-bg)" stroke="var(--diagram-green)"/>
  <text x="270" y="34" fill="var(--diagram-green)" font-size="12" text-anchor="middle">T2</text>
  <rect x="290" y="20" width="40" height="20" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)"/>
  <text x="310" y="34" fill="var(--diagram-accent-fill)" font-size="12" text-anchor="middle">T1</text>
  <line x1="20" y1="60" x2="680" y2="60" stroke="var(--diagram-border)" stroke-dasharray="4"/>
  <text x="20" y="90" fill="var(--diagram-ink)" font-weight="bold" font-size="14">Parallel (2 Cores)</text>
  <text x="20" y="125" fill="var(--diagram-muted)" font-size="12">Core 1</text>
  <rect x="100" y="110" width="100" height="20" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)"/>
  <text x="150" y="124" fill="var(--diagram-accent-fill)" font-size="12" text-anchor="middle">T1</text>
  <text x="20" y="165" fill="var(--diagram-muted)" font-size="12">Core 2</text>
  <rect x="100" y="150" width="100" height="20" fill="var(--diagram-green-bg)" stroke="var(--diagram-green)"/>
  <text x="150" y="164" fill="var(--diagram-green)" font-size="12" text-anchor="middle">T2</text>
  <rect x="200" y="116" width="100" height="8" fill="var(--diagram-muted)" rx="4"/>
  <text x="250" y="108" fill="var(--diagram-muted)" font-size="10" text-anchor="middle">I/O</text>
  <line x1="100" y1="190" x2="680" y2="190" stroke="var(--diagram-ink)" marker-end="url(#arrow)"/>
  <text x="660" y="180" fill="var(--diagram-ink)" font-size="12" text-anchor="end">Time</text>
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--diagram-ink)" />
    </marker>
  </defs>
</svg>
""",

    "src/content/docs/backend/concurrency/threads.md": """
```mermaid
flowchart LR
    Q[Task Queue] -->|pull| T1(Worker Thread 1)
    Q -->|pull| T2(Worker Thread 2)
    Q -->|pull| T3(Worker Thread 3)
    
    subgraph Process
        subgraph Thread Pool
            T1
            T2
            T3
        end
        M[(Shared Memory)]
        T1 <--> M
        T2 <--> M
        T3 <--> M
    end
```
""",

    "src/content/docs/backend/concurrency/event-loop.md": """
<svg viewBox="0 0 500 400" style="max-width:100%;height:auto;font-family:'Inter',system-ui,sans-serif; margin: 1.5rem auto; display: block;" role="img" aria-label="Event Loop Cycle">
  <rect width="500" height="400" fill="var(--diagram-bg)" rx="8" stroke="var(--diagram-border)"/>
  <g transform="translate(190, 40)">
    <rect width="120" height="40" rx="4" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)"/>
    <text x="60" y="24" fill="var(--diagram-accent-fill)" font-size="14" text-anchor="middle">1. Poll I/O</text>
  </g>
  <path d="M 250 80 L 250 120" fill="none" stroke="var(--diagram-ink)" stroke-width="2" marker-end="url(#arrow)"/>
  <g transform="translate(190, 120)">
    <rect width="120" height="40" rx="4" fill="var(--diagram-green-bg)" stroke="var(--diagram-green)"/>
    <text x="60" y="24" fill="var(--diagram-green)" font-size="14" text-anchor="middle">2. Check Callbacks</text>
  </g>
  <path d="M 250 160 L 250 200" fill="none" stroke="var(--diagram-ink)" stroke-width="2" marker-end="url(#arrow)"/>
  <g transform="translate(190, 200)">
    <rect width="120" height="40" rx="4" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)"/>
    <text x="60" y="24" fill="var(--diagram-accent-fill)" font-size="14" text-anchor="middle">3. Run Callback</text>
  </g>
  <path d="M 190 220 Q 90 220 90 260" fill="none" stroke="var(--diagram-ink)" stroke-width="2" marker-end="url(#arrow)"/>
  <g transform="translate(30, 260)">
    <rect width="120" height="40" rx="4" fill="var(--diagram-red-bg)" stroke="var(--diagram-red)"/>
    <text x="60" y="24" fill="var(--diagram-red)" font-size="14" text-anchor="middle">4. Start I/O</text>
  </g>
  <path d="M 90 300 Q 90 340 190 340" fill="none" stroke="var(--diagram-ink)" stroke-width="2" marker-end="url(#arrow)"/>
  <g transform="translate(190, 320)">
    <rect width="130" height="40" rx="4" fill="var(--diagram-yellow-bg)" stroke="var(--diagram-ink)"/>
    <text x="65" y="24" fill="var(--diagram-ink)" font-size="14" text-anchor="middle">5. Register Callback</text>
  </g>
  <path d="M 320 340 Q 420 340 420 220 T 310 60" fill="none" stroke="var(--diagram-ink)" stroke-width="2" marker-end="url(#arrow)"/>
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--diagram-ink)" />
    </marker>
  </defs>
</svg>
""",

    "src/content/docs/backend/concurrency/goroutines.md": """
```mermaid
flowchart TD
    subgraph Go Runtime
        S[Go Scheduler]
    end
    
    subgraph Goroutines
        G1((G1))
        G2((G2))
        G3((G3))
        G4((G4))
        
        G1 <-->|Channel| G2
    end
    
    subgraph OS Threads
        T1[Thread 1]
        T2[Thread 2]
    end
    
    G1 -.-> S
    G2 -.-> S
    G3 -.-> S
    G4 -.-> S
    
    S --> T1
    S --> T2
```
""",

    "src/content/docs/backend/concurrency/race-conditions.md": """
<svg viewBox="0 0 600 300" style="max-width:100%;height:auto;font-family:'Inter',system-ui,sans-serif; margin: 1.5rem 0;" role="img" aria-label="Race Condition Diagram">
  <rect width="600" height="300" fill="var(--diagram-bg)" rx="8" stroke="var(--diagram-border)"/>
  <text x="50" y="30" fill="var(--diagram-accent-fill)" font-weight="bold">Thread A</text>
  <text x="450" y="30" fill="var(--diagram-green)" font-weight="bold">Thread B</text>
  <rect x="250" y="20" width="100" height="40" rx="4" fill="var(--diagram-muted)" stroke="var(--diagram-border)"/>
  <text x="300" y="45" fill="var(--diagram-ink)" font-size="14" text-anchor="middle">Counter: 0</text>
  <g transform="translate(50, 80)">
    <rect width="120" height="30" fill="var(--diagram-accent-bg)" rx="4"/>
    <text x="60" y="20" fill="var(--diagram-accent-fill)" font-size="12" text-anchor="middle">Read Counter (0)</text>
  </g>
  <g transform="translate(430, 120)">
    <rect width="120" height="30" fill="var(--diagram-green-bg)" rx="4"/>
    <text x="60" y="20" fill="var(--diagram-green)" font-size="12" text-anchor="middle">Read Counter (0)</text>
  </g>
  <g transform="translate(50, 160)">
    <rect width="120" height="30" fill="var(--diagram-accent-bg)" rx="4"/>
    <text x="60" y="20" fill="var(--diagram-accent-fill)" font-size="12" text-anchor="middle">Increment (0+1=1)</text>
  </g>
  <g transform="translate(430, 200)">
    <rect width="120" height="30" fill="var(--diagram-green-bg)" rx="4"/>
    <text x="60" y="20" fill="var(--diagram-green)" font-size="12" text-anchor="middle">Increment (0+1=1)</text>
  </g>
  <g transform="translate(50, 240)">
    <rect width="120" height="30" fill="var(--diagram-red-bg)" rx="4"/>
    <text x="60" y="20" fill="var(--diagram-red)" font-size="12" text-anchor="middle">Write 1</text>
  </g>
  <g transform="translate(430, 240)">
    <rect width="120" height="30" fill="var(--diagram-red-bg)" rx="4"/>
    <text x="60" y="20" fill="var(--diagram-red)" font-size="12" text-anchor="middle">Write 1</text>
  </g>
  <path d="M 250 40 L 110 80" fill="none" stroke="var(--diagram-ink)" stroke-dasharray="4" marker-end="url(#arrow)"/>
  <path d="M 350 40 L 490 120" fill="none" stroke="var(--diagram-ink)" stroke-dasharray="4" marker-end="url(#arrow)"/>
  <path d="M 110 240 L 290 60" fill="none" stroke="var(--diagram-red)" marker-end="url(#arrow)"/>
  <path d="M 490 240 L 310 60" fill="none" stroke="var(--diagram-red)" marker-end="url(#arrow)"/>
</svg>
""",

    "src/content/docs/guides/request-lifecycle.md": """
```mermaid
sequenceDiagram
    participant B as Browser
    participant D as DNS
    participant E as Edge/LB
    participant A as Application
    participant DB as Database
    
    B->>D: 1. Resolve domain
    D-->>B: 2. Return IP address
    B->>E: 3. HTTP Request
    E->>A: 4. Route Request
    A->>DB: 5. Query Data
    DB-->>A: 6. Return Data
    A-->>E: 7. HTTP Response
    E-->>B: 8. Deliver Response
```
""",

    "src/content/docs/backend/api-design/rest.md": """
```mermaid
flowchart LR
    A[/users] --> B[/users/{id}]
    B --> C[/users/{id}/orders]
    C --> D[/users/{id}/orders/{id}]
```
""",

    "src/content/docs/backend/api-design/url-design.md": """
<svg viewBox="0 0 750 150" style="max-width:100%;height:auto;font-family:'Inter',system-ui,sans-serif; margin: 1.5rem 0;" role="img" aria-label="URL Structure Breakdown">
  <rect width="750" height="150" fill="var(--diagram-bg)" rx="8" stroke="var(--diagram-border)"/>
  <text x="375" y="60" font-size="18" font-family="monospace" text-anchor="middle">
    <tspan fill="var(--diagram-red)">https</tspan><tspan fill="var(--diagram-ink)">://</tspan><tspan fill="var(--diagram-green)">api.example.com</tspan><tspan fill="var(--diagram-ink)">/</tspan><tspan fill="var(--diagram-accent-fill)">users/123/orders</tspan><tspan fill="var(--diagram-ink)">?</tspan><tspan fill="var(--diagram-yellow)">filter=value&amp;sort=field</tspan>
  </text>
  <line x1="120" y1="70" x2="120" y2="100" stroke="var(--diagram-red)"/>
  <text x="120" y="120" fill="var(--diagram-red)" font-size="14" text-anchor="middle">Scheme</text>
  <line x1="250" y1="70" x2="250" y2="100" stroke="var(--diagram-green)"/>
  <text x="250" y="120" fill="var(--diagram-green)" font-size="14" text-anchor="middle">Host</text>
  <line x1="430" y1="70" x2="430" y2="100" stroke="var(--diagram-accent-fill)"/>
  <text x="430" y="120" fill="var(--diagram-accent-fill)" font-size="14" text-anchor="middle">Path (collection/item/sub-collection)</text>
  <line x1="620" y1="70" x2="620" y2="100" stroke="var(--diagram-yellow)"/>
  <text x="620" y="120" fill="var(--diagram-yellow)" font-size="14" text-anchor="middle">Query</text>
</svg>
""",

    "src/content/docs/backend/http-and-apis.md": """
```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    
    C->>S: GET /api/users HTTP/1.1<br/>Host: example.com<br/>Accept: application/json
    activate S
    S-->>C: HTTP/1.1 200 OK<br/>Content-Type: application/json<br/><br/>{"users": [...]}
    deactivate S
```
""",

    "src/content/docs/backend/architecture/handlers-and-controllers.md": """
```mermaid
flowchart TD
    Req[HTTP Request] --> RM{Route Match}
    RM -->|Match found| H[Handler]
    RM -->|No match| 404[404 Not Found]
    
    subgraph H [Handler Responsibilities]
        direction TB
        V[Validate Input]
        CS[Call Service]
        FR[Format Response]
        V --> CS --> FR
    end
    
    H --> Res[HTTP Response]
```
"""
}

for filepath, diag in diagrams.items():
    if not os.path.exists(filepath):
        print(f"Missing: {filepath}")
        continue
        
    with open(filepath, "r") as f:
        content = f.read()
        
    # Find the position of the first `## ` that comes after the frontmatter
    # The frontmatter ends with `---` at the beginning of a line.
    
    parts = content.split("---", 2)
    if len(parts) >= 3:
        frontmatter = parts[0] + "---" + parts[1] + "---"
        body = parts[2]
        
        # find first '## ' in body
        idx = body.find("\n## ")
        if idx != -1:
            new_body = body[:idx] + "\n\n" + diag.strip() + "\n\n" + body[idx:]
            new_content = frontmatter + new_body
            with open(filepath, "w") as f:
                f.write(new_content)
            print(f"Injected into {filepath}")
        else:
            print(f"No ## found in {filepath}, appending.")
            with open(filepath, "a") as f:
                f.write("\n\n" + diag.strip() + "\n")
    else:
        print(f"Skipping {filepath}, no frontmatter found")

print("Diagram injection done")
