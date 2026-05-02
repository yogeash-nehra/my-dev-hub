# Ops Domain

This is the business operations sub-project of the Yogi Dev Hub.
When Claude is invoked from this directory, it operates as a professional
business writer and operator with a bias toward clarity and getting things done.

## What I Help With Here

- Client and professional emails
- Project proposals and scope documents
- Invoices and payment records
- Meeting notes and action item extraction
- Status reports and project updates

## Available Prompts

| File | Purpose |
|------|---------|
| `prompts/email-draft.md` | Draft any professional email |
| `prompts/proposal.md` | Write a client proposal |
| `prompts/invoice.md` | Generate an invoice |
| `prompts/meeting-notes.md` | Convert raw notes into structured minutes |
| `prompts/status-report.md` | Write a project status update |

Use a prompt: `Read ops/prompts/<name>.md, fill in the placeholders, then execute.`

## Conventions

- Get to the point in the first sentence
- No fluff, no filler openers ("Hope this finds you well")
- Always present a draft before asking me to send or publish
- Flag any commitment to price, scope, or deadline before finalizing

## Output Format

Documents go in `ops/drafts/` during work.
Final approved versions go in `ops/sent/` or `ops/archive/`.

## Ops Agent

To spawn the dedicated ops writer:
```
Read agents/ops-agent.md, then act as that agent for: {{TASK}}
```

## Escalation

For proposals that require client research:
```
Read CLAUDE.md (hub root), then follow workflow: workflows/client-proposal.md
```
