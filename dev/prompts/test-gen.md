# Prompt: Test Generation

## When to Use
Adding tests to new or untested code. Also useful for generating edge-case tests
when you know a function is under-tested.

## Inputs
- `{{FILE_PATH}}` — file containing the function(s) to test
- `{{FUNCTION_NAME}}` — specific function(s), or "all exported functions"
- `{{TEST_FRAMEWORK}}` — e.g., Jest, Vitest, pytest, Go testing
- `{{TEST_STYLE}}` — unit / integration / e2e
- `{{KNOWN_EDGE_CASES}}` — optional: cases you know need testing

## Prompt
```
Generate {{TEST_STYLE}} tests for {{FUNCTION_NAME}} in {{FILE_PATH}}.
Test framework: {{TEST_FRAMEWORK}}
{{#if KNOWN_EDGE_CASES}}Known edge cases to cover: {{KNOWN_EDGE_CASES}}{{/if}}

Steps:
1. Read {{FILE_PATH}} to understand the implementation
2. Identify: happy paths, error paths, boundary conditions, and edge cases
3. Write tests that:
   - Test behavior, not implementation details
   - Use descriptive test names ("should return null when user not found")
   - Have one assertion per test where possible
   - Mock only at system boundaries (DB, HTTP, filesystem) — not internal functions
4. If the function has no existing tests, also add a test file setup comment
   explaining what this test suite covers

Do not test private/internal functions directly — test via their public interface.
Do not write tests that would always pass regardless of implementation.
```

## Example (filled in)
```
File: src/auth/validateToken.ts
Function: validateToken
Framework: Vitest
Style: unit
Edge cases: expired tokens, malformed JWTs, tokens with missing claims
```

## Tips
- For integration tests, describe the test DB or mock server setup you already have
- For complex domain logic, ask for property-based tests using fast-check or hypothesis
- Always run the generated tests and paste back any failures for iteration
