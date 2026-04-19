import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
export function registerTools(server) {
    // Scaffold — no tools registered yet. Register an explicit empty
    // tools/list handler so clients discover the server and see `tools: []`.
    // Future: pulse feed, divergence detectors, oracle stress events,
    // coherence drops, discovery feed.
    server.server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: [],
    }));
}
//# sourceMappingURL=tools.js.map