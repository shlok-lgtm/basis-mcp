#!/usr/bin/env node
// Smoke test: spawn an MCP server over stdio, send initialize + tools/list,
// print the tool count and tool names, exit non-zero on failure.
//
// Usage:  node scripts/src/smoke-tools-list.mjs <path-to-server-entry>

import { spawn } from "node:child_process";
import { resolve } from "node:path";

const entry = process.argv[2];
if (!entry) {
  console.error("usage: smoke-tools-list.mjs <entry.js>");
  process.exit(2);
}

const abs = resolve(entry);
const child = spawn(process.execPath, [abs], {
  stdio: ["pipe", "pipe", "inherit"],
});

let buf = "";
const pending = new Map();

child.stdout.setEncoding("utf8");
child.stdout.on("data", (chunk) => {
  buf += chunk;
  let idx;
  while ((idx = buf.indexOf("\n")) !== -1) {
    const line = buf.slice(0, idx).trim();
    buf = buf.slice(idx + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue;
    }
    if (msg.id != null && pending.has(msg.id)) {
      const { resolve: r } = pending.get(msg.id);
      pending.delete(msg.id);
      r(msg);
    }
  }
});

let nextId = 1;
function request(method, params) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    child.stdin.write(
      JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n",
    );
    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id);
        reject(new Error(`timeout waiting for ${method}`));
      }
    }, 5000);
  });
}

try {
  await request("initialize", {
    protocolVersion: "2025-06-18",
    clientInfo: { name: "smoke-test", version: "0" },
    capabilities: {},
  });
  child.stdin.write(
    JSON.stringify({
      jsonrpc: "2.0",
      method: "notifications/initialized",
    }) + "\n",
  );

  const res = await request("tools/list", {});
  if (res.error) {
    console.error("tools/list error:", JSON.stringify(res.error));
    process.exit(1);
  }
  const tools = res.result?.tools ?? [];
  console.log(`OK  tools=${tools.length}  names=[${tools.map((t) => t.name).join(", ")}]`);
  child.kill("SIGTERM");
  process.exit(0);
} catch (err) {
  console.error("FAIL:", err?.message ?? err);
  child.kill("SIGTERM");
  process.exit(1);
}
