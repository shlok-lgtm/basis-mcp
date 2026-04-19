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

## Blocker 5 — CQI tool-wrap session: endpoint shapes not provided

The `Wrap cqi-mcp tools` prompt contains a literal unfilled placeholder:

```
Reference endpoint shapes (already verified from basis-hub):
[PASTE ENDPOINT SHAPES for /api/cqi and /api/cqi/{slug}/{symbol}/contagion]
```

No endpoint shapes were pasted. I also cannot verify the shapes locally:

- `lib/api-spec/openapi.yaml` only documents `GET /healthz`. No `/api/cqi`
  or `/api/cqi/{slug}/{symbol}/contagion` routes exist in the spec.
- No TypeScript types, zod schemas, or response fixtures for CQI appear
  anywhere under `lib/`, `artifacts/`, or `attached_assets/`.
- The reference repo `basis-hub` is not accessible from this workspace.

Per guardrail "Do NOT invent endpoints the hub doesn't expose" and "Tool
names must match actual response shape, not aspirational capability",
I did not implement `cqi_pair_lookup`, `cqi_contagion_traversal`, or any
optional `cqi_composition_compose` / `rqs_lookup` tool. Implementing
them from the suggested names alone would ship tools that 404 or return
unvalidated shapes in production.

**Resolution needed:** paste the actual response shapes for
`GET /api/cqi?coin_a=…&coin_b=…` and
`GET /api/cqi/{slug}/{symbol}/contagion`. At minimum: status codes, top-level
JSON schema (field names + types), and any query-param constraints. Also
confirm whether `/api/compose/cqi` or `/api/rqs` exists. Then I will
register the tools with real input/output schemas.

`packages/cqi-mcp` remains in its scaffold state — builds cleanly,
responds to `tools/list` with `{ tools: [] }`, namespace reserved.

## Blocker 6 — Witness tool-wrap session: endpoint shapes not provided

The `Wrap witness-mcp tools` prompt contains the same unfilled placeholder:

```
Reference endpoint shapes:
[PASTE ENDPOINT SHAPES for /api/witness and evidence-fetch routes]
```

Same situation as Blocker 5:

- No `/api/witness`, `/api/witness/issuers`, `/api/witness/hash/{hash}`,
  `/api/attestation/{hash}`, or `/api/provenance/{source}/latest` routes
  are documented in `lib/api-spec/openapi.yaml`.
- No evidence / attestation / TLSNotary types or fixtures in the repo.
- The brief itself hedges on paths ("likely /api/witness or
  /api/witness/issuers", "likely /api/witness/hash/{hash} or
  /api/attestation/{hash}"), which is exactly the ambiguity the
  "do not invent" guardrail forbids resolving by guessing.

Per the same guardrail I did not implement `evidence_lookup`,
`attestation_verify`, or the optional `tlsnotary_proof_lookup`.

**Resolution needed:** paste the actual witness / attestation endpoint
paths and response shapes. Specifically: does TLSNotary come inline with
`attestation_verify`, or is there a separate provenance route? What are
the exact field names for attestation metadata (domain, timestamp,
state_root, verification_path)? What does the evidence-list response
look like when filtered by issuer vs. entity_slug?

`packages/witness-mcp` remains in its scaffold state — builds cleanly,
responds to `tools/list` with `{ tools: [] }`, namespace reserved.

## Blocker 7 — Divergence tool-wrap session: endpoint shapes not provided

The `Wrap divergence-mcp tools` prompt contains the same unfilled placeholder:

```
Reference endpoint shapes:
[PASTE ENDPOINT SHAPES for /api/pulse/latest, /api/discovery/latest,
/api/oracle/stress-events/active, /api/coherence/latest]
```

None of those routes (`/api/pulse/latest`, `/api/discovery/latest`,
`/api/oracle/stress-events/active`, `/api/coherence/latest`) are
documented in `lib/api-spec/openapi.yaml`, and no fixtures or types
exist elsewhere in the repo.

Additional open questions the brief surfaces but cannot answer without
the shapes:

- Does `/api/pulse/latest` accept a `window_hours` query param, or
  return a single snapshot with a fixed window? The brief hedges ("if
  endpoint supports window params") — guessing here would bake a
  silently-ignored parameter into a production tool.
- Does `/api/discovery/latest` paginate by `since_timestamp` or
  `cursor`? The brief says "whichever" — these produce different
  client contracts.
- What is the "timestamp field" contract that agents poll against?
  The brief requires one for staleness detection but does not
  specify the field name (`timestamp` vs `generated_at` vs
  `as_of` vs `computed_at`).
- Does `@basis/mcp-shared`'s `apiFetch` need a cache-control opt-out
  for these polled endpoints? Currently it sets only `Accept:
  application/json` — no cache headers either way. That may or may
  not be acceptable once real agents poll at high cadence.

Per the same guardrail I did not implement `latest_pulse`,
`divergence_stream`, `oracle_stress_events_active`, or
`coherence_drops_latest`.

**Resolution needed:** paste the actual response shapes and query-param
surface for the four divergence routes, and confirm the timestamp-field
name. Also confirm whether the polled-endpoint cache-control concern
applies — if so I will add an explicit `Cache-Control: no-cache` path
in the shared client.

`packages/divergence-mcp` remains in its scaffold state — builds
cleanly, responds to `tools/list` with `{ tools: [] }`, namespace
reserved.
