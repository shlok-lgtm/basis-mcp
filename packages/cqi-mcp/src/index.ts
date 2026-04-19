#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runServer } from "@basis/mcp-shared";
import { registerTools } from "./tools.js";

const SERVER_NAME = "basis-cqi";
const SERVER_VERSION = "0.1.0";
const SERVER_DESCRIPTION =
  "Basis Protocol CQI — composition: CQI pair lookups, portfolio/collateral stress, reports (Basel SCO60, MiCA, GENIUS), RQS, contagion traversal.";

await runServer({
  serverName: SERVER_NAME,
  serverVersion: SERVER_VERSION,
  create: () => {
    const server = new McpServer(
      { name: SERVER_NAME, version: SERVER_VERSION },
      { capabilities: { tools: {} }, instructions: SERVER_DESCRIPTION },
    );
    registerTools(server);
    return server;
  },
});
