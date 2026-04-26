---
name: agentmail
description: Send and receive emails using AgentMail
requires:
  env:
    - AGENTMAIL_API_KEY
---

# AgentMail Skill

Use the bundled JS CLI for all AgentMail operations:
`scripts/agentmail.js` (relative to skill directory).

## API Base URL

```
https://api.agentmail.to/v0
```

## Authentication

The CLI reads `AGENTMAIL_API_KEY` from env first, then falls back to:
- `~/.openclaw/openclaw.json` → `skills.entries.agentmail.env.AGENTMAIL_API_KEY`
- `~/.openclaw/openclaw.json` → `env.vars.AGENTMAIL_API_KEY`

## Commands

### List inboxes

```bash
./scripts/agentmail.js inboxes:list
```

### List messages in an inbox

```bash
./scripts/agentmail.js \
  messages:list --inbox YOUR_INBOX@agentmail.to --limit 20
```

### List unread messages only

```bash
./scripts/agentmail.js \
  messages:list --inbox YOUR_INBOX@agentmail.to --labels unread --limit 20
```

### Send an email

```bash
./scripts/agentmail.js \
  message:send \
  --inbox YOUR_INBOX@agentmail.to \
  --to recipient@example.com \
  [--cc cc@example.com] \
  [--bcc bcc@example.com] \
  --subject "Hello from OpenClaw" \
  --text-file ./body.txt
```

Multiple recipients can be comma-separated (e.g., `--to a@example.com,b@example.com`).

### Reply to a message

```bash
./scripts/agentmail.js \
  message:reply \
  --inbox YOUR_INBOX@agentmail.to \
  --message '<message-id>' \
  --text-file ./reply.txt
```

Or inline:

```bash
./scripts/agentmail.js \
  message:reply \
  --inbox YOUR_INBOX@agentmail.to \
  --message '<message-id>' \
  --text "Thanks for your email!"
```

### Mark a message as read

AgentMail read/unread is label-based. This command removes `unread` and adds `read`.

```bash
./scripts/agentmail.js \
  message:mark-read \
  --inbox YOUR_INBOX@agentmail.to \
  --message '<message-id>'
```

### Delete a thread

Deletes an entire thread (messages cannot be deleted individually, only the thread they belong to).

```bash
./scripts/agentmail.js \
  thread:delete \
  --inbox YOUR_INBOX@agentmail.to \
  --thread '<thread-id>'
```

To find thread IDs, list messages first — each message has a `thread_id` field.

## Output mode

Add `--raw` to pretty-print full API responses:

```bash
./scripts/agentmail.js \
  messages:list --inbox YOUR_INBOX@agentmail.to --limit 5 --raw
```
