# Session summary — 2026-04-19 — MCP tool wrapping

Branch: `claude/split-mcp-servers-TfeAA`
Repo: `basis-protocol/basis-mcp`

Wraps the three scaffold packages left empty by the morning split
session (`session_summary_2026-04-19.md`). Shapes verified from
`github.com/basis-protocol/basis-hub/main/app/server.py`, not from
the brief's proposed inputs — which were partially wrong (see CQI
rename below).

## Endpoints probed and status

Sandbox blocks outbound to `basisprotocol.xyz`
(`x-deny-reason: host_not_allowed`). Shapes were read directly from
the hub source on GitHub (allowed). The "status" column is what the
handler returns per the route definition; "verified" means the handler
body + signature are in `shapes_discovered.md`.

| Endpoint | Status | Verified from |
|----------|--------|---------------|
| `GET /api/compose/cqi` | 200 / 404 | hub server.py:5808 |
| `GET /api/compose/cqi/matrix` | 200 | hub server.py:5818 |
| `GET /api/cqi/{protocol_slug}/{stablecoin_symbol}/contagion` | 200 / 404 | hub server.py:5825 |
| `GET /api/cda/issuers` | 200 | hub server.py:3284 |
| `GET /api/cda/issuers/{symbol}/latest` | 200 / 404 | hub server.py:3563 |
| `GET /api/pulse/latest` | 200 / 404 | hub server.py:5699 |
| `GET /api/discovery/latest` | 200 | hub server.py:6828 |
| `GET /api/coherence/latest` | 200 / 404 | hub server.py:1110 |
| `GET /api/divergence` | 200 | hub server.py:5768 |
| `GET /api/oracle/stress-events/active` | **DOES NOT EXIST** | grep of server.py |

## Tools shipped per server

| Package | Tools | Change |
|---------|-------|--------|
| `@basis/oracle-mcp` | 8 | unchanged from morning split |
| `@basis/cqi-mcp` | 3 | 0 → 3 (new) |
| `@basis/witness-mcp` | 2 | 0 → 2 (new) |
| `@basis/divergence-mcp` | 4 | 0 → 4 (new) |
| **Total across all four** | **17** | 8 → 17 |

### `cqi-mcp` (3 tools, `packages/cqi-mcp/src/tools.ts`)

1. **`cqi_compose`** — `GET /api/compose/cqi?asset=&protocol=`
   - Input: `{ asset: string, protocol: string }`
2. **`cqi_matrix`** — `GET /api/compose/cqi/matrix`
   - Input: `{}`
3. **`cqi_contagion_traversal`** — `GET /api/cqi/{protocol_slug}/{stablecoin_symbol}/contagion?depth=`
   - Input: `{ protocol_slug, stablecoin_symbol, depth?: 1–3 }`

### `witness-mcp` (2 tools, `packages/witness-mcp/src/tools.ts`)

1. **`evidence_list_issuers`** — `GET /api/cda/issuers`
2. **`evidence_latest_for_issuer`** — `GET /api/cda/issuers/{symbol}/latest`

### `divergence-mcp` (4 tools, `packages/divergence-mcp/src/tools.ts`)

1. **`latest_pulse`** — `GET /api/pulse/latest`
2. **`divergence_stream`** — `GET /api/discovery/latest`
3. **`coherence_drops_latest`** — `GET /api/coherence/latest`
4. **`divergence_signals`** — `GET /api/divergence?hours=&force=`

## Tools skipped, with reasons

- **`cqi_pair_lookup`** (brief's name for `/api/compose/cqi`) — renamed
  to `cqi_compose`. The endpoint takes `asset` + `protocol` (asset-
  in-protocol CQI), not `coin_a` + `coin_b` (asset pair). `cqi_compose`
  matches reality; `cqi_pair_lookup` would misrepresent the endpoint.
  Per brief guardrail: "If an endpoint name suggests more than it
  returns, rename the tool to match reality."
- **`attestation_verify`** — brief explicitly said DO NOT implement.
  Honored. See FUTURE below for a related route that does exist.
- **`oracle_stress_events`** — endpoint does not exist on the hub.
  Skipped. See FUTURE.

## FUTURE — for the hub / mcp backlog

1. **`oracle_stress_events`** requires `/api/oracle/stress-events/active`
   on the hub. V9.2 Pipeline 10 specifies it but it's not yet built.
2. **`attestation_verify`** has no direct endpoint. The adjacent route
   `GET /api/provenance/verify/{attestation_hash}` (hub:7943) exists
   for TLSNotary proof verification. If witness-mcp later wants a
   verify tool, that route is a candidate wrap — but its semantics are
   TLSNotary provenance, not CDA content-hash verification, so the tool
   name/shape needs design.
3. **`rqs_lookup`** / **`rqs_matrix`** — `GET /api/compose/rqs` and
   `GET /api/compose/rqs/{slug}` both exist (hub:5966, 5973). Not in
   the scope of any tool-wrap brief this session. Candidate for
   `@basis/cqi-mcp` since RQS is a sibling composition score.
4. **Pulse history** — `GET /api/pulse/history?days=` and
   `GET /api/pulse/{date_str}` exist (hub:5720, 5740). Candidate for
   `@basis/divergence-mcp` as `pulse_history`.
5. **Discovery filters** — `GET /api/discovery/domain/{domain}` and
   `GET /api/discovery/unacknowledged` exist (hub:6843, 6859).
   Candidate additions as `discovery_by_domain` and
   `discovery_unacknowledged`.
6. **CDA history + coverage** — `GET /api/cda/issuers/{symbol}/history`,
   `GET /api/cda/coverage`, `GET /api/cda/attestations/{asset_symbol}`
   exist (hub:3615, 3660, 3069). Candidate additions to witness-mcp.

## Files touched

**New:**
- `shapes_discovered.md` — verified endpoint shapes with hub line numbers
- `session_summary_2026-04-19-mcp-tools.md` — this file

**Modified:**
- `packages/cqi-mcp/src/tools.ts` — 3 tools registered
- `packages/cqi-mcp/server.json` — `tools: []` → 3 entries
- `packages/cqi-mcp/README.md` — real tool table
- `packages/witness-mcp/src/tools.ts` — 2 tools registered
- `packages/witness-mcp/server.json` — `tools: []` → 2 entries
- `packages/witness-mcp/README.md` — real tool table
- `packages/divergence-mcp/src/tools.ts` — 4 tools registered
- `packages/divergence-mcp/server.json` — `tools: []` → 4 entries
- `packages/divergence-mcp/README.md` — real tool table
- `mcp_split_plan.md` — final tool distribution + FUTURE list
- `blockers.md` — closed blockers 5/6/7/8 (shape discovery unblocked them)

## Verification

```
pnpm --filter @basis/cqi-mcp build        → OK
pnpm --filter @basis/witness-mcp build    → OK
pnpm --filter @basis/divergence-mcp build → OK

node scripts/src/smoke-tools-list.mjs packages/cqi-mcp/build/index.js
  OK  tools=3  names=[cqi_compose, cqi_matrix, cqi_contagion_traversal]

node scripts/src/smoke-tools-list.mjs packages/witness-mcp/build/index.js
  OK  tools=2  names=[evidence_list_issuers, evidence_latest_for_issuer]

node scripts/src/smoke-tools-list.mjs packages/divergence-mcp/build/index.js
  OK  tools=4  names=[latest_pulse, divergence_stream, coherence_drops_latest, divergence_signals]

./mcp-publisher validate packages/cqi-mcp/server.json        → ✅ valid
./mcp-publisher validate packages/witness-mcp/server.json    → ✅ valid
./mcp-publisher validate packages/divergence-mcp/server.json → ✅ valid
```

Note: runtime behavior (actual API responses) was not verified end-to-end
because the sandbox cannot reach `basisprotocol.xyz`. Implementations
match the handler signatures in `basis-hub/app/server.py` and use
passthrough output, so any shape change on the hub surfaces to the
client without schema-drift errors.
