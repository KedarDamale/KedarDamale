#!/usr/bin/env python3
"""Minimal stdio MCP server for ATS resume reviews."""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any

from ats import DEFAULT_RESUME, PROVIDERS, resolve_provider, run_review


SERVER_SCRIPT = Path(__file__).resolve()
PYTHON = sys.executable


def setup_instructions() -> str:
    script = str(SERVER_SCRIPT)
    python = PYTHON
    return f"""# Connect the ATS MCP server

The ATS server runs locally over MCP stdio. It exposes `ats_review_resume` and `ats_setup`.
Console use (`make ats`) asks for the target role, company context, optional job description, provider, model, and reasoning effort. MCP calls can pass `target_role`, `company_context`, `provider`, `model`, and `effort` directly. Public GitHub repositories with substantive README content are included when `gh` is authenticated.

## Codex CLI

```sh
codex mcp add ats -- {python} {script}
codex mcp list
```

## Claude Code

```sh
claude mcp add --transport stdio ats -- {python} {script}
claude mcp list
```

## GitHub Copilot CLI

```sh
copilot mcp add ats -- {python} {script}
copilot mcp list
```

## Google Antigravity

Add this server entry to `~/.gemini/config/mcp_config.json`, or to the workspace file `.agents/mcp_config.json`:

```json
{{
  "mcpServers": {{
    "ats": {{
      "command": "{python}",
      "args": ["{script}"]
    }}
  }}
}}
```

Antigravity CLI/IDE: open the MCP manager (`/mcp` in the CLI), reload the server, then ask the agent to call `ats_review_resume` with a resume and job description.

## OpenRouter model routing

Set `ATS_PROVIDER=openrouter` and `OPENROUTER_API_KEY` in the environment inherited by the MCP server. The default model is `openrouter/auto`; set `ATS_OPENROUTER_MODEL` to pin an OpenRouter model ID. OpenRouter receives the resume and job description for analysis.

## Direct console use

From the repository root, run `make ats` for the guided interview or `python3 scripts/ats.py --resume portfolio/main.pdf --role 'Data Scientist' --job-description job.txt --provider codex --model gpt-5.6-terra --effort high` for a direct run. The console shows the provider, selected model, and a live elapsed-time indicator while the review runs.
"""


def tool_definitions() -> list[dict[str, Any]]:
    return [
        {
            "name": "ats_review_resume",
            "title": "Send resume and job description to a model",
            "description": "Score a resume against a target role and optional job description, using resume evidence and substantive public GitHub project READMEs to recommend truthful improvements and estimate score impact. Resume paths are read-only; default is the latest portfolio/main.pdf.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "resume_path": {"type": "string", "description": "Optional path to a .tex, .pdf, .docx, .txt, or .md resume."},
                    "target_role": {"type": "string", "description": "Role being targeted."},
                    "company_context": {"type": "string", "description": "Optional company, product, culture, or team context."},
                    "job_description": {"type": "string", "description": "Full job description text. Leave empty for a general ATS readiness review."},
                    "provider": {"type": "string", "enum": list(PROVIDERS), "description": "Use auto (default), openrouter, claude, codex, agy, or copilot."},
                    "model": {"type": "string", "description": "Optional model ID to try; overrides the provider's configured default."},
                    "effort": {"type": "string", "enum": ["low", "medium", "high", "xhigh", "max"], "description": "Optional reasoning effort; availability depends on the provider and model."},
                },
                "additionalProperties": False,
            },
        },
        {
            "name": "ats_setup",
            "title": "Show ATS MCP setup instructions",
            "description": "Show how to connect this local ATS MCP server to Codex, Claude Code, GitHub Copilot CLI, Google Antigravity, and configure OpenRouter routing.",
            "inputSchema": {"type": "object", "properties": {}, "additionalProperties": False},
        },
    ]


def result_text(text: str, is_error: bool = False) -> dict[str, Any]:
    return {"content": [{"type": "text", "text": text}], "isError": is_error}


def handle(message: dict[str, Any]) -> dict[str, Any] | None:
    method = message.get("method")
    request_id = message.get("id")
    params = message.get("params") or {}
    if not method:
        return {"jsonrpc": "2.0", "id": request_id, "error": {"code": -32600, "message": "Missing method"}}
    if method.startswith("notifications/") or method == "$/cancelRequest":
        return None
    if method == "initialize":
        return {"jsonrpc": "2.0", "id": request_id, "result": {
            "protocolVersion": params.get("protocolVersion", "2024-11-05"),
            "capabilities": {"tools": {"listChanged": False}, "resources": {"listChanged": False}},
            "serverInfo": {"name": "resume-ats", "version": "1.0.0"},
            "instructions": "Use ats_review_resume to send the resume and job description to the selected model. Use ats_setup for local MCP setup instructions.",
        }}
    if method == "ping":
        return {"jsonrpc": "2.0", "id": request_id, "result": {}}
    if method == "tools/list":
        tools = tool_definitions()
        if os.environ.get("ATS_DISABLE_REVIEW_TOOL") == "1":
            tools = [tool for tool in tools if tool["name"] == "ats_setup"]
        return {"jsonrpc": "2.0", "id": request_id, "result": {"tools": tools}}
    if method == "resources/list":
        return {"jsonrpc": "2.0", "id": request_id, "result": {"resources": [
            {"uri": "ats://setup", "name": "ATS MCP setup instructions", "description": "Connection steps for supported local AI clients and model routing.", "mimeType": "text/markdown"}
        ]}}
    if method == "resources/read":
        if (params.get("uri") or "") != "ats://setup":
            return {"jsonrpc": "2.0", "id": request_id, "error": {"code": -32002, "message": "Unknown resource"}}
        return {"jsonrpc": "2.0", "id": request_id, "result": {"contents": [
            {"uri": "ats://setup", "mimeType": "text/markdown", "text": setup_instructions()}
        ]}}
    if method == "tools/call":
        tool_name = params.get("name")
        arguments = params.get("arguments") or {}
        if tool_name == "ats_setup":
            return {"jsonrpc": "2.0", "id": request_id, "result": result_text(setup_instructions())}
        if tool_name != "ats_review_resume":
            return {"jsonrpc": "2.0", "id": request_id, "error": {"code": -32602, "message": f"Unknown tool: {tool_name}"}}
        if os.environ.get("ATS_DISABLE_REVIEW_TOOL") == "1":
            return {"jsonrpc": "2.0", "id": request_id, "result": result_text("Nested ATS reviews are disabled to prevent recursive model calls.", True)}
        try:
            provider = str(arguments.get("provider", os.environ.get("ATS_PROVIDER", "auto")))
            model = arguments.get("model")
            actual_provider, actual_model = resolve_provider(provider, model)
            route = actual_model + (" (max quality tier)" if actual_provider == "openrouter" and actual_model == "openrouter/auto" else "")
            effort = arguments.get("effort")
            print(f"ATS MCP review · provider: {actual_provider} · model: {route} · effort: {effort or 'provider default'}", file=sys.stderr, flush=True)
            report = run_review(
                arguments.get("resume_path", DEFAULT_RESUME),
                str(arguments.get("job_description", "")),
                provider,
                model,
                quiet=True,
                target_role=str(arguments.get("target_role", "")),
                company_context=str(arguments.get("company_context", "")),
                effort=str(effort) if effort else None,
            )
            return {"jsonrpc": "2.0", "id": request_id, "result": result_text(report)}
        except Exception as exc:
            return {"jsonrpc": "2.0", "id": request_id, "result": result_text(f"Model request failed: {exc}", True)}
    return {"jsonrpc": "2.0", "id": request_id, "error": {"code": -32601, "message": f"Method not found: {method}"}}


def serve() -> int:
    for line in sys.stdin:
        try:
            message = json.loads(line)
            response = handle(message)
            if response is not None:
                sys.stdout.write(json.dumps(response, ensure_ascii=False, separators=(",", ":")) + "\n")
                sys.stdout.flush()
        except Exception as exc:
            # Keep stdout protocol-clean; diagnostics belong on stderr.
            print(f"ATS MCP server error: {exc}", file=sys.stderr, flush=True)
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Local ATS review MCP server.")
    parser.add_argument("--setup", action="store_true", help="Print client setup instructions and exit.")
    args = parser.parse_args()
    if args.setup:
        print(setup_instructions())
        return 0
    return serve()


if __name__ == "__main__":
    raise SystemExit(main())
