import { apiErrorResult, apiFetch, TOOL_ANNOTATIONS, textResult, } from "@basis/mcp-shared";
import { z } from "zod";
export function registerTools(server) {
    server.registerTool("latest_pulse", {
        description: "Fetch the latest daily pulse — full risk-surface snapshot with content hash and page URL.",
        inputSchema: z.object({}),
        annotations: TOOL_ANNOTATIONS,
    }, async () => {
        try {
            const data = await apiFetch("/api/pulse/latest");
            return textResult(data);
        }
        catch {
            return apiErrorResult();
        }
    });
    server.registerTool("divergence_stream", {
        description: "Retrieve the 20 highest-novelty discovery signals from the last 7 days across all tracked domains.",
        inputSchema: z.object({}),
        annotations: TOOL_ANNOTATIONS,
    }, async () => {
        try {
            const data = await apiFetch("/api/discovery/latest");
            return textResult(data);
        }
        catch {
            return apiErrorResult();
        }
    });
    server.registerTool("coherence_drops_latest", {
        description: "Retrieve the most recent cross-domain coherence report — daily sweep of attestation-domain freshness and cross-domain alignment.",
        inputSchema: z.object({}),
        annotations: TOOL_ANNOTATIONS,
    }, async () => {
        try {
            const data = await apiFetch("/api/coherence/latest");
            return textResult(data);
        }
        catch {
            return apiErrorResult();
        }
    });
    server.registerTool("divergence_signals", {
        description: "Retrieve combined divergence signals — asset-quality divergence (score declining while flows grow) and wallet-concentration divergence (HHI rising while value grows).",
        inputSchema: z.object({
            hours: z
                .number()
                .int()
                .min(1)
                .max(720)
                .optional()
                .describe("Lookback window in hours for stored signals. Default 24 on the server."),
            force: z
                .boolean()
                .optional()
                .describe("If true, recompute signals live instead of reading the stored set. Default false."),
        }),
        annotations: TOOL_ANNOTATIONS,
    }, async ({ hours, force }) => {
        try {
            const params = new URLSearchParams();
            if (hours != null)
                params.set("hours", String(hours));
            if (force)
                params.set("force", "true");
            const qs = params.toString();
            const data = await apiFetch(`/api/divergence${qs ? `?${qs}` : ""}`);
            return textResult(data);
        }
        catch {
            return apiErrorResult();
        }
    });
}
//# sourceMappingURL=tools.js.map