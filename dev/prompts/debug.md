# Prompt: Debug

## When to Use
You have an error, unexpected behavior, or a failing test and need to find root cause.

## Inputs
- `{{ERROR_MESSAGE}}` — exact error or stack trace (copy-paste, don't paraphrase)
- `{{CODE_CONTEXT}}` — the function or file where the error originates
- `{{WHAT_YOU_EXPECTED}}` — what should have happened
- `{{WHAT_ACTUALLY_HAPPENED}}` — what did happen
- `{{REPRO_STEPS}}` — minimal steps to reproduce (if known)

## Prompt
```
Debug this issue.

Error:
{{ERROR_MESSAGE}}

Code context:
{{CODE_CONTEXT}}

Expected: {{WHAT_YOU_EXPECTED}}
Actual: {{WHAT_ACTUALLY_HAPPENED}}
{{#if REPRO_STEPS}}Repro: {{REPRO_STEPS}}{{/if}}

Work through this step by step:
1. Identify where in the code the error originates
2. Explain why it's happening (the root cause, not just what's failing)
3. Propose the minimal fix
4. Identify if this class of bug exists elsewhere in the codebase (search with Grep)

Do not add error handling that masks the bug. Fix the underlying cause.
```

## Example (filled in)
```
Error:
TypeError: Cannot read properties of undefined (reading 'id')
  at getUserPosts (src/api/posts.ts:47)
  at async PostsPage (src/app/posts/page.tsx:12)

Code context: [paste posts.ts lines 40-55]

Expected: Page loads with user's posts
Actual: Page crashes on load for users with no profile
Repro: Log in as a user who has no profile record in the DB
```

## Tips
- Always paste the exact error, not a summary — exact text reveals the stack frame
- If it's a build error, paste the full compiler output
- For intermittent bugs, describe the pattern (happens under load? only first request?)
