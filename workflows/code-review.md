# Workflow: Code Review

A structured review of a branch or set of changed files before merging.

## Trigger
Before merging any non-trivial branch. Also useful after a large refactor.

## Inputs
- `{{REPO_PATH}}` — absolute path to the repository (e.g., `C:\Dev\myapp`)
- `{{BRANCH}}` — branch name or `HEAD` for latest changes
- `{{CONTEXT}}` — what this branch is trying to accomplish (1-2 sentences)
- `{{FOCUS_AREAS}}` — optional: specific concerns (security, performance, test coverage)

## Steps

### Step 1: Gather context (sequential)
```
cd {{REPO_PATH}}
git log main..{{BRANCH}} --oneline
git diff main...{{BRANCH}} --stat
```

Read the diff to understand the scope. If > 500 lines changed, note which files are highest risk.

### Step 2: Parallel review (spawn both at once)
**Agent A — Correctness + logic review:**
```
Read agents/dev-agent.md, then act as that agent.
Repository: {{REPO_PATH}}
Branch: {{BRANCH}}
Context: {{CONTEXT}}

Review the changed files for:
- Logic errors or off-by-one bugs
- Missing error handling at system boundaries
- Incorrect assumptions about data shape or nullability
- Race conditions or state management issues
Cite every finding as file:line — description.
Group: Critical → Warning → Style.
```

**Agent B — Security + quality review:**
```
Read agents/dev-agent.md, then act as that agent.
Use the /security-review skill on the changes in {{REPO_PATH}} branch {{BRANCH}}.
Also check:
- Test coverage of new code paths
- Any hardcoded secrets or credentials
- Dependency additions (check for known vulnerabilities)
```

### Step 3: Consolidate (sequential, after both agents)
```
Merge the findings from both review agents into one report:

## Code Review — {{BRANCH}} — {{DATE}}
**Scope:** {{CONTEXT}}

### Critical (must fix before merge)
...

### Warnings (should fix)
...

### Style / Nits (optional)
...

### What's done well
...

### Verdict
[ ] Ready to merge  [ ] Needs changes  [ ] Needs discussion
```

## Outputs
Review report in the conversation. Optionally save to `dev/reviews/{{DATE}}-{{BRANCH}}.md`.

## Example Invocation
```
Read workflows/code-review.md, then review branch feature/auth-refactor
in repo C:\Dev\myapp. Context: replacing JWT with session cookies.
Focus: security implications.
```
