# @basis/cqi-mcp

<!-- mcp-name: io.github.basis-protocol/cqi-mcp -->

**Basis Protocol — CQI MCP.** Composition: CQI pair lookups, portfolio and
collateral stress, report generation (Basel SCO60, MiCA, GENIUS), RQS,
contagion traversal.

> **Scaffold release.** This package publishes the `@basis/cqi-mcp`
> namespace with no tools registered yet. The server responds to
> `tools/list` with an empty array while the composition feature set is
> being built out. See [`mcp_split_plan.md`](../../mcp_split_plan.md).

## Install

```bash
npx @basis/cqi-mcp
```

## Tools

_None yet._ Planned:

| Tool | Purpose |
|------|---------|
| `get_cqi_pair` | Collateral-quality pair lookup. |
| `stress_portfolio` | Apply stress scenarios to a portfolio. |
| `generate_report` | Basel SCO60 / MiCA / GENIUS report generation. |
| `compute_rqs` | Residual-quality score. |
| `traverse_contagion` | Contagion-graph traversal from an entity. |

## Claude Desktop

```json
{
  "mcpServers": {
    "basis-cqi": {
      "command": "npx",
      "args": ["-y", "@basis/cqi-mcp"]
    }
  }
}
```

## Cursor

```json
{
  "mcpServers": {
    "basis-cqi": {
      "command": "npx",
      "args": ["-y", "@basis/cqi-mcp"]
    }
  }
}
```

## Links

- [basisprotocol.xyz](https://basisprotocol.xyz)
- [GitHub](https://github.com/basis-protocol/basis-mcp)
