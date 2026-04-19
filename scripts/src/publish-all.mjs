#!/usr/bin/env node
// Orchestrator: publish each MCP server to the MCP registry.
//
// This script intentionally does NOT run mcp-publisher automatically — it
// prints the commands. Publishing touches shared infrastructure (the MCP
// registry) and requires GitHub OIDC auth, so the human operator runs each
// command after reviewing. See mcp_registry_entries.md at repo root for the
// authoritative list.

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(new URL("../..", import.meta.url).pathname);
const PACKAGES_DIR = join(ROOT, "packages");

const entries = readdirSync(PACKAGES_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => join(PACKAGES_DIR, d.name))
  .filter((dir) => existsSync(join(dir, "server.json")));

if (entries.length === 0) {
  console.error("No server.json found under packages/*");
  process.exit(1);
}

console.log("# Basis Protocol MCP — registry publish commands\n");
for (const dir of entries) {
  const serverJson = JSON.parse(
    readFileSync(join(dir, "server.json"), "utf8"),
  );
  const rel = dir.slice(ROOT.length + 1);
  console.log(`## ${serverJson.name}`);
  console.log(`cd ${ROOT} && ./mcp-publisher publish --server ${rel}/server.json`);
  console.log();
}
