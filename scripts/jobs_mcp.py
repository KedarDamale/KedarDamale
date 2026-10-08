#!/usr/bin/env python3
"""Local stdio MCP server for resume-independent live job discovery."""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import sys
from typing import Any

from jobs import TIERS, preferences, render_report, run_search

MCP_PROVIDER = "codex"
MCP_MODEL = "gpt-5.6-terra"
MCP_EFFORT = "xhigh"

def model_route() -> dict[str, Any]:
    """Server configuration comes from make jobs-mcp, never tool overrides."""
    return {"provider": os.environ.get("JOBS_PROVIDER", MCP_PROVIDER),
            "model": os.environ.get("JOBS_MODEL", MCP_MODEL),
            "effort": os.environ.get("JOBS_EFFORT", MCP_EFFORT) or None,
            "timeout": int(os.environ.get("JOBS_TIMEOUT", "6000"))}


def setup_instructions() -> str:
    script = str(Path(__file__).resolve())
    root = str(Path(script).parent.parent)
    config = preferences()
    return f'''# Connect the Jobs MCP server

Install and authenticate Codex. MCP searches default to gpt-5.6-terra with xhigh
reasoning effort. Configure JOBS_PROVIDER, JOBS_MODEL, JOBS_EFFORT and JOBS_TIMEOUT
in the Makefile; `make jobs-mcp` passes them to the server. For example:
`make jobs-mcp JOBS_MODEL=gpt-5.6-terra JOBS_EFFORT=xhigh`.
The server uses no resume or GitHub project context. Edit preferences
in scripts/jobs.py: location priorities, titles, experience and company rating minimum.

Console search: `make jobs` (or `make jobs JOBS_PROVIDER=claude`).
MCP stdio server: `make jobs-mcp`. Setup instructions: `make jobs-setup`.

## Codex CLI
```sh
codex mcp add jobs -- make --silent -C "{root}" jobs-mcp
```

## Claude Code
```sh
claude mcp add --transport stdio jobs -- make --silent -C "{root}" jobs-mcp
```

## Copilot CLI
```sh
copilot mcp add jobs -- make --silent -C "{root}" jobs-mcp
```

## Antigravity / other MCP clients
```json
{{"mcpServers": {{"jobs": {{"command": "make", "args": ["--silent", "-C", "{root}", "jobs-mcp"]}}}}}}
```

Ask the client to call `jobs_find_active`. `jobs_preferences` shows the defaults;
`jobs_setup` and `jobs://setup` expose these instructions. `jobs://preferences`
exposes the default preferences as JSON. JOBS_PROVIDER and JOBS_MODEL can be set
in the server environment by `make jobs-mcp`. Individual tool calls cannot override
the server's provider/model/effort configuration.

Jobs are ranked into {', '.join(TIERS)}, with no quota
or padding. Location priority precedes freshness within each tier. Must apply
requires first-priority location, verified experience fit and original posting age
<={config['must_apply_days']} days; Should apply requires verified fit and age <={config['should_apply_days']} days at any preferred
location. {TIERS[2]} includes older listings up to {config['max_age_days']} days or unknown dates/experience.
All tiers require an active detail page checked today and BOTH company ratings,
with mean >=3.5 by default. Missing ratings, low ratings, closed jobs, out-of-range
experience and other locations are excluded. India eligibility must be evidenced
for remote roles. Missing evidence and blocked pages are reported, never invented.
Live discovery is model-assisted and cannot guarantee exhaustive internet coverage.
'''


def tool_definitions() -> list[dict[str, Any]]:
    return [
        {"name": "jobs_find_active", "title": "Find and rank active jobs",
         "description": f"Search the live internet by title, required YOE and priority locations, verify active vacancies and company ratings, and return unpadded {' / '.join(TIERS)} tiers with company names, application links and evidence. Never uses resume data. May take several minutes.",
         "inputSchema": {"type": "object", "properties": {
             "timeout": {"type": "integer", "minimum": 1, "description": "Search timeout in seconds; defaults to JOBS_TIMEOUT configured in the Makefile/server environment."},
             "titles": {"type": "array", "minItems": 1, "items": {"type": "string", "minLength": 1}},
             "locations": {"type": "object", "minProperties": 1, "propertyNames": {"pattern": "^[0-9]+$"}, "additionalProperties": {"type": "array", "minItems": 1, "items": {"type": "string", "minLength": 1}}, "description": 'Priority map, e.g. {"0":["Pune"],"1":["Mumbai","Remote"]}; lower number wins.'},
             "experience_years": {"type": "number", "minimum": 0},
             "minimum_company_rating": {"type": "number", "minimum": 0, "maximum": 5},
             "must_apply_days": {"type": "integer", "minimum": 0},
             "should_apply_days": {"type": "integer", "minimum": 0},
             "max_age_days": {"type": "integer", "minimum": 0},
         }, "additionalProperties": False}},
        {"name": "jobs_preferences", "title": "Show job search preferences",
         "description": "Read configured titles, YOE, locations and company/freshness filters without searching.",
         "inputSchema": {"type": "object", "properties": {}, "additionalProperties": False}},
        {"name": "jobs_setup", "title": "Show Jobs MCP setup",
         "description": "Show connection steps, console commands, ranking rules and provider requirements.",
         "inputSchema": {"type": "object", "properties": {}, "additionalProperties": False}},
    ]


def _result(text: str, *, error: bool = False, report: dict[str, Any] | None = None) -> dict[str, Any]:
    result: dict[str, Any] = {"content": [{"type": "text", "text": text}], "isError": error}
    if report is not None:
        result["structuredContent"] = report
    return result


def handle(message: Any) -> dict[str, Any] | None:
    request_id = message.get("id") if isinstance(message, dict) else None

    def error(code: int, text: str) -> dict[str, Any]:
        return {"jsonrpc": "2.0", "id": request_id, "error": {"code": code, "message": text}}

    if not isinstance(message, dict) or not isinstance(message.get("method"), str):
        return error(-32600, "Invalid request")
    method = message["method"]
    if "id" not in message:
        return None
    params = message.get("params", {})
    if not isinstance(params, dict):
        return error(-32602, "params must be an object")
    result: dict[str, Any]
    if method == "initialize":
        result = {"protocolVersion": params.get("protocolVersion", "2024-11-05"),
                  "capabilities": {"tools": {"listChanged": False}, "resources": {"listChanged": False}},
                  "serverInfo": {"name": "jobs", "version": "1.0.0"},
                  "instructions": "Use jobs_find_active for live searches without resume data; jobs_preferences for defaults and jobs_setup for connection help."}
    elif method == "ping":
        result = {}
    elif method == "tools/list":
        definitions = tool_definitions()
        if os.environ.get("JOBS_DISABLE_SEARCH_TOOL") == "1":
            definitions = [t for t in definitions if t["name"] != "jobs_find_active"]
        result = {"tools": definitions}
    elif method == "resources/list":
        result = {"resources": [
            {"uri": "jobs://setup", "name": "Jobs MCP setup", "mimeType": "text/markdown"},
            {"uri": "jobs://preferences", "name": "Job search preferences", "mimeType": "application/json"}]}
    elif method == "resources/read":
        uri = params.get("uri")
        if uri == "jobs://setup":
            mime, content = "text/markdown", setup_instructions()
        elif uri == "jobs://preferences":
            mime, content = "application/json", json.dumps(preferences(), indent=2)
        else:
            return error(-32002, "Unknown resource")
        result = {"contents": [{"uri": uri, "mimeType": mime, "text": content}]}
    elif method == "tools/call":
        name, arguments = params.get("name"), params.get("arguments", {})
        definition = next((t for t in tool_definitions() if t["name"] == name), None)
        if not definition:
            return error(-32602, f"Unknown tool: {name}")
        if not isinstance(arguments, dict) or set(arguments) - set(definition["inputSchema"]["properties"]):
            return error(-32602, "Invalid tool arguments")
        try:
            if name == "jobs_setup":
                result = _result(setup_instructions())
            elif name == "jobs_preferences":
                result = _result(json.dumps(preferences(), indent=2))
            elif os.environ.get("JOBS_DISABLE_SEARCH_TOOL") == "1":
                result = _result("Nested job searches are disabled", error=True)
            else:
                values = dict(arguments)
                route = model_route()
                values.setdefault("timeout", route.pop("timeout"))
                values.update(route)
                report = run_search(**values)
                result = _result(render_report(report), report=report)
        except (OSError, TypeError, ValueError, RuntimeError) as exc:
            result = _result(f"Job search failed: {exc}", error=True)
    else:
        return error(-32601, f"Method not found: {method}")
    return {"jsonrpc": "2.0", "id": request_id, "result": result}


def serve() -> int:
    for line in sys.stdin:
        try:
            message = json.loads(line)
            response = handle(message)
        except json.JSONDecodeError:
            response = {"jsonrpc": "2.0", "id": None, "error": {"code": -32700, "message": "Parse error"}}
        except Exception as exc:
            print(f"Jobs MCP error: {exc}", file=sys.stderr, flush=True)
            response = {"jsonrpc": "2.0", "id": None, "error": {"code": -32603, "message": "Internal error"}}
        if response is not None:
            print(json.dumps(response, ensure_ascii=False, separators=(",", ":")), flush=True)
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--setup", action="store_true")
    args = parser.parse_args()
    if args.setup:
        print(setup_instructions())
        return 0
    return serve()


if __name__ == "__main__":
    raise SystemExit(main())
