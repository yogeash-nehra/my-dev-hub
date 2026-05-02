# Workflow: New Project Scaffold

Bootstraps a new project with the right structure, documentation, and Claude context.

## Trigger
Starting any non-trivial new project — app, library, automation, or tool.

## Inputs
- `{{PROJECT_NAME}}` — short kebab-case name (e.g., `invoice-gen`)
- `{{PROJECT_PATH}}` — where to create it (e.g., `C:\Dev\{{PROJECT_NAME}}`)
- `{{STACK}}` — language + framework (e.g., "TypeScript + Next.js", "Python + FastAPI")
- `{{PURPOSE}}` — one sentence describing what this project does
- `{{AUDIENCE}}` — who uses it (personal tool, client-facing, open source)

## Steps

### Step 1: Research best practices (parallel with Step 2 if stack is known)
```
Read agents/research-agent.md, then act as that agent.
Research current best practices for: {{STACK}}
Focus on: project structure, testing setup, linting/formatting, common gotchas.
Output: a 1-page scaffold recommendation with folder structure and key config files.
```

### Step 2: Generate scaffold (sequential after Step 1)
```
Read agents/dev-agent.md, then act as that agent.
Create a new project at {{PROJECT_PATH}} for: {{PURPOSE}}
Stack: {{STACK}}
Audience: {{AUDIENCE}}

Steps:
1. Create the directory structure recommended by the research agent
2. Initialize git (`git init`, create `.gitignore` for {{STACK}})
3. Create a minimal `README.md` (project name, purpose, how to run)
4. Set up the entry point and one "hello world" test
5. Run /init to create a `CLAUDE.md` tailored to this project
6. Install dependencies (npm install / pip install / etc.)
7. Confirm tests pass with a test run

Report each step as it completes. Stop and ask if anything is ambiguous.
```

### Step 3: Register project (sequential, after scaffold is confirmed)
```
Read agents/ops-agent.md, then act as that agent.
Add a project memory entry for: {{PROJECT_NAME}}

Content to save:
- Name: {{PROJECT_NAME}}
- Path: {{PROJECT_PATH}}
- Purpose: {{PURPOSE}}
- Stack: {{STACK}}
- Started: {{TODAY_DATE}}

Save to: C:/Users/yogeash.nehra/.claude/projects/C--Dev-Yogi/memory/project_{{PROJECT_NAME}}.md
Update MEMORY.md index.
```

## Outputs
- Initialized project at `{{PROJECT_PATH}}`
- `CLAUDE.md` in project root
- Project memory file saved

## Example Invocation
```
Read workflows/new-project.md, then scaffold a new project:
Name: stripe-dashboard
Path: C:\Dev\stripe-dashboard
Stack: TypeScript + Next.js 15 + Tailwind
Purpose: Internal dashboard for viewing Stripe payments and payouts
Audience: Personal tool, just me
```
