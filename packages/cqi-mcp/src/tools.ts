import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  apiErrorResult,
  apiFetch,
  TOOL_ANNOTATIONS,
  textResult,
} from "@basis/mcp-shared";
import { z } from "zod";

export function registerTools(server: McpServer): void {
  server.registerTool(
    "cqi_compose",
    {
      description:
        "Compute the Collateral Quality Index for a stablecoin held as collateral within a specific protocol. Returns the CQI object with per-component scores.",
      inputSchema: z.object({
        asset: z
          .string()
          .min(1)
          .describe(
            "Stablecoin symbol (e.g. 'USDC', 'USDT', 'DAI'). Case-insensitive.",
          ),
        protocol: z
          .string()
          .min(1)
          .describe("Protocol slug (e.g. 'aave', 'morpho', 'compound')."),
      }),
      annotations: TOOL_ANNOTATIONS,
    },
    async ({ asset, protocol }) => {
      try {
        const q = new URLSearchParams({ asset, protocol }).toString();
        const data = await apiFetch<unknown>(`/api/compose/cqi?${q}`);
        return textResult(data);
      } catch {
        return apiErrorResult();
      }
    },
  );

  server.registerTool(
    "cqi_matrix",
    {
      description:
        "Retrieve the full Composition Quality Index matrix — CQI scores for every scored stablecoin × protocol combination.",
      inputSchema: z.object({}),
      annotations: TOOL_ANNOTATIONS,
    },
    async () => {
      try {
        const data = await apiFetch<unknown>("/api/compose/cqi/matrix");
        return textResult(data);
      } catch {
        return apiErrorResult();
      }
    },
  );

  server.registerTool(
    "cqi_contagion_traversal",
    {
      description:
        "Retrieve pool-wallet contagion analysis for a stablecoin within a protocol — depth-limited graph traversal across the top 50 pool wallets with HHI and worst-connected-risk-score summary. Returns { contagion: { status: 'no_pool_wallets', ... } } when the pool-wallet collector has not yet populated data for the requested pair.",
      inputSchema: z.object({
        protocol_slug: z
          .string()
          .min(1)
          .describe("Protocol slug (e.g. 'aave', 'morpho')."),
        stablecoin_symbol: z
          .string()
          .min(1)
          .describe("Stablecoin symbol (e.g. 'USDC'). Case-insensitive."),
        depth: z
          .number()
          .int()
          .min(1)
          .max(3)
          .optional()
          .describe(
            "Traversal depth from pool wallets (1–3). Default 2 on the server.",
          ),
      }),
      annotations: TOOL_ANNOTATIONS,
    },
    async ({ protocol_slug, stablecoin_symbol, depth }) => {
      try {
        const slug = encodeURIComponent(protocol_slug);
        const sym = encodeURIComponent(stablecoin_symbol);
        const q = depth != null ? `?depth=${depth}` : "";
        const data = await apiFetch<unknown>(
          `/api/cqi/${slug}/${sym}/contagion${q}`,
        );
        return textResult(data);
      } catch {
        return apiErrorResult();
      }
    },
  );
}
