import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

export function registerTools(server: McpServer): void {
  // Scaffold — no tools registered yet. Register an explicit empty
  // tools/list handler so clients discover the server and see `tools: []`.
  // Future: CQI pair lookups, portfolio/collateral stress, reports (Basel
  // SCO60, MiCA, GENIUS), RQS, contagion traversal.
  server.server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [],
  }));
}
