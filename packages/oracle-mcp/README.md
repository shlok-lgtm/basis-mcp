# @basis/oracle-mcp

<!-- mcp-name: io.github.basis-protocol/oracle-mcp -->

**Basis Protocol — Oracle MCP.** Score reads for SII, PSI, RPI, and the six
accruing indices across stablecoins and on-chain wallets.

## Install

```bash
npx @basis/oracle-mcp
```

## Tools

| Tool | Input | Output summary |
|------|-------|----------------|
| `get_stablecoin_scores` | `min_grade?`, `sort_by?` | `{ stablecoins[], count, formula_version, timestamp, methodology_summary }` |
| `get_stablecoin_detail` | `coin: string` | Full SII breakdown: categories, structural subscores, weakest/strongest category. |
| `get_wallet_risk` | `address: 0x…` | `{ risk_score, risk_grade, concentration, coverage, risk_interpretation }` |
| `get_wallet_holdings` | `address: 0x…` | `{ holdings[], scored_value, unscored_value, indexed_at }` |
| `get_riskiest_wallets` | `limit?: 1–100` | `{ wallets[], count, total_at_risk_capital, timestamp }` |
| `get_scoring_backlog` | `limit?: 1–100` | `{ backlog[], count, total_unscored_value, timestamp }` |
| `check_transaction_risk` | `from_address`, `to_address`, `asset_symbol` | `{ transaction_risk, asset, sender, receiver, timestamp }` |
| `get_methodology` | — | SII formula, weights, grade scale, verification metadata. |

## Claude Desktop

```json
{
  "mcpServers": {
    "basis-oracle": {
      "command": "npx",
      "args": ["-y", "@basis/oracle-mcp"]
    }
  }
}
```

## Cursor

```json
{
  "mcpServers": {
    "basis-oracle": {
      "command": "npx",
      "args": ["-y", "@basis/oracle-mcp"]
    }
  }
}
```

## HTTP transport

```bash
npx @basis/oracle-mcp --http   # PORT defaults to 3000, endpoint /mcp
```

## Links

- [basisprotocol.xyz](https://basisprotocol.xyz)
- [GitHub](https://github.com/basis-protocol/basis-mcp)
