# Agent Instructions & Guidelines

## Code Review Graph Integration
- Mandatory sync on every new conversation:
  - Tool: `build_or_update_graph_tool` on MCP server `code-review-graph`
  - Arguments: `repo_root`: current repository root, `postprocess`: `"full"`
- Query `get_architecture_overview_tool`, `get_impact_radius_tool`, and `detect_changes_tool` for all code review and modification workflows.

## Caveman Compression (Every 5 Prompts)
- When prompt count reaches 5 or more:
  - Compress conversational context and adopt Caveman communication mode.
  - Drop pleasantries, filler phrases, hedging, and articles.
  - Exact preservation for code blocks, inline code, paths, and commands.
  - Automated hook: `.agents/hooks.json` -> `python scripts/pre_invocation_hook.py`.
