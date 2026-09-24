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
The default model route is OpenRouter Auto at its highest quality tier when `OPENROUTER_API_KEY` is set; otherwise it uses an installed Claude Code, Codex, or GitHub Copilot CLI in that order. Set `ATS_PROVIDER` and `ATS_*_MODEL` to choose a specific backend/model. The server prints the chosen provider and model to stderr when a review starts; OpenRouter also prints the concrete model it resolved after the response.

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

Set `OPENROUTER_API_KEY` in the environment inherited by the MCP server. The default model is `openrouter/auto`; set `ATS_OPENROUTER_MODEL` to pin an OpenRouter model ID. OpenRouter receives the resume and job description for analysis.

## Direct console use

From the repository root, run `make ats` or `python3 scripts/ats.py --resume resume/main.tex --job-description job.txt`. The console shows the provider, selected model, and a live elapsed-time indicator while the review runs.
"""


def tool_definitions() -> list[dict[str, Any]]:
    return [
        {
            "name": "ats_review_resume",
            "title": "Score resume against job description",
            "description": "Scrutinize an ATS resume, score it out of 100, and flag evidenced strengths, gaps, parsing issues, and truthful improvements. Uses the best configured provider/model. Resume paths are read-only; default is this repository's resume/main.tex.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "resume_path": {"type": "string", "description": "Optional path to a .tex, .pdf, .docx, .txt, or .md resume."},
                    "job_description": {"type": "string", "description": "Full job description text. Leave empty for a general ATS readiness review."},
                    "provider": {"type": "string", "enum": list(PROVIDERS), "description": "Use auto (default), openrouter, claude, codex, or copilot."},
                    "model": {"type": "string", "description": "Optional model ID override."},
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
            "instructions": "Use ats_review_resume for a detailed model-routed ATS review. Use ats_setup for local MCP setup instructions.",
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
            print(f"ATS MCP review · provider: {actual_provider} · model: {route}", file=sys.stderr, flush=True)
            report = run_review(
                arguments.get("resume_path", DEFAULT_RESUME),
                str(arguments.get("job_description", "")),
                provider,
                model,
                quiet=True,
            )
            return {"jsonrpc": "2.0", "id": request_id, "result": result_text(report)}
        except Exception as exc:
            return {"jsonrpc": "2.0", "id": request_id, "result": result_text(f"ATS review failed: {exc}", True)}
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
