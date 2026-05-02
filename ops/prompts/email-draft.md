# Prompt: Email Draft

## When to Use
Any professional email — client follow-up, project update, request, or response.

## Inputs
- `{{RECIPIENT}}` — name and role of recipient
- `{{RELATIONSHIP}}` — e.g., "existing client", "cold prospect", "internal teammate"
- `{{PURPOSE}}` — what this email is trying to accomplish (one sentence)
- `{{KEY_POINTS}}` — bullet list of what needs to be communicated
- `{{DESIRED_NEXT_STEP}}` — what you want the recipient to do after reading
- `{{TONE}}` — formal / professional / casual (default: professional)

## Prompt
```
Draft a professional email.

Recipient: {{RECIPIENT}} ({{RELATIONSHIP}})
Purpose: {{PURPOSE}}
Tone: {{TONE}}

Key points to cover:
{{KEY_POINTS}}

Desired next step from recipient: {{DESIRED_NEXT_STEP}}

Rules:
- Subject line: specific and action-oriented (not "Following up")
- First sentence: state the purpose or most important point immediately
- Body: cover key points clearly, one idea per paragraph
- Closing: one explicit ask — what you need the recipient to do, by when if relevant
- Signature: "Best, Yogi" (or adjust if context requires)
- Length: as short as possible while covering all key points

Output the full email including subject line.
Then ask: "Anything to adjust?"
```

## Example (filled in)
```
Recipient: Sarah Chen, Head of Product at Acme Corp
Relationship: Existing client, mid-project
Purpose: Share this week's progress and flag a timeline risk
Key points:
- Auth module shipped on Tuesday
- Dashboard is 80% done
- API integration is blocked on their end (need credentials from their team)
- If credentials don't arrive by Friday, timeline shifts by 1 week
Desired next step: They send the API credentials by EOD Thursday
Tone: Professional
```
