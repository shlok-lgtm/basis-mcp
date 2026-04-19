import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

export function registerTools(server: McpServer): void {
  // Scaffold — no tools registered yet. Register an explicit empty
  // tools/list handler so clients discover the server and see `tools: []`.
  // Future: attestation lookup, TLSNotary proof verification, CDA
  // snapshot retrieval, evidence-by-hash resolution.
  server.server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [],
  }));
}
