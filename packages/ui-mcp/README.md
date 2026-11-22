# Utkristi UI MCP

Build the server from this repository with `npm run build:mcp`. Add the generated entry to your MCP client's local server configuration.

```json
{
  "mcpServers": {
    "utkristi-ui": {
      "command": "node",
      "args": ["/absolute/path/to/utkristi-ui/packages/ui-mcp/dist/server.mjs"]
    }
  }
}
```

The server uses newline-delimited JSON-RPC over stdio and negotiates the 2024 and 2025 handshake revisions. It runs on Node.js 18 or newer. The package can be packed locally with `npm pack ./packages/ui-mcp` after building.

| Tool | Inputs |
| --- | --- |
| `search_components` | `query`, optional `limit` |
| `get_component` | Component name or slug as `name` |
| `get_example` | Example `id`, optional `format` of `tsx` or `html` |
| `list_tokens` | Optional token `query` and CSS selector `scope` |
| `create_theme` | Hex `brand`, optional `name`, `scheme`, `contrast`, `density`, and `format` |
| `validate_markup` | An HTML fragment as `markup` |

Use `utkristi://components/manifest` for the generated catalog and `utkristi://design/tokens` for CSS values. The docs build emits the same reference as `/component-manifest.json`, `/llms.txt`, and per-component Markdown files.

Markup validation checks selected class combinations, accessible labels and states, local ARIA ID references, and explicit inline hex color pairs. Use a browser accessibility audit for computed styles and full interaction behavior.

Run `npm run test:mcp` from the repository root to exercise the stdio handshake, tool calls, resource reads, and invalid requests.

## Paired agent evaluation

Run the [20 tasks](evaluation/tasks.json) in fresh sessions under one model and configuration. Give both groups the same starting instructions and change only whether the server is available. Judge submissions against each task's rubric and save an array of `{ "id": "...", "pass": true, "evidence": "..." }` records per group. Run `node packages/ui-mcp/evaluation/score.mjs baseline.json with-mcp.json` to compute the difference in percentage points.
