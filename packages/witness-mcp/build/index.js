#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runServer } from "@basis/mcp-shared";
import { registerTools } from "./tools.js";
const SERVER_NAME = "basis-witness";
const SERVER_VERSION = "0.1.0";
const SERVER_DESCRIPTION = "Basis Protocol Witness — evidence: attestation hashes, TLSNotary provenance proofs, CDA snapshots.";
await runServer({
    serverName: SERVER_NAME,
    serverVersion: SERVER_VERSION,
    create: () => {
        const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION }, { capabilities: { tools: {} }, instructions: SERVER_DESCRIPTION });
        registerTools(server);
        return server;
    },
});
//# sourceMappingURL=index.js.map