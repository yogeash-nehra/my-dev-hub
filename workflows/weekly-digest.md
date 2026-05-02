# Workflow: Weekly Digest

A Monday morning synthesis of what happened last week and what matters this week.

## Trigger
Every Monday. Run before your first meeting.

## Inputs
- `{{WEEK_RANGE}}` — e.g., "Apr 28 – May 2, 2026"
- `{{COMPLETED_WORK}}` — bullet list of what shipped, closed, or was delivered last week
- `{{ACTIVE_PROJECTS}}` — list of projects currently in flight
- `{{UPCOMING_DEADLINES}}` — any dates or deliverables due this week
- `{{TOPICS_TO_RESEARCH}}` — optional: things you want to know more about this week

## Steps

### Step 1: Load memory (sequential)
```
Read C:/Users/yogeash.nehra/.claude/projects/C--Dev-Yogi/memory/MEMORY.md
Read any active project memory files.
```

### Step 2: Parallel work (spawn all three at once)
**Agent A — Accomplishment summary:**
```
Read agents/ops-agent.md, then act as that agent.
Week: {{WEEK_RANGE}}
Completed work: {{COMPLETED_WORK}}

Write a concise weekly accomplishment summary suitable for:
1. A personal record (what I shipped)
2. A client-facing update (what we delivered)
Keep each version to 3-5 bullet points. Professional tone.
```

**Agent B — Weekly planning brief:**
```
Read agents/ops-agent.md, then act as that agent.
Active projects: {{ACTIVE_PROJECTS}}
Upcoming deadlines: {{UPCOMING_DEADLINES}}

Output:
1. This week's top 3 priorities across all projects
2. Any deadline risks and mitigation steps
3. Decisions that need to be made this week
```

**Agent C — Research (if topics provided):**
```
Read agents/research-agent.md, then act as that agent.
Research these topics: {{TOPICS_TO_RESEARCH}}
For each: provide a 2-3 sentence summary and 1-2 key links.
Use WebSearch to get current information.
```

### Step 3: Synthesize digest (sequential)
```
Combine all three agent outputs into a weekly digest:

## Weekly Digest — {{WEEK_RANGE}}

### Last Week: What Shipped
[from Agent A — personal version]

### This Week: Top Priorities
[from Agent B]

### Deadline Watch
[from Agent B]

### Reading / Research
[from Agent C, if provided]
```

## Outputs
Weekly digest in conversation. Save to `personal/digests/{{WEEK_RANGE}}.md`.

## Example Invocation
```
Read workflows/weekly-digest.md, then run the weekly digest for Apr 28 – May 2, 2026.
Completed: [list]
Active: [list]
Deadlines: [list]
Research topics: Claude extended thinking, Stripe Connect onboarding
```
