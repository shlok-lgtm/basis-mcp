# @basis/cqi-mcp

<!-- mcp-name: io.github.basis-protocol/cqi-mcp -->

**Basis Protocol — CQI MCP.** Composition Quality Index reads:
asset-in-protocol CQI, full matrix, and pool-wallet contagion traversal.

## Install

```bash
npx @basis/cqi-mcp
```

## Tools

| Tool | Input | Output summary |
|------|-------|----------------|
| `cqi_compose` | `asset: string`, `protocol: string` | CQI object for the stablecoin-in-protocol pair. |
| `cqi_matrix` | — | CQI matrix across all scored stablecoin × protocol combinations. |
| `cqi_contagion_traversal` | `protocol_slug`, `stablecoin_symbol`, `depth?: 1–3` | CQI object with nested `.contagion` summary. Returns `contagion.status = "no_pool_wallets"` when pool-wallet data has not yet been collected for the pair. |

## Notes

- `cqi_compose` wraps `GET /api/compose/cqi?asset=&protocol=` — it's an
  asset-in-protocol composition, not a coin-pair lookup. Names like
  `cqi_pair_lookup` would misrepresent the endpoint; `cqi_compose`
  matches reality.
- `cqi_contagion_traversal`: the server returns a success (200) response
  with `contagion.status = "no_pool_wallets"` when the collector has not
  yet populated the `protocol_pool_wallets` table for the requested
  pair. The tool surfaces that as a valid result, not an error.

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
