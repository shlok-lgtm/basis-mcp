import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
export interface RunOptions {
    serverName: string;
    serverVersion: string;
    create: () => McpServer;
}
export declare function runServer(opts: RunOptions): Promise<void>;
//# sourceMappingURL=runner.d.ts.map