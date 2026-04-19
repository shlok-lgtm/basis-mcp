# MCP registry publish queue — 2026-04-19

Paste each block below into `basis-hub`'s `submission_queue.md`. Each
block is self-contained: the command, the server.json path, the expected
namespace, and the auth method.

Publisher binary: `./mcp-publisher` at repo root.
Publishing runs from the repo root.

All four new servers publish under the `io.github.basis-protocol/*`
namespace, so authentication is via **GitHub OIDC** when publishing from
a GitHub Actions job owned by `basis-protocol`, or via **GitHub OAuth**
(`./mcp-publisher login github`) when publishing interactively from a
developer machine belonging to an org member.

---

## 1. `@basis/oracle-mcp`

- **Expected namespace:** `io.github.basis-protocol/oracle-mcp`
- **server.json:** `packages/oracle-mcp/server.json`
- **npm package:** `@basis/oracle-mcp@0.1.0`
- **Auth:** GitHub OIDC (preferred) or GitHub OAuth
- **Status:** ready to publish — 8 tools registered, `tools/list` smoke-tested OK

```bash
# From repo root
./mcp-publisher login github-oidc    # or: ./mcp-publisher login github
./mcp-publisher publish packages/oracle-mcp/server.json
```

---

## 2. `@basis/cqi-mcp` (scaffold)

- **Expected namespace:** `io.github.basis-protocol/cqi-mcp`
- **server.json:** `packages/cqi-mcp/server.json`
- **npm package:** `@basis/cqi-mcp@0.1.0`
- **Auth:** GitHub OIDC (preferred) or GitHub OAuth
- **Status:** scaffold — 0 tools, `tools/list` returns `{ tools: [] }`
- **Note:** publishing now reserves the namespace. Add tools and bump
  version when CQI features ship.

```bash
./mcp-publisher login github-oidc
./mcp-publisher publish packages/cqi-mcp/server.json
```

---

## 3. `@basis/witness-mcp` (scaffold)

- **Expected namespace:** `io.github.basis-protocol/witness-mcp`
- **server.json:** `packages/witness-mcp/server.json`
- **npm package:** `@basis/witness-mcp@0.1.0`
- **Auth:** GitHub OIDC (preferred) or GitHub OAuth
- **Status:** scaffold — 0 tools, `tools/list` returns `{ tools: [] }`
- **Note:** publishing now reserves the namespace.

```bash
./mcp-publisher login github-oidc
./mcp-publisher publish packages/witness-mcp/server.json
```

---

## 4. `@basis/divergence-mcp` (scaffold)

- **Expected namespace:** `io.github.basis-protocol/divergence-mcp`
- **server.json:** `packages/divergence-mcp/server.json`
- **npm package:** `@basis/divergence-mcp@0.1.0`
- **Auth:** GitHub OIDC (preferred) or GitHub OAuth
- **Status:** scaffold — 0 tools, `tools/list` returns `{ tools: [] }`
- **Note:** publishing now reserves the namespace.

```bash
./mcp-publisher login github-oidc
./mcp-publisher publish packages/divergence-mcp/server.json
```

---

## Legacy — DO NOT unpublish in this session

- **Namespace:** `io.github.basis-protocol/basis-mcp`
- **server.json:** `server.json` (root) and `artifacts/basis-mcp/.mcp/server.json`
- **npm package:** `@basis-protocol/mcp-server@1.1.1`
- **Status:** DEPRECATED (README notices added), still published,
  still functional. Consumers continue to work.
- **Next session:** after `@basis/oracle-mcp` has been live on the
  registry for ≥2 weeks and usage telemetry shows no new dependents,
  mark the monolithic version deprecated on-registry via
  `./mcp-publisher status --deprecated …`. Not done today per guardrail
  ("Do NOT unpublish the existing monolithic server in this session").

---

## Validate-only (safe, no side effects)

```bash
./mcp-publisher validate packages/oracle-mcp/server.json
./mcp-publisher validate packages/cqi-mcp/server.json
./mcp-publisher validate packages/witness-mcp/server.json
./mcp-publisher validate packages/divergence-mcp/server.json
```
