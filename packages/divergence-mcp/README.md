# @basis/divergence-mcp

<!-- mcp-name: io.github.basis-protocol/divergence-mcp -->

**Basis Protocol — Divergence MCP.** Live signals: pulse, divergence
detectors, oracle stress events, coherence drops, discovery feed.

> **Scaffold release.** This package publishes the `@basis/divergence-mcp`
> namespace with no tools registered yet. The server responds to
> `tools/list` with an empty array while the live-signal feature set is
> being built out. See [`mcp_split_plan.md`](../../mcp_split_plan.md).

## Install

```bash
npx @basis/divergence-mcp
```

## Tools

_None yet._ Planned:

| Tool | Purpose |
|------|---------|
| `get_pulse` | Current Basis pulse readings across tracked entities. |
| `list_divergences` | Active divergence detections with severity. |
| `list_oracle_stress_events` | Recent oracle-stress events. |
| `list_coherence_drops` | Entities whose coherence score has dropped. |
| `get_discovery_feed` | Newly-discovered entities and signals. |

## Claude Desktop

```json
{
  "mcpServers": {
    "basis-divergence": {
      "command": "npx",
      "args": ["-y", "@basis/divergence-mcp"]
    }
  }
}
```

## Cursor

```json
{
  "mcpServers": {
    "basis-divergence": {
      "command": "npx",
      "args": ["-y", "@basis/divergence-mcp"]
    }
  }
}
```

## Links

- [basisprotocol.xyz](https://basisprotocol.xyz)
- [GitHub](https://github.com/basis-protocol/basis-mcp)
