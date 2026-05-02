# Prompt: Scaffold

## When to Use
Starting a new module, service, or feature within an existing project.
For a brand new repo, prefer `workflows/new-project.md` instead.

## Inputs
- `{{PARENT_PROJECT}}` — the project this lives in (path or name)
- `{{MODULE_NAME}}` — name of the new module/service/feature
- `{{PURPOSE}}` — what it does (one sentence)
- `{{STACK}}` — tech stack, if different from parent project
- `{{INTERFACES}}` — what it connects to (other modules, external APIs, DB tables)

## Prompt
```
Scaffold a new module called {{MODULE_NAME}} inside {{PARENT_PROJECT}}.

Purpose: {{PURPOSE}}
Interfaces: {{INTERFACES}}
{{#if STACK}}Stack: {{STACK}}{{/if}}

Steps:
1. Read the parent project's CLAUDE.md (if it exists) to understand conventions
2. Look at 2-3 existing modules using Glob to learn the folder structure pattern
3. Create the module following those patterns:
   - Entry point file
   - Types/interfaces file (if typed language)
   - At least one test file
4. Wire it into the parent (import, route registration, etc.) if the connection point is clear
5. Run existing tests to confirm nothing broke
6. Report what was created and what still needs to be connected

Do not create more files than needed. Start minimal.
```

## Example (filled in)
```
Parent project: C:\Dev\myapp
Module name: notifications
Purpose: Send email and in-app notifications when order status changes
Interfaces: Connects to orders table, SendGrid API, and the websocket server
```

## Tips
- Paste an example of an existing similar module if you want Claude to match its style exactly
- If there's a generator (Nx, Plop, Rails scaffold), mention it — Claude can use it instead of writing from scratch
