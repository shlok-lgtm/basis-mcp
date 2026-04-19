import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
export async function runServer(opts) {
    const isHttp = process.argv.includes("--http");
    if (isHttp) {
        const port = Number(process.env["PORT"] ?? "3000");
        const app = express();
        app.use(express.json());
        const handle = async (req, res, withBody) => {
            const server = opts.create();
            const transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: undefined,
            });
            res.on("close", () => {
                transport.close().catch(() => { });
                server.close().catch(() => { });
            });
            await server.connect(transport);
            await transport.handleRequest(req, res, withBody ? req.body : undefined);
        };
        app.post("/mcp", (req, res) => {
            handle(req, res, true).catch((err) => {
                process.stderr.write(`[${opts.serverName}] ${String(err)}\n`);
            });
        });
        app.get("/mcp", (req, res) => {
            handle(req, res, false).catch((err) => {
                process.stderr.write(`[${opts.serverName}] ${String(err)}\n`);
            });
        });
        app.delete("/mcp", (req, res) => {
            handle(req, res, false).catch((err) => {
                process.stderr.write(`[${opts.serverName}] ${String(err)}\n`);
            });
        });
        app.get("/health", (_req, res) => {
            res.json({
                status: "ok",
                server: opts.serverName,
                version: opts.serverVersion,
            });
        });
        app.listen(port, () => {
            process.stderr.write(`[${opts.serverName}] HTTP listening on :${port} — POST /mcp\n`);
        });
    }
    else {
        const server = opts.create();
        const transport = new StdioServerTransport();
        process.stderr.write(`[${opts.serverName}] stdio — ${opts.serverName} v${opts.serverVersion}\n`);
        await server.connect(transport);
    }
}
//# sourceMappingURL=runner.js.map