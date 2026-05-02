# Prompt: Status Report

## When to Use
Sending a project update to a client, stakeholder, or team. Weekly updates, milestone reports,
or end-of-sprint summaries.

## Inputs
- `{{PROJECT_NAME}}` — project or engagement name
- `{{REPORTING_PERIOD}}` — e.g., "Week of Apr 28" or "Sprint 4"
- `{{AUDIENCE}}` — who receives this (client / internal team / exec)
- `{{COMPLETED}}` — what was finished this period (bullet list)
- `{{IN_PROGRESS}}` — what's actively being worked on now
- `{{NEXT_PERIOD}}` — what's planned for the next period
- `{{RISKS_OR_BLOCKERS}}` — issues that could affect timeline or scope
- `{{OVERALL_STATUS}}` — On Track / At Risk / Blocked

## Prompt
```
Write a project status report.

Project: {{PROJECT_NAME}}
Period: {{REPORTING_PERIOD}}
Audience: {{AUDIENCE}}
Overall status: {{OVERALL_STATUS}}

Completed this period:
{{COMPLETED}}

In progress now:
{{IN_PROGRESS}}

Next period plan:
{{NEXT_PERIOD}}

Risks / blockers:
{{RISKS_OR_BLOCKERS}}

Format:
---
# {{PROJECT_NAME}} — Status Update
**Period:** {{REPORTING_PERIOD}}
**Status:** {{OVERALL_STATUS}} 🟢/🟡/🔴

## This Period: Completed
[bullet list]

## In Progress
[bullet list with % complete if known]

## Next Period
[bullet list]

## Risks & Blockers
[bullet list — each with: issue, impact, mitigation or ask]

## Summary
[2-3 sentence executive summary for skimmers]
---

Tone: match the audience (formal for exec/client, casual for internal team).
If status is At Risk or Blocked, lead with that — don't bury it.
```
