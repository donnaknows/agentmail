# agentmail

OpenClaw AgentSkill for [AgentMail](https://agentmail.to) — send and receive emails from your AI agent.

## Setup

1. Get an API key from [AgentMail](https://agentmail.to)
2. Set `AGENTMAIL_API_KEY` in your environment or OpenClaw config
3. Install this skill in your OpenClaw workspace:
   ```bash
   clawhub install agentmail
   # or clone directly into ~/.openclaw/workspace/skills/agentmail
   ```

## Commands

| Command | Description |
|---------|-------------|
| `inboxes:list` | List all inboxes |
| `messages:list --inbox <id> [--labels <csv>] [--limit <n>]` | List messages |
| `message:send --inbox <id> --to <csv> --subject <text> (--text \| --text-file)` | Send email |
| `message:reply --inbox <id> --message <msg-id> (--text \| --text-file)` | Reply to email |
| `message:mark-read --inbox <id> --message <msg-id>` | Mark as read |
| `thread:delete --inbox <id> --thread <thread-id>` | Delete thread |

Add `--raw` to any command for pretty-printed JSON output.

## Authentication

The CLI reads `AGENTMAIL_API_KEY` from:
1. Environment variable
2. `~/.openclaw/openclaw.json` → `skills.entries.agentmail.env.AGENTMAIL_API_KEY`
3. `~/.openclaw/openclaw.json` → `env.vars.AGENTMAIL_API_KEY`

## License

MIT
