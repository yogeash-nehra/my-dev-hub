# Prompt: Client Proposal

## When to Use
Writing a proposal for a new engagement, project extension, or scope change.
For a full research-backed proposal, use `workflows/client-proposal.md` instead.

## Inputs
- `{{CLIENT_NAME}}` — client or company name
- `{{PROJECT_TITLE}}` — short name for this engagement
- `{{PROBLEM_STATEMENT}}` — the client's problem (their words if possible)
- `{{PROPOSED_SOLUTION}}` — what you will build or deliver
- `{{DELIVERABLES}}` — specific, testable outputs (bullet list)
- `{{OUT_OF_SCOPE}}` — explicitly what is NOT included
- `{{TIMELINE}}` — milestones and final delivery date
- `{{PRICING}}` — total or breakdown (fixed / hourly / retainer)
- `{{NEXT_STEP}}` — how to proceed (sign, call, etc.)

## Prompt
```
Write a client proposal for {{CLIENT_NAME}}.

Project: {{PROJECT_TITLE}}
Problem: {{PROBLEM_STATEMENT}}
Solution: {{PROPOSED_SOLUTION}}

Deliverables:
{{DELIVERABLES}}

Out of scope:
{{OUT_OF_SCOPE}}

Timeline: {{TIMELINE}}
Pricing: {{PRICING}}
Next step: {{NEXT_STEP}}

Format the proposal as follows:
---
# {{PROJECT_TITLE}}
## Proposed for: {{CLIENT_NAME}}

### The Challenge
[Restate their problem in their terms — show you understand it]

### Our Approach
[How you'll solve it — methodology, not just a feature list]

### What We'll Deliver
[Numbered list of deliverables with brief descriptions]

### What's Not Included
[Clear out-of-scope items — prevents scope creep]

### Timeline
[Milestones table: Milestone | Date]

### Investment
[Pricing breakdown or total]

### Next Steps
[Clear CTA — what they do to proceed]
---

Personalize the opening to their specific problem. Be concrete.
```
