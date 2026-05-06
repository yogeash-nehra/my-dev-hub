# Mr_Deepseeker

DeepSeek-powered code review and generation tool for Claude Code.
See `SKILL.md` for keyword-based usage and `docs/MCP_SETUP.md` for the MCP server.

---

## MCP server (feature/mcp-server branch)

- Run `pip install -r requirements-mcp.txt` once
- Fill in `DEEPSEEK_API_KEY` in `.mcp.json`
- Tools available: `deepseek_review`, `deepseek_write_tests`,
  `deepseek_generate`, `deepseek_write_docstrings`, `deepseek_translate`
- SKILL.md still works as fallback — do not remove it
