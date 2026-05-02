# Workflow: Client Proposal

Researches a client/project, then produces a ready-to-send proposal.

## Trigger
New client engagement, new project scope, or proposal renewal.

## Inputs
- `{{CLIENT_NAME}}` — company or individual name
- `{{CLIENT_WEBSITE}}` — their website URL (for research)
- `{{PROJECT_BRIEF}}` — what they asked for (paste their brief, email, or notes)
- `{{SCOPE_NOTES}}` — your own notes on scope, constraints, or concerns
- `{{RATE_OR_BUDGET}}` — your rate or their stated budget
- `{{TIMELINE}}` — project timeline or deadline

## Steps

### Step 1: Client research (parallel with Step 2)
```
Read agents/research-agent.md, then act as that agent.
Research this client: {{CLIENT_NAME}} ({{CLIENT_WEBSITE}})
Use WebFetch to read their website and WebSearch for any news.

Output:
1. What they do (2-3 sentences)
2. Their likely pain points relevant to: {{PROJECT_BRIEF}}
3. Signals about company size, maturity, and decision-making style
4. Any red flags (bad reviews, financial news, etc.)
```

### Step 2: Scope analysis (parallel with Step 1)
```
Read agents/dev-agent.md, then act as that agent.
Review this project brief: {{PROJECT_BRIEF}}
Scope notes: {{SCOPE_NOTES}}

Output:
1. Technical breakdown of deliverables
2. Estimated effort per deliverable (rough hours)
3. Risks and unknowns that should be called out in the proposal
4. Questions to ask the client before finalizing scope
```

### Step 3: Draft proposal (sequential, after both agents complete)
```
Read agents/ops-agent.md, then act as that agent.
Using the client research and scope analysis above, draft a proposal.

Client: {{CLIENT_NAME}}
Rate/Budget: {{RATE_OR_BUDGET}}
Timeline: {{TIMELINE}}

Follow the template in ops/prompts/proposal.md.
Personalize the opening to what you learned about their business.
Be specific about deliverables, timeline milestones, and what's out of scope.
End with a clear next step.
```

### Step 4: Review and finalize
Present draft to user for approval. Ask:
- "Does the scope and pricing feel right?"
- "Anything to add to the out-of-scope section?"
- "Who is this being sent to and in what format (email, PDF, shared doc)?"

## Outputs
- Draft proposal in conversation
- Optionally save to `ops/proposals/{{CLIENT_NAME}}-{{DATE}}.md`

## Example Invocation
```
Read workflows/client-proposal.md, then create a proposal for:
Client: Acme Corp (acmecorp.com)
Brief: They want a custom inventory management system integrated with Shopify.
Scope notes: I'm estimating 6-8 weeks, my hourly rate is $175.
Timeline: They want to go live before Q3.
```
