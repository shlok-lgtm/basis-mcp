# Basis Protocol MCP Server

<!-- mcp-name: io.github.shlok-lgtm/basis-mcp -->

Decision integrity infrastructure for on-chain finance. Verifiable risk scores for stablecoins and wallet risk profiles via the Basis Protocol API.

## Overview

The `@basis-protocol/mcp-server` exposes 8 MCP tools that let any AI agent verify the risk state of stablecoins and Ethereum wallets before executing financial decisions. It connects to the Basis Protocol API (`https://basis-demo.replit.app`) over HTTPS — no database access, no private keys, no internal dependencies.

## Tools

| Tool | Purpose |
|------|---------|
| `get_stablecoin_scores` | SII scores for all scored stablecoins |
| `get_stablecoin_detail` | Full breakdown for a specific stablecoin |
| `get_wallet_risk` | Composite risk profile for an Ethereum wallet |
| `get_wallet_holdings` | Per-asset holdings with SII scores |
| `get_riskiest_wallets` | Wallets with the most capital at risk |
| `get_scoring_backlog` | Unscored assets ranked by exposure |
| `check_transaction_risk` | Pre-transaction risk gate (asset + sender + receiver) |
| `get_methodology` | SII formula, weights, grade scale, data sources |

## Usage

### Claude Desktop (stdio)

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "basis-protocol": {
      "command": "npx",
      "args": ["-y", "@basis-protocol/mcp-server"]
    }
  }
}
```

### Hosted HTTP

```
POST https://mcp.basisprotocol.xyz/mcp
```

The HTTP endpoint supports the MCP Streamable HTTP transport for remote/cloud agent integrations.

## Build

```bash
pnpm install
pnpm run build
```

## Run

```bash
# stdio (default — for Claude Desktop, Cursor, etc.)
node build/index.js

# Streamable HTTP server (for cloud agents)
node build/index.js --http
PORT=3000 node build/index.js --http
```

## License

MIT
