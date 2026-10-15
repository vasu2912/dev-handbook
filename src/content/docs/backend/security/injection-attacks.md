---
title: Injection attacks
description: How SQL, NoSQL, and command injection turn untrusted data into executable instructions.
sidebar:
  order: 2
---

> The oldest and still most common vulnerability class. All injection attacks share one root cause.

## The root cause

Your backend speaks many languages: SQL, HTML/CSS/JS, shell. Each language has special characters that separate **code** from **data**.

<div data-anatomy="backend--security--injection-attacks-1"></div>

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

<div data-anatomy="backend--security--injection-attacks-2"></div>

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

<div data-anatomy="backend--security--injection-attacks-3"></div>

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

<div data-anatomy="backend--security--injection-attacks-4"></div>

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

