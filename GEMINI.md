# Project AI Rules & Protocols

## 1. Code Review Knowledge Graph Protocol
- **Update on Every Conversation**: On every new conversation or task session start, the agent must ensure the project code review graph is updated by invoking the `code-review-graph` MCP tool:
  ```json
  Server: "code-review-graph"
  Tool: "build_or_update_graph_tool"
  Arguments: { "repo_root": "c:/Users/ASUS/Documents/GitHub/codekrafters---web3-builder-guild", "full_rebuild": false, "postprocess": "full" }
  ```
- **Context-Aware Code Reviews**: When auditing code, refactoring, or planning architectural changes, query the graph tools (`get_architecture_overview_tool`, `detect_changes_tool`, `get_impact_radius_tool`, `list_communities_tool`) to verify structural impact and cross-module dependencies.

## 2. Caveman Compression Protocol (After 5 Prompts)
- **Prompt Count Tracking**: Track conversation turns / user prompt count.
- **5+ Prompt Trigger**: After 5 prompts in a conversation, switch to Caveman compression:
  - Strip filler words, polite fluff, conversational pleasantries, and unnecessary articles (`a`, `an`, `the`).
  - Keep sentences ultra-terse, punchy, and information-dense (`[thing] [action] [reason]. [next step].`).
  - Preserve all code blocks, backticks, symbol names, file paths, commands, and URLs with 100% fidelity.
  - For memory/context files, compress prose using `.agents/scripts/caveman_compress.py`.

## 3. Antigravity Additive Architecture
- Non-destructive extensions: Decorators and Higher-Order Functions preferred over mutating base structures.
- Delta state management and scoped namespaces.
