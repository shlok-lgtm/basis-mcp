# @basis/witness-mcp

<!-- mcp-name: io.github.basis-protocol/witness-mcp -->

**Basis Protocol — Witness MCP.** Evidence: attestation hashes, TLSNotary
provenance proofs, CDA snapshots.

> **Scaffold release.** This package publishes the `@basis/witness-mcp`
> namespace with no tools registered yet. The server responds to
> `tools/list` with an empty array while the evidence feature set is
> being built out. See [`mcp_split_plan.md`](../../mcp_split_plan.md).

## Install

```bash
npx @basis/witness-mcp
```

## Tools

_None yet._ Planned:

| Tool | Purpose |
|------|---------|
| `get_attestation` | Look up an attestation by content hash. |
| `verify_tlsnotary` | Verify a TLSNotary provenance proof. |
| `get_cda_snapshot` | Fetch a Committed-Data-Availability snapshot. |
| `find_evidence` | Search evidence records for an entity or claim. |

## Claude Desktop

```json
{
  "mcpServers": {
    "basis-witness": {
      "command": "npx",
      "args": ["-y", "@basis/witness-mcp"]
    }
  }
}
```

## Cursor

```json
{
  "mcpServers": {
    "basis-witness": {
      "command": "npx",
      "args": ["-y", "@basis/witness-mcp"]
    }
  }
}
```

## Links

- [basisprotocol.xyz](https://basisprotocol.xyz)
- [GitHub](https://github.com/basis-protocol/basis-mcp)
