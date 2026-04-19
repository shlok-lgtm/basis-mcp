# Endpoint shapes — verified 2026-04-19

## Discovery method

`https://basisprotocol.xyz` is not on the sandbox's outbound allowlist
(curl returns `x-deny-reason: host_not_allowed`), so I could not hit the
live API. Instead I fetched the canonical source from
`github.com/basis-protocol/basis-hub/main/app/server.py` (raw.
githubusercontent.com is allowed). Shapes below are extracted directly
from the FastAPI route handlers in that file — not brief-asserted,
not guessed.

Any claim labelled "verified from hub" below means I read the handler
body and, for path/query params, the Python signature.

## CQI endpoints

### `GET /api/compose/cqi`  — verified from hub

- **Query params** (hub line 5809):
  - `asset: str` (required)
  - `protocol: str` (required)
- **Not `coin_a` / `coin_b`.** The earlier brief's proposed input was
  wrong. The endpoint is asset-*in*-protocol CQI, not an asset pair.
- **Status codes:** 200 on success, 404 when `compute_cqi` returns
  `{"error": ...}`.
- **Response:** object from `app.composition.compute_cqi(asset, protocol)`.
  Top-level shape not enumerated in server.py; tool treats as passthrough.

### `GET /api/compose/cqi/matrix`  — verified from hub

- **Query params:** none (hub line 5818).
- **Response:** `compute_cqi_matrix()` — CQI for all stablecoin × protocol
  combinations.

### `GET /api/cqi/{protocol_slug}/{stablecoin_symbol}/contagion`  — verified from hub

- **Path params:** `protocol_slug: str`, `stablecoin_symbol: str`
  (symbol is uppercased server-side).
- **Query params:** `depth: int = 2` (optional, 1 ≤ depth ≤ 3).
- **Response shape** (hub lines 5825–5959):
  - Success: full CQI object with a nested `contagion` field:
    ```
    { ...cqi fields...,
      "contagion": {
        "pool_wallet_count": int,
        "pool_hhi": float | null,
        "depth": int,
        "connected_nodes": int,
        "truncated": bool,
        "depth_distribution": { "<depth>": count, ... },
        "total_exposed_usd": float,
        "worst_connected_risk_score": float | null,
        "pct_connected_to_low_grade": float,
        "scored_connected_count": int
      }
    }
    ```
  - Empty-pool case: CQI object with
    ```
    { ...cqi fields...,
      "contagion": {
        "status": "no_pool_wallets",
        "message": "No pool wallets discovered for <slug>/<SYM>. Run pool wallet collection first."
      }
    }
    ```
  - **Note vs brief:** the `no_pool_wallets` status is nested inside
    the `contagion` key, not at the top of the response. The earlier
    brief implied it was top-level. Passthrough output handles this
    correctly either way.
- **Error:** 404 if `compute_cqi` fails before the contagion step.

### `GET /api/compose/rqs` and `/api/compose/rqs/{slug}`  — verified from hub, NOT wrapped

These exist (hub lines 5966 and 5973). Not in the task brief for
cqi-mcp; flagged as optional future additions in `mcp_split_plan.md`.

## CDA endpoints (witness-mcp)

### `GET /api/cda/issuers`  — verified from hub

- **Params:** none (hub line 3284).
- **Response:**
  ```
  {
    "issuers": [
      {
        "asset_symbol": string,
        "issuer_name": string,
        "transparency_url": string,
        "collection_method": string,
        "disclosure_type": string,     // default "fiat-reserve"
        "last_attestation": string | null,   // ISO timestamp
        "last_verified": string | null,
        "source_updated": string | null
      }
    ],
    "count": int
  }
  ```

### `GET /api/cda/issuers/{symbol}/latest`  — verified from hub

- **Path:** `symbol: str` (uppercased server-side).
- **Status codes:** 200 on success, 404 with
  `{ "detail": "No attestation data found for <SYMBOL>" }` when no row.
- **Response** (hub lines 3563–3612):
  ```
  {
    "id": string,
    "asset_symbol": string,
    "source_url": string,
    "source_type": string,
    "extraction_method": string,
    "extraction_vendor": string,
    "structured_data": object,
    "confidence_score": float | null,
    "extraction_warnings": array | null,
    "extracted_at": string,              // ISO timestamp
    "issuer_name": string | null,
    "evidence_hash": "0x<sha256>",       // computed server-side
    "source_urls": array                 // optional, if registry has them
    // plus quality classification fields from _classify_attestation_quality()
  }
  ```

### No `/api/witness/*` and no `attestation_verify`

Confirmed: no route matches `/api/witness` in server.py. The brief's
CDA-rename instruction is correct.

An attestation-verify-adjacent route does exist:
`GET /api/provenance/verify/{attestation_hash}` (hub line 7943).
This is for TLSNotary provenance proof verification, not CDA content
hashes. Brief explicitly says DO NOT implement `attestation_verify` —
honoring that and flagging the discovery in `mcp_split_plan.md`.

## Divergence / live-signal endpoints

### `GET /api/pulse/latest`  — verified from hub

- **Params:** none (hub line 5699).
- **Status codes:** 200 on success, 404 when no pulse rows.
- **Response:**
  ```
  {
    "pulse_date": string,     // ISO date
    "summary": object,
    "content_hash": "0x<sha256>",
    "page_url": string | null
  }
  ```

### `GET /api/discovery/latest`  — verified from hub

- **Params:** none (hub line 6828).
- **Response:**
  ```
  {
    "signals": [
      {
        "id": string,
        "signal_type": string,
        "domain": string,
        "title": string,
        "description": string,
        "entities": array,
        "novelty_score": float,
        "direction": string,
        "magnitude": float,
        "baseline": object,
        "detail": object,
        "methodology_version": string,
        "detected_at": string,           // ISO timestamp
        "acknowledged": bool,
        "published": bool
      }
    ],
    "count": int
  }
  ```
  Top 20 by `novelty_score` from the last 7 days. Server-side limit;
  no client-side pagination surface.

### `GET /api/coherence/latest`  — verified from hub

- **Params:** none (hub line 1110).
- **Status codes:** 200 on success, 404 when no reports.
- **Response:** full coherence report object from
  `app.coherence.get_latest_report()`. Treated as passthrough.

### `GET /api/divergence`  — verified from hub, EXISTS

- **Query params** (hub line 5769):
  - `force: bool = False` (optional — force live recomputation)
  - `hours: int = 24` (optional — window for stored signals)
- **Response:**
  ```
  {
    "summary": { "total_signals": int, ... },
    "signals": [ ... ]    // stored divergences combining asset-quality
                          //   and wallet-concentration signals
  }
  ```
- Response shape is meaningfully distinct from `/api/discovery/latest`:
  discovery is a generic novelty-ranked signals feed (any domain);
  divergence is specifically the asset-quality-vs-flow and
  wallet-concentration-vs-value detectors. Both ship.

### `GET /api/oracle/stress-events/active`  — DOES NOT EXIST

Grep for `oracle/stress` in server.py: no matches. Corresponding
tool (`oracle_stress_events_active`) is not implemented. Flagged
FUTURE in `mcp_split_plan.md`.

## Summary — ship matrix

| Endpoint | Status | Wrapped as |
|----------|--------|------------|
| `/api/compose/cqi` | 200 | `cqi_compose` (renamed from `cqi_pair_lookup` — endpoint is asset-in-protocol, not pair) |
| `/api/compose/cqi/matrix` | 200 | `cqi_matrix` |
| `/api/cqi/{slug}/{sym}/contagion` | 200 | `cqi_contagion_traversal` |
| `/api/cda/issuers` | 200 | `evidence_list_issuers` |
| `/api/cda/issuers/{symbol}/latest` | 200 | `evidence_latest_for_issuer` |
| `/api/pulse/latest` | 200 | `latest_pulse` |
| `/api/discovery/latest` | 200 | `divergence_stream` |
| `/api/coherence/latest` | 200 | `coherence_drops_latest` |
| `/api/divergence` | 200 | `divergence_signals` |
| `/api/oracle/stress-events/active` | does not exist | skipped → FUTURE |
| `attestation_verify` (any path) | out of scope per brief | skipped → FUTURE |
