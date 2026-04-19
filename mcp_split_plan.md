# MCP Server Split Plan — 2026-04-19

## Source audit

Monolithic server source: `artifacts/basis-mcp/src/`
  - `index.ts`   — McpServer bootstrap, stdio + streamable-http transports
  - `tools.ts`   — 8 `server.registerTool(...)` calls
  - `api.ts`     — `fetch()`-based HTTP client for basisprotocol.xyz
  - `config.ts`  — BASE_URL, timeouts, grade helpers, response types

Package name: `@basis-protocol/mcp-server`
Registry name: `io.github.basis-protocol/basis-mcp`
Version: 1.1.1

## Discrepancy with task brief

Task brief says 14 tools. Actual source ships **8 tools**. The historical
spec at `attached_assets/basis_mcp_spec_1774317886356.md:585` also says
8. See `blockers.md`.

## Tool-to-target-server mapping

| Tool name | Current location | Target server | Category-fit | Notes |
|-----------|------------------|---------------|--------------|-------|
| `get_stablecoin_scores`  | `tools.ts:55`  | `@basis/oracle-mcp` | Clean — SII score read | `GET /api/scores` |
| `get_stablecoin_detail`  | `tools.ts:127` | `@basis/oracle-mcp` | Clean — SII score read | `GET /api/scores/{coin}` |
| `get_wallet_risk`        | `tools.ts:204` | `@basis/oracle-mcp` | Clean — wallet risk-score read | `GET /api/wallets/{addr}` |
| `get_wallet_holdings`    | `tools.ts:285` | `@basis/oracle-mcp` | Clean — wallet score read | Shares fetch with `get_wallet_risk` |
| `get_riskiest_wallets`   | `tools.ts:365` | `@basis/oracle-mcp` | Clean — score-ranked list read | `GET /api/wallets/riskiest` |
| `get_scoring_backlog`    | `tools.ts:429` | `@basis/oracle-mcp` | Coverage metric, score-adjacent | `GET /api/backlog` |
| `check_transaction_risk` | `tools.ts:489` | `@basis/oracle-mcp` | Composite of three score reads; no CQI pair lookup or stress logic, so it stays in oracle | Calls `fetchScoreDetail` + two `fetchWalletProfile` |
| `get_methodology`        | `tools.ts:685` | `@basis/oracle-mcp` | Describes the SII formula that powers oracle reads | `GET /api/methodology` |

**None of the 8 tools map to `cqi-mcp`, `witness-mcp`, or `divergence-mcp`.**
Those servers are scaffolded empty (see "Empty scaffolds" below) so their
namespaces are reserved and the registry entries are ready when their
respective feature teams ship tools.

## Target layout

```
basis-mcp/
├── packages/
│   ├── shared/          @basis/mcp-shared  — HTTP client, types, grade helpers
│   ├── oracle-mcp/      @basis/oracle-mcp  — 8 tools (all of them, for now)
│   ├── cqi-mcp/         @basis/cqi-mcp     — 0 tools (scaffold)
│   ├── witness-mcp/     @basis/witness-mcp — 0 tools (scaffold)
│   └── divergence-mcp/  @basis/divergence-mcp — 0 tools (scaffold)
├── artifacts/basis-mcp/  legacy monolith — DEPRECATED, still functional
└── ...
```

Shared imports use `workspace:*` protocol. No code duplication across
servers — `shared` owns `fetch`, grade helpers, `formatMoney`, response
types, API_ERROR_RESPONSE, and the `BASE_URL` / `API_TIMEOUT_MS` constants.

## Empty scaffolds — what each future server will eventually hold

Per the target-server descriptions in the task brief (recorded for the
teams who will fill these in):

- **`cqi-mcp` — Composition**: CQI pair lookups, portfolio/collateral
  stress tests, report generation (Basel SCO60, MiCA, GENIUS), RQS,
  contagion traversal.

  **Status 2026-04-19 (second attempt):** 0 tools. Attempted wrap of
  `/api/compose/cqi`, `/api/compose/cqi/matrix`, and
  `/api/cqi/{slug}/{symbol}/contagion`. Halted — the reference paste
  (`/tmp/endpoint_shapes.md`) was not present on this machine, and the
  brief's own input contracts for pair-lookup and matrix are hedged
  ("or whatever the endpoint takes"). See `blockers.md` §8. Contagion
  endpoint's `no_pool_wallets` edge case recorded there for the resume.

- **`witness-mcp` — Evidence**: evidence lookups, attestation hashes,
  TLSNotary provenance proofs, CDA snapshots.

- **`divergence-mcp` — Live signals**: pulse feed, divergence detectors,
  oracle stress events, coherence drops, discovery feed.

These servers are published as placeholders so the registry namespaces
(`io.github.basis-protocol/oracle-mcp` etc.) are reserved and `basis-hub`
agent-card.json resolves.

## No fifth `@basis/core-mcp`

The task brief says create a fifth `@basis/core-mcp` only if tools don't
fit the four targets. All 8 real tools fit cleanly in `oracle-mcp`, so no
fifth package is created.

## Legacy monolithic server

`artifacts/basis-mcp/` (`@basis-protocol/mcp-server`, registry name
`io.github.basis-protocol/basis-mcp`) stays published and functional.
Root README gains a DEPRECATED notice pointing to the four new packages.
Do not unpublish in this session — consumers still reference it.
