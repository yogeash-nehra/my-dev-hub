# Prompt: Meeting Notes

## When to Use
Converting raw notes or a transcript into structured meeting minutes with clear action items.

## Inputs
- `{{MEETING_TITLE}}` — e.g., "Q2 Planning", "Client Kickoff — Acme Corp"
- `{{DATE}}` — meeting date
- `{{ATTENDEES}}` — names and roles
- `{{RAW_NOTES}}` — your raw notes, bullet dump, or transcript (paste as-is)
- `{{DECISIONS_MADE}}` — optional: any decisions you remember being made

## Prompt
```
Convert these raw meeting notes into structured minutes.

Meeting: {{MEETING_TITLE}}
Date: {{DATE}}
Attendees: {{ATTENDEES}}
{{#if DECISIONS_MADE}}Known decisions: {{DECISIONS_MADE}}{{/if}}

Raw notes:
{{RAW_NOTES}}

Output format:
---
# {{MEETING_TITLE}}
**Date:** {{DATE}}
**Attendees:** {{ATTENDEES}}

## Summary
[2-3 sentences capturing what the meeting accomplished]

## Key Decisions
- [Decision 1]
- [Decision 2]

## Action Items
| Action | Owner | Due |
|--------|-------|-----|
| [task] | [name] | [date or "TBD"] |

## Discussion Notes
[Organized by topic, not raw order — group related points together]

## Next Meeting
[Date/time if scheduled, or "TBD"]
---

Extract ALL action items — err on the side of including more rather than fewer.
If the owner or due date is unclear, mark as "TBD" and flag it.
```

## Tips
- If you recorded audio, use a transcription tool first and paste the transcript as `{{RAW_NOTES}}`
- For client meetings, remove internal commentary before sharing the notes externally
