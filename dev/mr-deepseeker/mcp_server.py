#!/usr/bin/env python3
"""
MCP server wrapper for Mr_Deepseeker.

Exposes five tools to Claude Code via the Model Context Protocol (stdio):
  deepseek_review          — bug audit for a project folder
  deepseek_write_tests     — pytest suite generation for a Python file
  deepseek_generate        — boilerplate code from a description
  deepseek_write_docstrings — add docstrings to a Python file
  deepseek_translate       — rewrite a source file in another language

Run with:  python3 mcp_server.py
Configure: fill DEEPSEEK_API_KEY in .mcp.json (or export it in your shell)
"""
from __future__ import annotations

import json
import os
from pathlib import Path

from mcp.server.fastmcp import FastMCP
from mr_deepseeker.env import load_env

# Load .env at startup so env.py can find Mr_Deepseeker/.env automatically
load_env()

mcp = FastMCP("mr-deepseeker")


# ── helpers ────────────────────────────────────────────────────────────────────

def _api_key_missing() -> bool:
    return not os.environ.get("DEEPSEEK_API_KEY", "").strip()


def _format_review(result: dict) -> str:
    """Render review_project() dict as a human-readable severity-ranked report."""
    lines: list[str] = []
    reviewed = result.get("files_reviewed", [])
    bugs     = result.get("bugs", [])
    risks    = result.get("reliability_risks", [])
    dead     = result.get("dead_code_fragments", [])

    lines.append(f"FILES REVIEWED ({len(reviewed)})")
    for f in reviewed:
        lines.append(f"  {f}")

    _sev_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    sorted_bugs = sorted(bugs, key=lambda b: _sev_order.get(b.get("severity", "low"), 3))

    lines.append(f"\nBUGS FOUND ({len(sorted_bugs)})")
    for b in sorted_bugs:
        sev   = b.get("severity", "?").upper()
        file_ = b.get("file", "?")
        line  = b.get("line")
        loc   = f"{file_}:{line}" if line else file_
        lines.append(f"\n  [{sev}] {loc}")
        lines.append(f"    Category:    {b.get('category', '?')}")
        lines.append(f"    Issue:       {b.get('description', '?')}")
        lines.append(f"    Remediation: {b.get('remediation', '?')}")

    if risks:
        lines.append("\nRELIABILITY RISKS")
        for r in risks:
            lines.append(f"  - {r}")

    if dead:
        lines.append("\nDEAD CODE FRAGMENTS")
        for d in dead:
            loc = f"{d.get('file')}:{d.get('lines', '?')} ({d.get('function', '?')})"
            lines.append(f"  {loc}")

    return "\n".join(lines)


# ── tools ──────────────────────────────────────────────────────────────────────

@mcp.tool()
def deepseek_review(path: str, context: str = "") -> str:
    """Review a project folder for bugs. Severity-ranked output with file:line references. Use when asked to: review, audit, find bugs, check for issues."""
    if _api_key_missing():
        return "DEEPSEEK_API_KEY not set. Add it to .mcp.json or your environment."
    try:
        from mr_deepseeker.deepseek import review_project
        if not Path(path).exists():
            return f"File not found: {path}"
        result = review_project(path, context=context)
        return _format_review(result)
    except Exception as e:
        return str(e)


@mcp.tool()
def deepseek_write_tests(file_path: str) -> str:
    """Generate a full pytest suite for a Python source file. Use when asked to: write tests, generate tests, test coverage."""
    if _api_key_missing():
        return "DEEPSEEK_API_KEY not set. Add it to .mcp.json or your environment."
    try:
        from mr_deepseeker.boilerplate import write_tests
        p = Path(file_path)
        if not p.exists():
            return f"File not found: {file_path}"
        return write_tests(p.read_text())
    except Exception as e:
        return str(e)


@mcp.tool()
def deepseek_generate(description: str, language: str = "python") -> str:
    """Generate boilerplate code from a plain-English description. Use when asked to: generate code, create boilerplate, scaffold, expand a stub."""
    if _api_key_missing():
        return "DEEPSEEK_API_KEY not set. Add it to .mcp.json or your environment."
    try:
        from mr_deepseeker.boilerplate import generate
        return generate(description, language=language)
    except Exception as e:
        return str(e)


@mcp.tool()
def deepseek_write_docstrings(file_path: str) -> str:
    """Add docstrings to all undocumented functions in a Python file. Use when asked to: write docstrings, document code, add docs."""
    if _api_key_missing():
        return "DEEPSEEK_API_KEY not set. Add it to .mcp.json or your environment."
    try:
        from mr_deepseeker.boilerplate import write_docstrings
        p = Path(file_path)
        if not p.exists():
            return f"File not found: {file_path}"
        return write_docstrings(p.read_text())
    except Exception as e:
        return str(e)


@mcp.tool()
def deepseek_translate(file_path: str, target_language: str) -> str:
    """Rewrite a source file in another language. Use when asked to: translate to TypeScript, convert to Go, port to Rust."""
    if _api_key_missing():
        return "DEEPSEEK_API_KEY not set. Add it to .mcp.json or your environment."
    try:
        from mr_deepseeker.boilerplate import translate
        p = Path(file_path)
        if not p.exists():
            return f"File not found: {file_path}"
        return translate(p.read_text(), target_language)
    except Exception as e:
        return str(e)


# ── entry point ────────────────────────────────────────────────────────────────

async def main() -> None:
    await mcp.run_async()


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
