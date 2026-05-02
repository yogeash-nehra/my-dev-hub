# Yogi Dev Hub

Personal multi-agent workspace for dev, automation, and business operations.
Built to demonstrate best-in-class Claude usage patterns.

---

## Domain Map

| Domain | Path | Purpose |
|--------|------|---------|
| Dev | `dev/` | Code review, debugging, scaffolding, refactoring |
| Ops | `ops/` | Emails, proposals, invoices, reports |
| Personal | `personal/` | Research, daily planning, content, summaries |

Each domain has its own `CLAUDE.md` with local context and a `prompts/` folder of ready-to-use templates.

---

## Agent Roster

Spawn specialized workers by referencing their system prompts in `agents/`.

### Dev Agent
Handles code work: review, debug, refactor, scaffold, test-gen.
```
Read agents/dev-agent.md, then act as that agent for this task: {{TASK}}
```

### Research Agent
Handles information work: web research, tech evaluation, summaries.
```
Read agents/research-agent.md, then act as that agent for this task: {{TASK}}
```

### Ops Agent
Handles business writing: emails, proposals, invoices, meeting notes.
```
Read agents/ops-agent.md, then act as that agent for this task: {{TASK}}
```

### AI News Agent
Finds and filters developer-relevant AI news, releases, and research. Zero fluff.
```
Read agents/ai-news-agent.md, then act as that agent for this task: {{TASK}}
```

### Spawning via Agent Tool (in code / orchestration)
```python
# Parallel agents — run in a single message with multiple Agent calls
Agent(subagent_type="Explore",   description="Audit codebase",  prompt="...")
Agent(subagent_type="general-purpose", description="Draft proposal", prompt="...")

# Sequential — when output of first feeds second
result = Agent(description="Research competitor", prompt="...")
Agent(description="Draft comparison doc", prompt=f"Using this research: {result} ...")
```

**Rule:** Parallel when independent. Sequential when one output feeds the next.

---

## Workflow Index

| Workflow | File | Trigger |
|----------|------|---------|
| Daily Brief | `workflows/daily-brief.md` | Each morning |
| Code Review | `workflows/code-review.md` | Before merging a branch |
| Weekly Digest | `workflows/weekly-digest.md` | Every Monday |
| New Project | `workflows/new-project.md` | Starting something new |
| Client Proposal | `workflows/client-proposal.md` | New client or engagement |
| AI News Digest | `workflows/ai-news-digest.md` | Daily/weekly AI news scan or deep research on a topic |

Run a workflow: `Read workflows/<name>.md, then follow the steps.`

---

## Skills Reference

| Skill | Invoke | When to Use |
|-------|--------|-------------|
| `/review` | `/review` | Review current branch PR |
| `/simplify` | `/simplify` | Refactor recently changed code |
| `/security-review` | `/security-review` | Before shipping auth/payment changes |
| `/schedule` | `/schedule` | Set up recurring agent routines |
| `/claude-api` | `/claude-api` | Build or debug Anthropic SDK code |
| `/init` | `/init` | Bootstrap CLAUDE.md for a new sub-project |
| `/update-config` | `/update-config` | Modify hooks, permissions, settings.json |

---

## Memory System

Project memory lives at: `C:/Users/yogeash.nehra/.claude/projects/C--Dev-Yogi/memory/`

### What to save
- User preferences and working style (type: `user`)
- Feedback on approach — corrections AND confirmations (type: `feedback`)
- Active project context: goals, deadlines, decisions (type: `project`)
- External resource pointers: dashboards, trackers, channels (type: `reference`)

### What NOT to save
Code patterns, git history, file paths, debugging solutions — those live in the code.

### How to read memory at session start
```
Read C:/Users/yogeash.nehra/.claude/projects/C--Dev-Yogi/memory/MEMORY.md
then read any relevant linked files before starting work.
```

### How to write a memory
```
Write a new file to the memory directory with frontmatter:
---
name: <descriptive name>
type: user | feedback | project | reference
description: one-line hook for the MEMORY.md index
---
Then add a pointer line to MEMORY.md.
```

---

## Claude Best Practices (in this hub)

### Prompt Caching
When making repeated API calls with large system prompts, put stable context at the top
(system prompt, docs, examples) and variable user input at the bottom.
Cache breaks after 5 minutes of inactivity — batch related work.

### Extended Thinking
Use for: architecture decisions, complex debugging, evaluating trade-offs.
Avoid for: simple tasks, quick lookups, formatting work.
Invoke via claude-api skill or pass `thinking: {type: "enabled", budget_tokens: 10000}`.

### Tool Use Best Practices
- Always read before editing (use Read, then Edit — never blind Write)
- Prefer Glob/Grep over Bash for file search
- Cite `file:line` when referencing code
- Run tests after code changes before reporting complete

### Multi-Agent Patterns
- **Orchestrator–Worker**: This hub is the orchestrator; domain agents are workers
- **Parallel**: Independent tasks (research + draft) spawn in a single message
- **Sequential**: Dependent tasks (research → draft using research) run one after another
- **Isolation**: Each agent gets only the context it needs — no noise

---

## Hooks (Automated Behaviors)

Configured in `.claude/settings.json`:

- **PostToolUse(Bash)**: Every shell command is appended to `.claude/audit.log`
- **Stop**: End-of-session reminder to update memory files

---

## Quick-Start Commands

```bash
# Start a dev session in context
cd C:\Dev\Yogi\dev && claude

# Start an ops session
cd C:\Dev\Yogi\ops && claude

# Run the daily brief workflow
# Open claude in hub root, then:
# > Read workflows/daily-brief.md, then follow the steps.

# Scaffold a new project
# > Read workflows/new-project.md, then follow the steps for project: {{NAME}}
```
