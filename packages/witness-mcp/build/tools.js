import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
export function registerTools(server) {
    // Scaffold — no tools registered yet. Register an explicit empty
    // tools/list handler so clients discover the server and see `tools: []`.
    // Future: attestation lookup, TLSNotary proof verification, CDA
    // snapshot retrieval, evidence-by-hash resolution.
    server.server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: [],
    }));
}
//# sourceMappingURL=tools.js.map