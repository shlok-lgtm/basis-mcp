# @basis/divergence-mcp

<!-- mcp-name: io.github.basis-protocol/divergence-mcp -->

**Basis Protocol — Divergence MCP.** Live signals: daily pulse,
novelty-ranked discovery feed, cross-domain coherence reports, and the
combined asset-quality / wallet-concentration divergence detectors.

## Install

```bash
npx @basis/divergence-mcp
```

## Tools

| Tool | Input | Output summary |
|------|-------|----------------|
| `latest_pulse` | — | `{ pulse_date, summary, content_hash: "0x…", page_url }` |
| `divergence_stream` | — | `{ signals: [...], count }` — top-20 discovery signals from the last 7 days ranked by `novelty_score` |
| `coherence_drops_latest` | — | Full coherence report object — per-domain freshness and cross-domain alignment. |
| `divergence_signals` | `hours?: 1–720`, `force?: boolean` | `{ summary: { total_signals, ... }, signals: [...] }` — stored divergence signals (asset-quality and wallet-concentration detectors). `force=true` triggers live recomputation. |

## Not shipped (flagged FUTURE)

- **`oracle_stress_events`** — `/api/oracle/stress-events/active` does
  not exist on the hub (confirmed by grep of
  `basis-hub/app/server.py`). Specified in V9.2 Pipeline 10 but not
  yet built. Will be added once the hub ships the endpoint.

## Staleness detection

Every endpoint returns a timestamp field so agents can detect staleness:
- `latest_pulse` → `pulse_date`
- `divergence_stream` → per-signal `detected_at`
- `coherence_drops_latest` → report's top-level `generated_at` (passthrough)
- `divergence_signals` → per-signal `detected_at` inside `signals`

## Claude Desktop

```json
{
  "mcpServers": {
    "basis-divergence": {
      "command": "npx",
      "args": ["-y", "@basis/divergence-mcp"]
    }
  }
}
```

## Cursor

```json
{
  "mcpServers": {
    "basis-divergence": {
      "command": "npx",
      "args": ["-y", "@basis/divergence-mcp"]
    }
  }
}
```

## Links

- [basisprotocol.xyz](https://basisprotocol.xyz)
- [GitHub](https://github.com/basis-protocol/basis-mcp)
