# @basis-protocol/mcp-server

<!-- mcp-name: io.github.basis-protocol/basis-mcp -->

> ### ⚠️ DEPRECATED — use the split servers instead
>
> This monolithic server is superseded by four scoped servers, each aligned
> with a capability category from `basis-hub`'s agent-card.json:
>
> | New server | Scope | Package |
> |------------|-------|---------|
> | `@basis/oracle-mcp` | Score reads (SII, PSI, RPI, accruing indices) | [`packages/oracle-mcp`](../../packages/oracle-mcp) |
> | `@basis/cqi-mcp` | Composition (CQI pairs, stress, Basel/MiCA/GENIUS reports, RQS, contagion) | [`packages/cqi-mcp`](../../packages/cqi-mcp) |
> | `@basis/witness-mcp` | Evidence (attestations, TLSNotary, CDA snapshots) | [`packages/witness-mcp`](../../packages/witness-mcp) |
> | `@basis/divergence-mcp` | Live signals (pulse, divergence, oracle stress, coherence, discovery) | [`packages/divergence-mcp`](../../packages/divergence-mcp) |
>
> All 8 legacy tools now live in `@basis/oracle-mcp`. This package remains
> published and functional — no action required for existing consumers —
> but **new integrations should install the scoped packages** instead.

MCP server for Basis Protocol — verifiable risk intelligence for on-chain finance.

Query stablecoin integrity scores, wallet risk profiles, transaction risk assessment, and scoring methodology across 44,000+ wallets tracking $67B+ in stablecoin value.

## Install

```bash
npx @basis-protocol/mcp-server
```

## Tools

| Tool | Description |
|------|-------------|
| `get_stablecoin_scores` | All scored stablecoins with SII scores and grades |
| `get_stablecoin_detail` | Full score breakdown for a specific stablecoin |
| `get_wallet_risk` | Risk profile for any Ethereum wallet |
| `get_wallet_holdings` | Per-asset holdings breakdown with SII scores |
| `get_riskiest_wallets` | Wallets with most at-risk capital |
| `get_scoring_backlog` | Unscored assets ranked by capital exposure |
| `check_transaction_risk` | Composite risk assessment: asset + sender + receiver |
| `get_methodology` | Current SII formula, weights, and version |

## Usage with Claude Desktop

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

## Usage with HTTP transport

```bash
npx @basis-protocol/mcp-server --http
# Listens on port 3000, endpoint: /mcp
```

## Data

- 17 stablecoins scored (SII v1.0.0)
- 44,000+ wallets indexed on Ethereum mainnet
- $67B+ in stablecoin value tracked
- Risk scores, concentration analysis (HHI), coverage quality
- Deterministic, version-controlled methodology

## Links

- [Live Dashboard](https://basisprotocol.xyz)
- [GitHub](https://github.com/basis-protocol/basis-mcp)
- [Basis Protocol](https://basisprotocol.xyz)
