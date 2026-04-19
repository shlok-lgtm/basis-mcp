# Blockers — MCP server split session 2026-04-19

This file logs discrepancies between the task brief and the canonical repo
state. Per guardrails, I did not invent file paths or tools — I halted,
logged, and continued with what exists.

## Blocker 1 — Tool count: 14 claimed, 8 present

The task brief states: "14 MCP tools ship today in one monolithic server."

The actual source at `artifacts/basis-mcp/src/tools.ts` registers **8 tools**,
and the historical spec at
`attached_assets/basis_mcp_spec_1774317886356.md` line 585 confirms
"Register 8 tools on the McpServer using server.registerTool()".

The 8 tools present:

1. `get_stablecoin_scores`
2. `get_stablecoin_detail`
3. `get_wallet_risk`
4. `get_wallet_holdings`
5. `get_riskiest_wallets`
6. `get_scoring_backlog`
7. `check_transaction_risk`
8. `get_methodology`

The 6 tools the task brief implies but that do not exist in this repo
(inferred from the target-server descriptions — CQI pair lookups,
portfolio/collateral stress, report generation for Basel SCO60 / MiCA /
GENIUS, RQS, contagion traversal, TLSNotary provenance, CDA snapshots,
pulse, divergence detectors, oracle stress events, coherence drops,
discovery feed) are not in `artifacts/basis-mcp/`.

**Decision:** Proceed with the 8 real tools. Do not scaffold fictional
tools. Flag the gap here and in `mcp_split_plan.md`.

## Blocker 2 — All 8 existing tools map to oracle-mcp only

Given the canonical target-server descriptions:

- `oracle-mcp`: Score reads (SII/PSI/RPI/accruing indices)
- `cqi-mcp`: Composition — CQI pairs, stress, reports, RQS, contagion
- `witness-mcp`: Evidence — attestation hashes, TLSNotary, CDA snapshots
- `divergence-mcp`: Live signals — pulse, divergence, coherence drops

All 8 existing tools are SII-score reads (with `check_transaction_risk`
being a composite that internally only calls score-read endpoints). None
cleanly belong under cqi, witness, or divergence.

**Decision:** `oracle-mcp` ships with all 8 tools today.
`cqi-mcp`, `witness-mcp`, `divergence-mcp` are scaffolded with zero tools
each — they build, they respond to `tools/list` (returning an empty
array), and they are ready for the respective feature teams to populate.
This keeps the package namespaces reserved on the registry and matches
the `basis-hub` agent-card.json capability categorization.

No fifth `@basis/core-mcp` package is needed — every existing tool has a
clean home.

## Blocker 3 — `basis-hub` agent-card.json is external

The task references a companion session in `basis-hub` that generated
`/.well-known/agent-card.json`. That file is not in this repo. Names
chosen here (oracle / cqi / witness / divergence) match the four
categories the brief specifies; if `basis-hub` drifted, reconcile in a
follow-up.

## Blocker 4 — Legacy `pnpm-workspace.yaml` does not include `packages/*`

The current workspace globs are `artifacts/*`, `lib/*`,
`lib/integrations/*`, `scripts`. Resolved in this session by adding
`packages/*`. No destructive changes to existing globs.
