# Session summary — 2026-04-19 — MCP server split

Branch: `claude/split-mcp-servers-TfeAA`
Repo: `basis-protocol/basis-mcp`

## Outcome

Split the monolithic `@basis-protocol/mcp-server` into four scoped
servers plus a shared library, all under a new `packages/` workspace
root. Legacy server stays published and functional with a DEPRECATED
notice on both root and artifact READMEs.

## Packages created

| Package | LOC (src) | Tools | State |
|---------|-----------|-------|-------|
| `@basis/mcp-shared` | ~366 src | — | shared lib: HTTP client, config, types, response helpers, runner |
| `@basis/oracle-mcp` | ~619 src | 8 | all 8 legacy tools, builds cleanly, `tools/list` OK |
| `@basis/cqi-mcp` | ~34 src | 0 | scaffold: empty `tools/list` handler, builds cleanly |
| `@basis/witness-mcp` | ~34 src | 0 | scaffold: empty `tools/list` handler, builds cleanly |
| `@basis/divergence-mcp` | ~34 src | 0 | scaffold: empty `tools/list` handler, builds cleanly |

No `@basis/core-mcp` fifth package needed — all real tools fit oracle.

## Tool distribution

All 8 existing tools → `@basis/oracle-mcp`:

1. `get_stablecoin_scores`
2. `get_stablecoin_detail`
3. `get_wallet_risk`
4. `get_wallet_holdings`
5. `get_riskiest_wallets`
6. `get_scoring_backlog`
7. `check_transaction_risk` (composite of three score reads — still oracle)
8. `get_methodology`

`cqi-mcp`, `witness-mcp`, `divergence-mcp` scaffolded with 0 tools each;
namespaces reserved on the registry so `basis-hub` agent-card.json
capability categories resolve.

## Files touched — LOC delta

**New files (untracked → added):**

| File | Lines |
|------|-------|
| `blockers.md` | 60 |
| `mcp_split_plan.md` | 78 |
| `mcp_registry_entries.md` | 102 |
| `session_summary_2026-04-19.md` | (this file) |
| `packages/shared/**` (src + config) | ~416 |
| `packages/oracle-mcp/**` | ~754 |
| `packages/cqi-mcp/**` | ~190 |
| `packages/witness-mcp/**` | ~186 |
| `packages/divergence-mcp/**` | ~189 |
| `scripts/src/publish-all.mjs` | 34 |
| `scripts/src/smoke-tools-list.mjs` | 66 |
| **Total new** | **~2 075** |

**Modified files:**

| File | Change |
|------|--------|
| `README.md` | +25 lines — DEPRECATED banner pointing to four new packages |
| `artifacts/basis-mcp/README.md` | +16 lines — DEPRECATED banner |
| `package.json` | +3 scripts (`dev`, `test`, `publish-all`), `typecheck` gains `packages/**` |
| `pnpm-workspace.yaml` | +1 line — `packages/*` added to workspace globs |
| `pnpm-lock.yaml` | regenerated (MCP SDK, express, zod pulled in for 5 new packages) |

## Shared code — no duplication

All four servers import from `@basis/mcp-shared` (workspace:*):

- `apiFetch<T>(path)` — HTTP client with abort + 10s timeout
- `BASE_URL`, `API_TIMEOUT_MS`, `GRADE_ORDER`
- `formatMoney`, `isGradeAtLeast`, `gradeRank`
- `StablecoinScore`, `StablecoinDetail`, `WalletProfile`, `RiskiestWallet`, `BacklogItem`, `MethodologyResponse` types
- `API_ERROR_RESPONSE`, `TOOL_ANNOTATIONS`, `textResult`, `apiErrorResult`
- `runServer({ serverName, serverVersion, create })` — stdio + streamable-http bootstrap shared across all four servers

## Build + smoke results

```
pnpm -r --filter './packages/*' build
  packages/shared       Done
  packages/oracle-mcp   Done
  packages/cqi-mcp      Done
  packages/witness-mcp  Done
  packages/divergence-mcp Done

node scripts/src/smoke-tools-list.mjs packages/oracle-mcp/build/index.js
  OK  tools=8  names=[get_stablecoin_scores, get_stablecoin_detail, get_wallet_risk,
                      get_wallet_holdings, get_riskiest_wallets, get_scoring_backlog,
                      check_transaction_risk, get_methodology]

node scripts/src/smoke-tools-list.mjs packages/cqi-mcp/build/index.js        OK  tools=0
node scripts/src/smoke-tools-list.mjs packages/witness-mcp/build/index.js    OK  tools=0
node scripts/src/smoke-tools-list.mjs packages/divergence-mcp/build/index.js OK  tools=0

./mcp-publisher validate packages/oracle-mcp/server.json       ✅ valid
./mcp-publisher validate packages/cqi-mcp/server.json          ✅ valid
./mcp-publisher validate packages/witness-mcp/server.json      ✅ valid
./mcp-publisher validate packages/divergence-mcp/server.json   ✅ valid
```

Pre-existing `artifacts/mockup-sandbox` vite build failure (requires
`PORT` env var) is unrelated to this session and was not touched.

## Legacy monolith — left deprecated, still functional

- `artifacts/basis-mcp/` still builds and is the source of the
  currently-published `@basis-protocol/mcp-server@1.1.1`.
- Root `README.md` and `artifacts/basis-mcp/README.md` both carry
  DEPRECATED notices pointing to the four new packages.
- `server.json` at repo root and `.mcp/server.json` remain as the
  registry entries for the monolith — untouched.
- **Not unpublished** per explicit guardrail.

## Deferred work

1. **Publish to npm + registry.** `mcp_registry_entries.md` has the exact
   `./mcp-publisher publish …` commands. Auth is GitHub OIDC from CI or
   GitHub OAuth locally. Run from repo root.
2. **Populate scaffold servers.** Add real tools to `cqi-mcp`,
   `witness-mcp`, `divergence-mcp`. Each already has a `registerTools`
   hook and an empty `tools/list` handler to replace.
3. **Mark monolith `deprecated` on the registry** (not just in the
   README) once `@basis/oracle-mcp` has been live for ≥2 weeks and
   telemetry shows no new dependents. Use `./mcp-publisher status`.
4. **Reconcile with `basis-hub` agent-card.json.** Names here
   (`oracle`, `cqi`, `witness`, `divergence`) match the four brief
   categories; verify the agent-card file on `basis-hub` uses the same
   strings.
5. **Tool-count discrepancy (14 claimed vs 8 real).** See
   `blockers.md`. If the six "missing" tools are in another repo or
   branch, pull them in and reclassify per `mcp_split_plan.md`.
6. **Pre-existing `artifacts/mockup-sandbox` build failure.** Needs a
   `PORT` env var at build time; unrelated to the split but blocks
   `pnpm -r build` without a filter. Filter workaround:
   `pnpm -r --filter './packages/*' build`.
