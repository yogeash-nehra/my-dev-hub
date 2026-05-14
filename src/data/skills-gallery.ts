export type SkillCategory = 'code' | 'ops' | 'research' | 'writing' | 'devops'
export type FilterCategory = SkillCategory | 'all'

export interface GallerySkill {
  id: string
  name: string
  description: string
  category: SkillCategory
  emoji: string
  tags: string[]
  popular?: boolean
  content: string
}

export const CATEGORY_META: Record<FilterCategory, { label: string; color: string }> = {
  all:      { label: 'All',      color: '#94A3B8' },
  code:     { label: 'Code',     color: '#3B82F6' },
  devops:   { label: 'DevOps',   color: '#10B981' },
  ops:      { label: 'Ops',      color: '#F59E0B' },
  research: { label: 'Research', color: '#8B5CF6' },
  writing:  { label: 'Writing',  color: '#EC4899' },
}

export const GALLERY_SKILLS: GallerySkill[] = [
  {
    id: 'pr-reviewer',
    name: 'PR Reviewer',
    description: 'Reviews the current branch diff for bugs, security, and code quality.',
    category: 'code',
    emoji: '🔍',
    tags: ['git', 'review', 'quality'],
    popular: true,
    content: `# PR Reviewer

Review the current branch diff for code quality, bugs, and security issues.

## Steps

1. Run \`git diff main...HEAD\` to get all changes since branch point
2. For each changed file, check:
   - Logic errors and unhandled edge cases
   - Security: SQL injection, XSS, auth bypass, secret exposure
   - Performance: N+1 queries, unindexed lookups, O(n²) loops
   - Missing error handling for external calls
   - Test coverage gaps for changed code
3. Group by severity

## Output format

One finding per line:
\`\`\`
path/to/file.ts:42  🔴 Critical: [problem]. [fix].
path/to/file.ts:87  🟡 Warning: [problem]. [fix].
path/to/file.ts:103 🔵 Style: [problem]. [fix].
\`\`\`

End with: **APPROVED** / **NEEDS CHANGES** / **BLOCKED** + one-line summary.`,
  },
  {
    id: 'security-auditor',
    name: 'Security Auditor',
    description: 'Audits staged changes for OWASP Top 10 and common vulnerabilities.',
    category: 'code',
    emoji: '🛡️',
    tags: ['security', 'owasp', 'audit'],
    popular: true,
    content: `# Security Auditor

Audit the current changes for security vulnerabilities before shipping.

## Scope

Run \`git diff HEAD\` and check for:

**Injection**
- SQL injection via string concatenation or f-strings
- Command injection via \`exec\`, \`eval\`, \`subprocess\` with user input
- XSS via unescaped output in templates

**Authentication & Session**
- Hardcoded credentials, tokens, or API keys in code
- Weak hashing (MD5, SHA1 for passwords)
- Missing auth checks on sensitive endpoints
- JWT not verified or algorithm set to "none"

**Data Exposure**
- PII logged to console or files
- Sensitive fields returned in API responses unnecessarily
- Unencrypted sensitive data at rest

**Access Control**
- Missing authorization checks (authn ≠ authz)
- IDOR vulnerabilities in resource lookups
- Overly permissive CORS

## Output

\`\`\`
[file:line] SEVERITY: Vulnerability type
  Issue: What the problem is
  Risk: What an attacker can do
  Fix: Exact remediation
\`\`\`

If no issues found: "No security issues found in this diff."`,
  },
  {
    id: 'test-generator',
    name: 'Test Generator',
    description: 'Generates unit and integration tests for selected functions or modules.',
    category: 'code',
    emoji: '🧪',
    tags: ['testing', 'jest', 'vitest'],
    content: `# Test Generator

Generate comprehensive tests for the code provided or the current file.

## Instructions

Analyze the target code and generate tests covering:

1. **Happy path** — expected inputs produce expected outputs
2. **Edge cases** — empty inputs, zero values, max values, boundary conditions
3. **Error paths** — invalid inputs, network failures, null/undefined
4. **Async behavior** — promise resolution, rejection, timeout handling

## Rules

- Use the testing framework already in the project (detect from package.json: Jest, Vitest, Mocha, etc.)
- Each test must have a descriptive name: \`it('should return null when input is empty', ...)\`
- Use concrete test data — not "valid email" but "user@example.com"
- Mock only external dependencies (network, filesystem, clock)
- Never mock the unit under test
- Aim for 100% branch coverage of the target function

## Output

Return only the test file, ready to run. Include imports and any required mock setup.`,
  },
  {
    id: 'refactor-assistant',
    name: 'Refactor Assistant',
    description: 'Identifies refactoring opportunities and proposes clean, minimal rewrites.',
    category: 'code',
    emoji: '♻️',
    tags: ['refactor', 'clean code', 'dry'],
    content: `# Refactor Assistant

Analyze the provided code and propose targeted refactoring improvements.

## What to look for

- **Duplication**: extract repeated logic into shared functions
- **Long functions**: split functions doing more than one thing
- **Deep nesting**: flatten with early returns or extracted conditions
- **Magic numbers/strings**: replace with named constants
- **Unclear names**: suggest names that reveal intent
- **Unnecessary complexity**: simpler data structures, fewer abstractions

## Rules

- Show before/after for each change — don't rewrite the whole file
- Preserve all existing behavior — no functional changes
- If a change adds indirection without clear benefit, skip it
- Rank proposals: highest-impact first

## Output format

For each finding:
\`\`\`
## [Issue type] — file.ts:line-range

Before:
[original code]

After:
[refactored code]

Why: [one sentence]
\`\`\``,
  },
  {
    id: 'commit-drafter',
    name: 'Commit Drafter',
    description: 'Generates conventional commit messages from staged changes.',
    category: 'devops',
    emoji: '📝',
    tags: ['git', 'commits', 'conventional'],
    popular: true,
    content: `# Commit Drafter

Generate a conventional commit message for the staged changes.

## Steps

1. Run \`git diff --staged\` to see staged changes
2. Run \`git log --oneline -10\` to match the project's commit style
3. Draft a commit message following Conventional Commits

## Format

\`\`\`
<type>(<scope>): <subject>

[optional body — only if WHY is not obvious from the subject]
\`\`\`

**Types:** feat | fix | refactor | test | docs | chore | perf | ci | style
**Scope:** the affected module, file, or domain (optional but encouraged)
**Subject:** imperative mood, lowercase, no period, ≤50 chars
**Body:** explain WHY, not what — the diff already shows what

## Rules

- If changes span multiple concerns, suggest splitting the commit
- Body only when the motivation is non-obvious from reading the diff

## Output

Return only the commit message. No explanation. No \`git commit\` command.`,
  },
  {
    id: 'daily-standup',
    name: 'Daily Standup',
    description: 'Drafts a standup update from recent git activity and context.',
    category: 'devops',
    emoji: '📅',
    tags: ['standup', 'git', 'team'],
    content: `# Daily Standup

Draft a standup update based on recent git activity.

## Steps

1. Run \`git log --oneline --since="1 day ago" --author="$(git config user.name)"\`
2. Run \`git status\` to see work in progress
3. Use any blockers provided, or default to "None"

## Output format

\`\`\`
Yesterday:
- [what was shipped or completed — specific, not vague]

Today:
- [what's planned — concrete next step, not "continue working on X"]

Blockers:
- [specific blocker] OR "None"
\`\`\`

## Rules

- Be specific: "shipped auth middleware" not "worked on auth"
- Keep each line under 15 words
- If no git activity found, say so — don't invent items
- Blockers must name the blocker, not describe symptoms`,
  },
  {
    id: 'email-drafter',
    name: 'Email Drafter',
    description: 'Drafts professional emails from bullet points or a brief description.',
    category: 'ops',
    emoji: '📧',
    tags: ['email', 'communication', 'professional'],
    content: `# Email Drafter

Draft a professional email from the context or bullet points provided.

## Tone calibration

- **Peer/internal**: direct, skip pleasantries, get to the point
- **Client/external**: professional but warm, clear ask or next step
- **Escalation**: factual, no emotion, state impact and desired outcome

## Structure

- **Subject**: specific and scannable — "Q2 contract renewal — decision needed by May 30"
- **Opening**: one sentence max — state the purpose immediately
- **Body**: context → ask or update → next steps
- **Closing**: single clear CTA or none if informational

## Rules

- No "I hope this email finds you well"
- No "Please don't hesitate to reach out"
- Subject lines must be specific — no "Following up"
- Keep to 150 words unless complexity demands more

## Output

Return subject line + email body only. No explanation.`,
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Structures raw meeting notes into decisions, actions, and open questions.',
    category: 'ops',
    emoji: '🗒️',
    tags: ['meetings', 'notes', 'actions'],
    content: `# Meeting Notes Structurer

Transform raw meeting notes or transcript into structured output.

## Extract

1. **Decisions made** — what was agreed, not discussed
2. **Action items** — owner + action + due date (if mentioned)
3. **Open questions** — unresolved items needing follow-up
4. **Key context** — important background shared in the meeting

## Output format

\`\`\`
## Decisions
- [decision] (agreed by [who] if notable)

## Action Items
| Owner | Action | Due |
|-------|--------|-----|
| [name] | [specific action] | [date or "TBD"] |

## Open Questions
- [question] → assigned to [person] or "unassigned"

## Key Context
- [important background point]
\`\`\`

## Rules

- Actions must be specific enough to act on without re-reading the notes
- "John to follow up" is not an action — "John to send revised pricing to Sarah by Friday" is
- If no due date mentioned, mark TBD — don't invent one`,
  },
  {
    id: 'tech-explainer',
    name: 'Tech Explainer',
    description: 'Explains complex technical concepts clearly for any audience level.',
    category: 'research',
    emoji: '🧠',
    tags: ['explain', 'docs', 'learning'],
    content: `# Tech Explainer

Explain the provided technical concept clearly and accurately.

## Audience calibration

- **Beginner**: no jargon, everyday analogies, no code
- **Developer**: working knowledge assumed, light jargon OK, code examples valued
- **Senior engineer**: implementation details, tradeoffs, edge cases expected

Infer the audience from how the question is phrased.

## Format

\`\`\`
[Concept] in one sentence:
[plain-English definition]

How it works:
[explanation with analogy if useful]

Example:
[code or concrete scenario]

Common misconception:
[what people get wrong and why]

When to use it vs alternatives:
[brief tradeoff]
\`\`\`

## Rules

- Lead with the definition, not the history
- Analogies must map directly — don't force them
- Call out the most common mistake developers make with this concept`,
  },
  {
    id: 'competitor-intel',
    name: 'Competitor Intel',
    description: 'Generates structured competitive analysis for any product or market.',
    category: 'research',
    emoji: '🔭',
    tags: ['research', 'strategy', 'market'],
    content: `# Competitor Intel

Produce a structured competitive analysis for the provided product, company, or market.

## Structure

1. **Key players** — top 3-5 competitors with one-line positioning
2. **Market map** — how players cluster (e.g., enterprise vs. SMB, open-source vs. SaaS)
3. **Feature gaps** — what existing tools don't do well
4. **Differentiation angles** — where a new entrant could win
5. **Risks** — what incumbents could do to shut out a competitor

## Rules

- Name specific companies and products — no vague "many players"
- Cite pricing tiers if publicly available
- Distinguish between what companies claim vs. what users report
- If information is uncertain, say so — don't speculate as fact
- End with a one-paragraph "where to play" recommendation

Use headers per section. Keep it scannable — bullets, not paragraphs.`,
  },
  {
    id: 'doc-writer',
    name: 'Doc Writer',
    description: 'Generates JSDoc, README sections, or API docs from code.',
    category: 'writing',
    emoji: '📚',
    tags: ['docs', 'jsdoc', 'readme'],
    content: `# Doc Writer

Generate accurate, useful documentation for the provided code.

## Detect the documentation type

- **Function/method**: JSDoc or docstring with params, return, throws, example
- **Module/file**: module-level overview, exports, usage example
- **API endpoint**: method, path, params, request body, response schema, errors
- **README section**: installation, usage, configuration, examples

## Rules

- Describe the WHY and WHAT, not the HOW (the code shows how)
- Params must document type, whether required, and valid values
- Examples must be copy-paste runnable
- Don't start with "This function is responsible for..." — start with the verb
- For APIs: always document error responses, not just the happy path

## Output

Return only the documentation. Match the style of any existing docs in the codebase.`,
  },
  {
    id: 'changelog-builder',
    name: 'Changelog Builder',
    description: 'Generates a user-facing changelog from git log since the last tag.',
    category: 'writing',
    emoji: '📋',
    tags: ['changelog', 'releases', 'git'],
    popular: true,
    content: `# Changelog Builder

Generate a user-facing changelog from recent git history.

## Steps

1. Run \`git log $(git describe --tags --abbrev=0)..HEAD --oneline\`
2. Run \`git describe --tags --abbrev=0\` to get the last version
3. Group commits by type and draft changelog entries

## Grouping

- **New** — feat commits: what users can now do
- **Fixed** — fix commits: what was broken and is now resolved
- **Improved** — perf/refactor with user impact
- **Removed** — breaking changes or deprecations

## Rules

- Write for users, not developers — "You can now export reports as PDF" not "feat: add PDF export"
- Skip internal/chore/test/ci commits
- Breaking changes go at the top under ⚠️ Breaking
- Each entry: one sentence, user benefit first

## Output format

\`\`\`markdown
## [next version] — [today's date]

### New
- [user-facing description]

### Fixed
- [user-facing description]

### Improved
- [user-facing description]
\`\`\``,
  },
]
