# @basis/witness-mcp

<!-- mcp-name: io.github.basis-protocol/witness-mcp -->

**Basis Protocol — Witness MCP.** Evidence layer: stablecoin issuer
attestations and latest Continuous Disclosure Archive (CDA)
extractions with content hashes.

> The hub surfaces evidence via the CDA (`/api/cda/*`) — there is no
> `/api/witness` route. Package name stays `@basis/witness-mcp`
> because Witness is the product brand; the wrapped endpoints are
> CDA endpoints.

## Install

```bash
npx @basis/witness-mcp
```

## Tools

| Tool | Input | Output summary |
|------|-------|----------------|
| `evidence_list_issuers` | — | `{ issuers: [{ asset_symbol, issuer_name, transparency_url, collection_method, disclosure_type, last_attestation, last_verified, source_updated }], count }` |
| `evidence_latest_for_issuer` | `issuer_symbol: string` | Latest CDA extraction: `{ id, asset_symbol, source_url, source_type, extraction_method, extraction_vendor, structured_data, confidence_score, extracted_at, issuer_name, evidence_hash: "0x…", source_urls?, ... }` plus quality-classification fields. |

## Not shipped (flagged FUTURE)

- **`attestation_verify(content_hash)`** — no hub endpoint specifically
  for verifying CDA content hashes. `GET /api/provenance/verify/{hash}`
  exists for TLSNotary provenance proofs (different semantics) and is a
  candidate wrap for a future `tlsnotary_proof_verify` tool.

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
