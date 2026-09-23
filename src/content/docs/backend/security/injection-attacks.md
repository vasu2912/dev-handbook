---
title: Injection attacks
description: How SQL, NoSQL, and command injection turn untrusted data into executable instructions.
sidebar:
  order: 2
---

> The oldest and still most common vulnerability class. All injection attacks share one root cause.

## The root cause

Your backend speaks many languages: SQL, HTML/CSS/JS, shell. Each language has special characters that separate **code** from **data**.

<svg role="img" aria-label="How untrusted user input becomes executable code in queries and commands" viewBox="0 0 560 96" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:-apple-system,'Segoe UI',sans-serif">
  <defs>
    <marker id="inj-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="var(--diagram-muted)"/>
    </marker>
  </defs>
  <rect x="2" y="26" width="130" height="50" rx="8" fill="var(--diagram-green-bg)" stroke="var(--diagram-green)" stroke-width="1.5"/>
  <text x="67" y="48" text-anchor="middle" font-size="13" font-weight="600" fill="var(--diagram-green)">Your code</text>
  <text x="67" y="64" text-anchor="middle" font-size="11" fill="var(--diagram-green)">trusted</text>
  <rect x="196" y="26" width="130" height="50" rx="8" fill="var(--diagram-red-bg)" stroke="var(--diagram-red)" stroke-width="1.5"/>
  <text x="261" y="48" text-anchor="middle" font-size="13" font-weight="600" fill="var(--diagram-red-text)">User input</text>
  <text x="261" y="64" text-anchor="middle" font-size="11" fill="var(--diagram-red-text)">untrusted</text>
  <rect x="390" y="26" width="168" height="50" rx="8" fill="var(--diagram-yellow-bg)" stroke="var(--diagram-yellow)" stroke-width="2"/>
  <text x="474" y="48" text-anchor="middle" font-size="13" font-weight="700" fill="var(--diagram-yellow-stroke)">Query / command</text>
  <text x="474" y="64" text-anchor="middle" font-size="11" fill="var(--diagram-yellow-stroke)">data becomes code</text>
  <line x1="132" y1="51" x2="194" y2="51" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#inj-arrow)"/>
  <line x1="326" y1="51" x2="388" y2="51" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#inj-arrow)"/>
</svg>

When you concatenate user input directly into a query or command, you **trust that the input has no special characters**. That trust is the vulnerability.

:::note[The rule]
Injection happens when **data is treated as code**.
:::

## SQL injection

### The setup

A login page sends `email` and `password`. The server builds a query by string concatenation:

```sql
SELECT * FROM users WHERE email = '<user input>'
```

### The happy path

User enters `alice@gmail.com`:

```sql
SELECT * FROM users WHERE email = 'alice@gmail.com'
```

Returns Alice. Correct.

### The attack

Attacker enters: `' OR '1'='1' --`

<svg role="img" aria-label="SQL injection attack breaking query logic with always-true condition" viewBox="0 0 620 250" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:-apple-system,'Segoe UI',sans-serif">
  <defs>
    <marker id="sqli-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="var(--diagram-muted)"/>
    </marker>
  </defs>
  <rect x="6" y="12" width="280" height="52" rx="8" fill="var(--diagram-red-bg)" stroke="var(--diagram-red)" stroke-width="1.5"/>
  <text x="146" y="34" text-anchor="middle" font-size="13" font-weight="600" fill="var(--diagram-red-text)">Attacker input</text>
  <text x="146" y="52" text-anchor="middle" font-size="12" font-family="monospace" fill="var(--diagram-red-text)">' OR '1'='1' --</text>
  <rect x="6" y="96" width="280" height="66" rx="8" fill="var(--diagram-neutral-light)" stroke="var(--diagram-muted)" stroke-width="1.5"/>
  <text x="146" y="118" text-anchor="middle" font-size="12" font-family="monospace" fill="var(--diagram-ink)">SELECT * FROM users</text>
  <text x="146" y="136" text-anchor="middle" font-size="12" font-family="monospace" fill="var(--diagram-ink)">WHERE email = '' OR '1'='1' --'</text>
  <text x="146" y="152" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">the WHERE is always true</text>
  <rect x="334" y="96" width="280" height="66" rx="8" fill="var(--diagram-red-bg)" stroke="var(--diagram-red)" stroke-width="2"/>
  <text x="474" y="118" text-anchor="middle" font-size="13" font-weight="700" fill="var(--diagram-red-text)">Returns ALL rows</text>
  <text x="474" y="136" text-anchor="middle" font-size="11" fill="var(--diagram-red-text)">every user, every column</text>
  <line x1="146" y1="64" x2="146" y2="94" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#sqli-arrow)"/>
  <line x1="286" y1="129" x2="332" y2="129" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#sqli-arrow)"/>
  <text x="20" y="206" font-size="12" fill="var(--diagram-muted)">1. the first ' closes the string</text>
  <text x="20" y="224" font-size="12" fill="var(--diagram-muted)">2. OR '1'='1' is always true</text>
  <text x="20" y="242" font-size="12" fill="var(--diagram-muted)">3. -- comments out the rest</text>
</svg>

What happened:

1. The first `'` closes the string.
2. `OR '1'='1'` is always true.
3. `--` comments out the rest, hiding the stray closing quote.

Result: the attacker gets **every user** without knowing any email.

### Worse: data destruction

The same trick can run a second statement:

```sql
SELECT * FROM users WHERE email = ''; DROP TABLE users; --
```

The `;` ends the first statement. `DROP TABLE users` deletes the whole table.

:::tip[What an attacker can reach]
`UNION` to read other tables (payments), database functions to read files, and in some setups, OS commands through the database.
:::

### The fix: parameterized queries

Separate the **query** from the **data**. Send two things: the statement, and the values.

<svg role="img" aria-label="Parameterized queries separating statement from user data" viewBox="0 0 620 200" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:-apple-system,'Segoe UI',sans-serif">
  <defs>
    <marker id="param-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="var(--diagram-muted)"/>
    </marker>
  </defs>
  <rect x="6" y="14" width="290" height="58" rx="8" fill="var(--diagram-green-bg)" stroke="var(--diagram-green)" stroke-width="1.5"/>
  <text x="151" y="36" text-anchor="middle" font-size="13" font-weight="600" fill="var(--diagram-green)">Statement (no user data)</text>
  <text x="151" y="56" text-anchor="middle" font-size="12" font-family="monospace" fill="var(--diagram-green)">WHERE email = $1</text>
  <rect x="324" y="14" width="290" height="58" rx="8" fill="var(--diagram-red-bg)" stroke="var(--diagram-red)" stroke-width="1.5"/>
  <text x="469" y="36" text-anchor="middle" font-size="13" font-weight="600" fill="var(--diagram-red-text)">Value (data)</text>
  <text x="469" y="56" text-anchor="middle" font-size="12" font-family="monospace" fill="var(--diagram-red-text)">' OR '1'='1' --</text>
  <rect x="165" y="118" width="290" height="66" rx="8" fill="var(--diagram-neutral-light)" stroke="var(--diagram-muted)" stroke-width="1.5"/>
  <text x="310" y="140" text-anchor="middle" font-size="13" font-weight="600" fill="var(--diagram-ink)">Database</text>
  <text x="310" y="158" text-anchor="middle" font-size="12" fill="var(--diagram-muted)">treats $1 as a string, never code</text>
  <text x="310" y="174" text-anchor="middle" font-size="12" font-weight="600" fill="var(--diagram-green)">No rows returned: safe</text>
  <line x1="151" y1="72" x2="270" y2="116" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#param-arrow)"/>
  <line x1="469" y1="72" x2="360" y2="116" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#param-arrow)"/>
</svg>

The database puts the value into the `$1` slot as **pure data**. It is never interpreted as code. The malicious input becomes a garbage string that matches no email.

```python
# Wrong: string concatenation
cursor.execute("SELECT * FROM users WHERE email = '" + email + "'")

# Right: parameterized
cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
```

:::tip[Use it everywhere]
Every database driver and ORM supports parameterized queries and uses them by default. You're only vulnerable if you deliberately build raw strings yourself.
:::
### Second line of defense: least-privilege DB user

Parameterized queries are the real fix. But add a second layer so a slip is still harmless:

:::caution[Restrict the database credentials]
Connect with a user that only has **DML** permissions: `SELECT`, `INSERT`, `UPDATE`, `DELETE`. Do **not** grant **DDL**: `DROP`, `ALTER`, `CREATE`, `TRUNCATE`.

If an injection somehow reaches the database, `DROP TABLE users` still fails: the user has no permission to run it. Modern drivers also block stacked statements by default, but an old driver won't. Layer both: parameterize *and* least-privilege.
:::

## NoSQL injection

You're not safe just because you don't write SQL. MongoDB queries are JSON objects, and objects can contain **operators**:

```json
{ "email": "alice@gmail.com" }          // normal
{ "email": { "$ne": "" } }              // attacker-controlled: matches everything
```

If your app passes raw user JSON into a query, an attacker can inject `$ne` (not equal), `$gt` (greater than), `$exists`, and more. Never pass raw user JSON straight to the database: validate the shape first.

## Command injection

The same confusion, but the target is the **operating system**, not the database.

### The setup

A user uploads an image. Your server calls a CLI tool to resize it:

```bash
ffmpeg -i input.jpg -h 120 -w 220 -o <user filename>
```

### The attack

Attacker passes: `; rm -rf /`

<svg role="img" aria-label="Command injection attack splitting a shell command using a semicolon" viewBox="0 0 620 190" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:-apple-system,'Segoe UI',sans-serif">
  <defs>
    <marker id="cmd-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="var(--diagram-muted)"/>
    </marker>
  </defs>
  <rect x="6" y="12" width="608" height="48" rx="8" fill="var(--diagram-red-bg)" stroke="var(--diagram-red)" stroke-width="1.5"/>
  <text x="310" y="32" text-anchor="middle" font-size="12" font-family="monospace" fill="var(--diagram-red-text)">ffmpeg -i input.jpg -h 120 -w 220 -o ; rm -rf /</text>
  <text x="310" y="50" text-anchor="middle" font-size="11" fill="var(--diagram-red-text)">the ; splits this into two shell commands</text>
  <rect x="6" y="98" width="290" height="58" rx="8" fill="var(--diagram-neutral-light)" stroke="var(--diagram-muted)" stroke-width="1.5"/>
  <text x="151" y="120" text-anchor="middle" font-size="12" font-family="monospace" fill="var(--diagram-ink)">ffmpeg -i input.jpg -o</text>
  <text x="151" y="140" text-anchor="middle" font-size="11" fill="var(--diagram-muted)">(the intended command)</text>
  <rect x="324" y="98" width="290" height="58" rx="8" fill="var(--diagram-red-bg)" stroke="var(--diagram-red)" stroke-width="2"/>
  <text x="469" y="120" text-anchor="middle" font-size="12" font-family="monospace" fill="var(--diagram-red-text)">rm -rf /</text>
  <text x="469" y="140" text-anchor="middle" font-size="11" fill="var(--diagram-red-text)">deletes the file system</text>
  <line x1="151" y1="60" x2="151" y2="96" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#cmd-arrow)"/>
  <line x1="469" y1="60" x2="469" y2="96" stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#cmd-arrow)"/>
</svg>

The `;` ends the first command. `rm -rf /` runs next. Attackers can also use `|` (pipes) or `&` (background) for more creative damage.

### The fix: argument arrays

Separate the command from its arguments. Pass arguments directly to the process, **not through the shell**:

```javascript
// Wrong: shell interprets the input
exec("ffmpeg -i input.jpg -o " + filename)

// Right: arguments go straight to the process
spawn("ffmpeg", ["-i", "input.jpg", "-o", filename])
```

The argument is passed as a plain string; the shell never interprets it.

## Summary: the mental model

| Context | You speak | Fix |
| --- | --- | --- |
| Database | SQL / NoSQL query | Parameterized queries, validate shape |
| Operating system | shell command | Argument arrays |
| Browser | HTML / JS | Sanitize, CSP (see [xss and csrf](/backend/security/xss-and-csrf/)) |

:::caution[Never do this]
Build any string that another system will interpret, using string concatenation or template strings that mix user input with control syntax. Find the parameterized alternative: it almost always exists.
:::

Terms: [GLOSSARY](/reference/system-design-glossary/) · Related: [database](/system-design/databases/) · Next: [authentication](/backend/security/authentication/) · Up: [security mindset](/backend/security/)

