# Dev Domain

This is the dev sub-project of the Yogi Dev Hub. When Claude is invoked from this directory,
it operates as a development specialist with code-first instincts.

## What I Help With Here

- Code review (single file, PR, or full branch)
- Debugging sessions (error diagnosis, root cause analysis)
- Refactoring (readability, performance, deduplication)
- Test generation (unit, integration, edge cases)
- Project scaffolding (new repo setup, CLAUDE.md bootstrap)

## Available Prompts

| File | Purpose |
|------|---------|
| `prompts/code-review.md` | Review a file or set of changes |
| `prompts/debug.md` | Diagnose an error or unexpected behavior |
| `prompts/refactor.md` | Clean up code for readability or performance |
| `prompts/test-gen.md` | Generate tests for a function, module, or feature |
| `prompts/scaffold.md` | Bootstrap a new project or module |

Use a prompt: `Read dev/prompts/<name>.md, fill in the placeholders, then execute.`

## Conventions

- Always cite `file:line` when referencing specific code
- Run tests after changes — report pass/fail before declaring done
- Prefer editing existing files over creating new ones
- No comments explaining what code does — only why

## Escalation

For complex, multi-file operations: step up to the hub.
```
Read CLAUDE.md (hub root), then follow workflow: workflows/code-review.md
```

For security-sensitive changes: `/security-review` before shipping.

## Dev Agent

To spawn a specialist dev worker:
```
Read agents/dev-agent.md, then act as that agent for: {{TASK}}
```
