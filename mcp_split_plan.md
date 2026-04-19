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

## Final tool distribution (after 2026-04-19 shape-discovery session)

Shapes were verified against `basis-hub/app/server.py` on GitHub —
sandbox blocks direct outbound to `basisprotocol.xyz`. See
`shapes_discovered.md` for per-endpoint handler line numbers and
passthrough notes.

| Package | Tools | Endpoints wrapped |
|---------|-------|-------------------|
| `@basis/oracle-mcp` | 8 | `/api/scores`, `/api/scores/{coin}`, `/api/wallets/{addr}`, `/api/wallets/riskiest`, `/api/backlog`, `/api/methodology` (plus two composite wrappers) |
| `@basis/cqi-mcp` | **3** | `/api/compose/cqi`, `/api/compose/cqi/matrix`, `/api/cqi/{protocol_slug}/{stablecoin_symbol}/contagion` |
| `@basis/witness-mcp` | **2** | `/api/cda/issuers`, `/api/cda/issuers/{symbol}/latest` |
| `@basis/divergence-mcp` | **4** | `/api/pulse/latest`, `/api/discovery/latest`, `/api/coherence/latest`, `/api/divergence` |
| **Total** | **17** | |

### `cqi-mcp` tools

1. **`cqi_compose`** → `GET /api/compose/cqi?asset=&protocol=`
   - Renamed from the brief's proposed `cqi_pair_lookup`. The endpoint
     takes `asset` + `protocol` (asset-in-protocol CQI), not
     `coin_a` + `coin_b`. Tool name now matches reality per the
     "rename if the endpoint name suggests more than it returns"
     guardrail.
2. **`cqi_matrix`** → `GET /api/compose/cqi/matrix`
3. **`cqi_contagion_traversal`** → `GET /api/cqi/{protocol_slug}/{stablecoin_symbol}/contagion?depth=`
   - Handles `{ contagion: { status: "no_pool_wallets", message } }`
     nested result as a valid passthrough response.

### `witness-mcp` tools

1. **`evidence_list_issuers`** → `GET /api/cda/issuers`
2. **`evidence_latest_for_issuer`** → `GET /api/cda/issuers/{symbol}/latest`

Package name stays `@basis/witness-mcp` (Witness is the product brand)
but wraps CDA endpoints (`/api/cda/*`). There is no `/api/witness/*`
route on the hub.

### `divergence-mcp` tools

1. **`latest_pulse`** → `GET /api/pulse/latest`
2. **`divergence_stream`** → `GET /api/discovery/latest` (top-20
   novelty-ranked signals from the last 7 days)
3. **`coherence_drops_latest`** → `GET /api/coherence/latest`
4. **`divergence_signals`** → `GET /api/divergence?hours=&force=`
   (distinct shape from `/api/discovery/latest` — this is the
   specific asset-quality-vs-flow + wallet-concentration-vs-value
   detector output; discovery is generic novelty feed)

## FUTURE — not implemented, flagged for backlog

- **`attestation_verify(content_hash)`** — the brief explicitly said
  DO NOT implement because no hub endpoint exists. Discovered during
  shape audit that `GET /api/provenance/verify/{attestation_hash}`
  exists (hub line 7943) — this is for TLSNotary provenance
  verification, not CDA content-hash verification. If the witness-mcp
  team later wants an attestation-verify tool, this provenance route
  is the candidate wrap. Not adding in this session per brief.

- **`oracle_stress_events`** → `/api/oracle/stress-events/active`
  does NOT exist on the hub (confirmed by grep of server.py). Per
  V9.2 Pipeline 10, the surface is specified but not yet built.
  Flagged for future addition once the hub ships it.

- **`rqs_lookup`** / **`rqs_matrix`** — `/api/compose/rqs` and
  `/api/compose/rqs/{slug}` both exist on the hub (lines 5966, 5973).
  Not in any of the tool-wrap briefs this session. Candidate addition
  to `@basis/cqi-mcp` (RQS is a sibling composition score to CQI).

## No fifth `@basis/core-mcp`

The task brief says create a fifth `@basis/core-mcp` only if tools don't
fit the four targets. All 17 shipped tools fit cleanly in the four
target servers, so no fifth package is created.

## No fifth `@basis/core-mcp`

The task brief says create a fifth `@basis/core-mcp` only if tools don't
fit the four targets. All 8 real tools fit cleanly in `oracle-mcp`, so no
fifth package is created.

## Legacy monolithic server

`artifacts/basis-mcp/` (`@basis-protocol/mcp-server`, registry name
`io.github.basis-protocol/basis-mcp`) stays published and functional.
Root README gains a DEPRECATED notice pointing to the four new packages.
Do not unpublish in this session — consumers still reference it.
