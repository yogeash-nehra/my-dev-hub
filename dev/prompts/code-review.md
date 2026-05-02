# Prompt: Code Review

## When to Use
Reviewing a single file, a set of changes, or a branch before merging.
For full PR/branch reviews, prefer `workflows/code-review.md` instead.

## Inputs
- `{{FILE_OR_DIFF}}` — paste the file content or diff, or provide a file path
- `{{CONTEXT}}` — what this code is trying to do (1-2 sentences)
- `{{CONCERN}}` — optional: what specifically worries you (performance, security, readability)

## Prompt
```
You are a senior engineer doing a code review.

Context: {{CONTEXT}}
{{#if CONCERN}}Specific concern: {{CONCERN}}{{/if}}

Code to review:
{{FILE_OR_DIFF}}

Review it for:
1. Logic errors, edge cases, and off-by-one bugs
2. Missing error handling at external boundaries (APIs, DB, user input)
3. Security issues (injection, auth gaps, secrets exposure)
4. Performance concerns (N+1 queries, unnecessary allocations, blocking operations)
5. Readability and naming

Format your output:
## Critical (must fix)
- file:line — issue and why it matters

## Warnings (should fix)
- file:line — issue and suggested fix

## Style / Nits (optional)
- file:line — suggestion

## What's good
- Brief notes on what's done well

Be specific and cite line numbers. Skip sections that have no findings.
```

## Example (filled in)
```
Context: This function validates user input before inserting into the DB.
Code to review: [paste validateUser.ts content]
```

## Tips
- If the file is long (>200 lines), tell Claude which section to focus on
- For performance reviews, also describe the data scale (rows, requests/sec)
- For security reviews, use `/security-review` skill for a deeper audit
