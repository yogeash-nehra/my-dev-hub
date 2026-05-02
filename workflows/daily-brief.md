# Workflow: Daily Brief

A morning summary that orients you for the day ahead.

## Trigger
Run each morning before starting work. Takes ~2 minutes.

## Inputs
Before running, have ready:
- `{{TODAY_DATE}}` — today's date (e.g., 2026-05-01)
- `{{OPEN_TASKS}}` — paste any open task list, Notion board, or bullet list
- `{{KEY_MESSAGES}}` — paste any emails/Slack threads that need attention (optional)
- `{{FOCUS_GOAL}}` — one thing you want to accomplish today

## Steps

### Step 1: Load context (sequential, do first)
```
Read C:/Users/yogeash.nehra/.claude/projects/C--Dev-Yogi/memory/MEMORY.md
Read any project memory files relevant to active work.
```

### Step 2: Parallel analysis (run both at once)
**Agent A — Task triage:**
```
Read agents/ops-agent.md, then act as that agent.
Given these open tasks: {{OPEN_TASKS}}
Today is {{TODAY_DATE}}. My focus goal is: {{FOCUS_GOAL}}

Output:
1. Top 3 priority tasks for today with a one-line reason each
2. Tasks to defer (and why)
3. Any blockers to surface
Keep it to one tight page.
```

**Agent B — Message triage (if messages provided):**
```
Read agents/ops-agent.md, then act as that agent.
Given these messages: {{KEY_MESSAGES}}
Output:
1. Messages requiring a response today — with a suggested reply for each
2. Messages to read but not act on
3. Messages to ignore
```

### Step 3: Synthesize (sequential, after both agents complete)
```
Combine the task triage and message triage into a single daily brief.
Format:
## Today — {{TODAY_DATE}}
**Focus:** {{FOCUS_GOAL}}

### Top 3 Priorities
1. ...
2. ...
3. ...

### Inbox Actions
- [Name] — [suggested reply or action]

### Deferred
- ...
```

## Outputs
A formatted daily brief in the conversation. Optionally save to `personal/briefs/{{TODAY_DATE}}.md`.

## Example Invocation
```
Read workflows/daily-brief.md, then run the daily brief for today (2026-05-01).
Open tasks: [paste list]
Focus goal: Ship the auth refactor PR
```
