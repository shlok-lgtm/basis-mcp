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
    "evidence_list_issuers",
    {
      description:
        "List all stablecoin issuers tracked in the Basis Witness evidence archive (CDA). Returns issuer metadata including latest disclosure timestamp and document count.",
      inputSchema: z.object({}),
      annotations: TOOL_ANNOTATIONS,
    },
    async () => {
      try {
        const data = await apiFetch<unknown>("/api/cda/issuers");
        return textResult(data);
      } catch {
        return apiErrorResult();
      }
    },
  );

  server.registerTool(
    "evidence_latest_for_issuer",
    {
      description:
        "Retrieve the latest Continuous Disclosure Archive extraction for a stablecoin issuer. Returns extracted reserve data, attestation type, source URL, content hash, and capture timestamp.",
      inputSchema: z.object({
        issuer_symbol: z
          .string()
          .min(1)
          .describe("Stablecoin issuer symbol (e.g. 'usdc', 'usdt', 'dai')"),
      }),
      annotations: TOOL_ANNOTATIONS,
    },
    async ({ issuer_symbol }) => {
      try {
        const data = await apiFetch<unknown>(
          `/api/cda/issuers/${encodeURIComponent(issuer_symbol.toLowerCase())}/latest`,
        );
        return textResult(data);
      } catch {
        return apiErrorResult();
      }
    },
  );
}
