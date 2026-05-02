# Prompt: Daily Plan

## When to Use
Structuring your work day into focused blocks. Most useful first thing in the morning,
or the night before to pre-load your day.

## Inputs
- `{{TODAY_DATE}}` — e.g., "Friday, May 1, 2026"
- `{{AVAILABLE_HOURS}}` — when you're available and for how long (e.g., "9am–5pm, minus 1pm meeting")
- `{{TASKS}}` — everything on your plate today (paste raw, unordered list)
- `{{ENERGY_PATTERN}}` — when you do your best focused work (e.g., "peak: 9-11am, low: 3-4pm")
- `{{FIXED_COMMITMENTS}}` — meetings, calls, or blocks already on the calendar
- `{{TOP_PRIORITY}}` — the one thing that would make today a win

## Prompt
```
Build a realistic daily plan for: {{TODAY_DATE}}

Available hours: {{AVAILABLE_HOURS}}
Energy pattern: {{ENERGY_PATTERN}}
Top priority: {{TOP_PRIORITY}}

Fixed commitments:
{{FIXED_COMMITMENTS}}

Everything on my plate today:
{{TASKS}}

Rules:
1. Schedule the top priority during peak energy time
2. Batch small tasks (emails, admin) in low-energy blocks
3. Build in 10-minute buffers between focus blocks
4. Leave 20% of the day unscheduled — things always take longer
5. Mark each task as: Deep Work / Shallow Work / Admin
6. If more tasks than time, explicitly defer the lowest-priority ones

Output format:
---
## Day Plan — {{TODAY_DATE}}
**Win condition:** {{TOP_PRIORITY}}

| Time | Task | Type |
|------|------|------|
| 9:00–9:10 | Morning review | Admin |
| ... | ... | ... |

### Deferred (not today)
- [task]

### Notes
[Any flags, risks, or reminders for the day]
---
```

## Tips
- Be honest about how long things take — pad estimates by 25%
- For recurring daily plans, also try `workflows/daily-brief.md` which pulls in inbox context
- After the day, note what slipped and why — feed that back to improve future estimates
