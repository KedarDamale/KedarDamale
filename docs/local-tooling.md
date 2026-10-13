# Local résumé and job-search tools

Run these commands from the repository root. The profile README is reserved for public presentation.

## Local ATS Resume Review

### Optional invisible keyword layer

Edit `resume/content/ats-keywords.tex` to add keywords to the PDF's text layer without changing its visible layout. The catalog covers DS, AI, ML, statistics, NLP, computer vision, GenAI, data engineering, cloud, and MLOps. Requested institution search tags are separate from the education entries and explicitly state that no affiliation is claimed. Run `make resume` to rebuild. Change `\atskeywordstrue` to `\atskeywordsfalse` in that file to disable the layer. Use normal LaTeX escaping, such as `\&` for an ampersand. Longer lists automatically scale into the same 8pt footer space.

The layer uses PDF invisible text rendering, rather than white text or PDF metadata. It remains accessible through text extraction, search, accessibility tools, and copy/paste; it is not secret. ATS software may ignore invisible text, and this does not guarantee a higher score. Include only terms you can substantiate. To inspect what a local text extractor reads, run `pdftotext output/resume-YYYYMMDD.pdf -`.

`make resume` compiles `resume/main.tex` and keeps exactly one PDF at `output/resume-YYYYMMDD.pdf`. The version date comes from the latest Git commit affecting `resume/`; use `make resume RESUME_VERSION=YYYYMMDD` to override it. Compilation runs in a temporary directory, old resume PDFs are removed after a successful build, and download links are updated automatically. `make ats` uses the PDF in `output/` by default and asks for a target role, company context, optional job description, provider, model, and reasoning effort.

```sh
make ats
```

Paste company context and the job description, finishing each with a line containing only `.`. Enter `none` on the first line when you do not have company context or a job description. The review scans substantive public GitHub project READMEs through `gh`, compares current evidence against the target, scores the resume out of 100, and estimates the impact of truthful edits and future skill/project work. GitHub scanning needs an authenticated `gh` CLI.

The interactive flow lists installed providers and offers provider-specific model and effort options. Codex includes GPT-6 Astra/Sol/Luna and GPT-5.6 Sol/Terra/Luna, plus a custom model ID. For scripted runs, use `python3 scripts/ats.py --role "Data Scientist" --job-description job.txt --provider codex --model gpt-5.6-terra --effort high`.

To use OpenRouter explicitly, set `OPENROUTER_API_KEY` and run with `--provider openrouter`. Its default model is `openrouter/auto`; ATS requests the `max` quality tier and prints the concrete model selected when the response arrives. Standard pricing for that model applies. Use `ATS_OPENROUTER_MODEL` to pin a model ID.

### Connect it to an MCP client

The local MCP server exposes `ats_review_resume` and `ats_setup`. Run `make ats-setup` for commands and configuration snippets for Codex, Claude Code, GitHub Copilot CLI, and Antigravity. For example:

```sh
codex mcp add ats -- python3 "$PWD/scripts/ats_mcp.py"
claude mcp add --transport stdio ats -- python3 "$PWD/scripts/ats_mcp.py"
copilot mcp add ats -- python3 "$PWD/scripts/ats_mcp.py"
```

Antigravity can use the same stdio server from its MCP manager or its `mcp_config.json`. Set `OPENROUTER_API_KEY` in the MCP host's environment to route MCP reviews through OpenRouter Auto. The MCP server also has an `ats_setup` tool and an `ats://setup` resource with these instructions.

## Live Job Search

Run `make jobs` to search the live internet for active vacancies and print company names, job titles, application links, required experience, dates, company ratings and evidence in three tiers. This search uses no resume or GitHub project content. It requires an authenticated Codex or Claude Code CLI with working web search; `auto` chooses Codex first, then Claude if Codex is not installed.

```sh
make jobs
make jobs JOBS_PROVIDER=claude JOBS_MODEL=sonnet JOBS_EFFORT=high
make jobs JOBS_PROVIDER=codex JOBS_EFFORT=high JOBS_TIMEOUT=900
python3 scripts/jobs.py --json
```

Edit `scripts/jobs.py` to set preferences. Defaults preserve Pune as priority 0, Mumbai and India-eligible Remote as priority 1, Data Scientist / ML Engineer / AI Engineer titles, 1.5 years of experience, and a mandatory mean Glassdoor/AmbitionBox overall rating of at least 3.5/5. Both company ratings and their source URLs are required; unavailable ratings exclude the company rather than guessing its quality. Closed/unverified vacancies, incompatible experience, other locations and original posting dates older than 30 days are excluded.

| Tier | Qualification |
| --- | --- |
| Must apply | First-priority location, verified experience fit, original posting within 7 days |
| Should apply | Any preferred location, verified experience fit, original posting within 14 days, excluding Must apply |
| Put it in stash | Otherwise qualifying active listings up to 30 days old, or unknown posting date / required experience; these gaps are marked for checking |

Each tier sorts by location priority first, then freshness, then company rating. There is no fixed count or padding: zero, two or ten qualifying jobs are shown as found. Distinct employer requisitions remain separate; duplicate URLs and matching requisition IDs are collapsed. Discovery is model-assisted and cannot guarantee exhaustive coverage; the report includes queries, exclusions, blocked-source warnings and provider-reported evidence. Employer pages can change after verification.

### Connect the Jobs MCP server

```sh
make jobs-setup
codex mcp add jobs -- make --silent -C "$PWD" jobs-mcp
claude mcp add --transport stdio jobs -- make --silent -C "$PWD" jobs-mcp
```

`make jobs-mcp` starts the stdio MCP server. It exposes `jobs_find_active`, `jobs_preferences`, `jobs_setup`, `jobs://setup` and `jobs://preferences`. `jobs_find_active` accepts optional title, experience, location-priority, rating, freshness and timeout overrides; it returns a readable report plus structured tiers. Configure `JOBS_PROVIDER`, `JOBS_MODEL`, `JOBS_EFFORT` and `JOBS_TIMEOUT` in the Makefile for both console and MCP searches. For example, `make jobs-mcp JOBS_MODEL=gpt-5.6-terra JOBS_EFFORT=xhigh`. Start connected clients through the Make command above so they pick up Makefile settings; restart the MCP server after editing them. A server started directly through Python defaults to Codex, `gpt-5.6-terra`, and `xhigh`, and accepts these settings through environment variables. Individual MCP tool calls cannot override the server's provider/model/effort. `make jobs` uses the same search and ranking functions as the MCP tool. Searches run in a temporary workspace, with shell tools disabled for Codex and only WebSearch/WebFetch allowed for Claude; nested job searches are disabled. Progress is printed to stderr every 15 seconds while the provider runs.

