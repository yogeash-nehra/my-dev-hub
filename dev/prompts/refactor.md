# Prompt: Refactor

## When to Use
Code works but is hard to read, duplicated, over-engineered, or slow.
Do not use this to add features — pure cleanup only.

## Inputs
- `{{FILE_PATH}}` — file to refactor (Claude will Read it first)
- `{{REFACTOR_GOAL}}` — what you want improved: readability / deduplication / performance / simplicity
- `{{CONSTRAINTS}}` — what must NOT change (public API, behavior, output format)

## Prompt
```
Refactor the code at {{FILE_PATH}}.

Goal: {{REFACTOR_GOAL}}
Constraints: {{CONSTRAINTS}}

Rules:
1. Read the file before making any changes
2. Do not change behavior — only improve the implementation
3. Do not add new features, error handling, or abstractions beyond what's needed
4. Do not add comments explaining what the code does — only why, if non-obvious
5. Run /simplify after changes to catch anything you missed

After refactoring:
- Show a before/after summary of what changed and why
- If tests exist, confirm they still pass
- Flag anything you chose NOT to change and why
```

## Example (filled in)
```
File: src/utils/formatters.ts
Goal: Remove duplication — there are 4 nearly identical date formatting functions
Constraints: Do not change the function signatures (they're exported and used externally)
```

## Tips
- For large files, specify which section or function to focus on
- If the refactor is part of a larger initiative (e.g., migration to a new pattern), say so — context changes what's appropriate
- Use `/simplify` skill after the refactor as a second pass
