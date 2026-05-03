#!/usr/bin/env node
/**
 * build-graph.js
 * Runs madge internally, then builds a compact knowledge-graph.json for AI agents.
 * Zero dependencies beyond madge itself.
 *
 * Usage:
 *   node build-graph.js --src ui-service/src --out knowledge-graph.json
 *   node build-graph.js --src ui-service/src --tsconfig ui-service/tsconfig.app.json
 *   node build-graph.js --src ui-service/src --extensions ts,tsx
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ─── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const get = (flag, fallback = "") => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : fallback;
};
const SRC_DIR = get("--src", "src");
const OUT_FILE = get("--out", "knowledge-graph.json");
const TSCONFIG = get("--tsconfig", "");
const EXTENSIONS = get("--extensions", "ts,tsx,js,jsx,md,mdx,css,json");

// Install madge globally if not found locally
function checkMadge() {
  const localMadge = path.resolve("node_modules/.bin/madge");
  if (fs.existsSync(localMadge)) return localMadge;

  try {
    execSync("madge --version", { stdio: "ignore" });
  } catch {
    console.error("❌  madge not found. Install it with: npm install -g madge");
    execSync("npm install -g madge", { stdio: "inherit" });
  }
}

// ─── Run madge ───────────────────────────────────────────────────────────────
function runMadge() {
  // Build madge command — prefer local install, fall back to global
  const localMadge = path.resolve("node_modules/.bin/madge");
  const madgeBin = fs.existsSync(localMadge) ? localMadge : "madge";

  let cmd = `${madgeBin} --extensions ${EXTENSIONS} --json`;
  if (TSCONFIG) cmd += ` --ts-config ${TSCONFIG}`;
  cmd += ` ${SRC_DIR}`;

  console.log(`⚙️   Running: ${cmd}`);
  try {
    const stdout = execSync(cmd, { encoding: "utf8" });
    return JSON.parse(stdout);
  } catch (err) {
    const msg = err.message || "";
    if (msg.includes("not found") || msg.includes("command not found")) {
      console.error(
        "❌  madge not found. Install it with: npm install -g madge",
      );
    } else {
      console.error("❌  madge failed:\n", msg);
    }
    process.exit(1);
  }
}

// ─── Export extractor (regex — zero deps, works for JS and TS) ───────────────
function extractExports(content) {
  const results = [];
  let m;

  // export default
  if (/export\s+default\s+/.test(content)) results.push("default");

  // export function foo / export class Foo / export type Foo / export interface Foo / export enum Foo
  const namedDecl =
    /export\s+(?:async\s+)?(?:function|class|type|interface|enum)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
  while ((m = namedDecl.exec(content)) !== null) results.push(m[1]);

  // export const/let/var foo = ...
  const namedVar = /export\s+(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
  while ((m = namedVar.exec(content)) !== null) results.push(m[1]);

  // export { foo, bar as baz }
  const reExport = /export\s*\{([^}]+)\}/g;
  while ((m = reExport.exec(content)) !== null) {
    m[1].split(",").forEach((entry) => {
      const name = entry
        .trim()
        .split(/\s+as\s+/)
        .pop()
        .trim();
      if (name && name !== "*") results.push(name);
    });
  }

  // module.exports = { foo, bar }  (CJS)
  const cjsObj = /module\.exports\s*=\s*\{([^}]+)\}/g;
  while ((m = cjsObj.exec(content)) !== null) {
    m[1].split(",").forEach((entry) => {
      const name = entry.trim().split(":")[0].trim();
      if (name && /^[A-Za-z_$]/.test(name)) results.push(name);
    });
  }

  return [...new Set(results)];
}

// ─── Main ────────────────────────────────────────────────────────────────────
function main() {
  checkMadge();
  const madge = runMadge();

  // Collect all unique file paths
  const allFiles = new Set();
  for (const [file, deps] of Object.entries(madge)) {
    allFiles.add(file);
    deps.forEach((d) => allFiles.add(d));
  }

  // Assign short numeric IDs
  const fileToId = {};
  const idToFile = {};
  let counter = 0;
  for (const f of [...allFiles].sort()) {
    fileToId[f] = counter;
    idToFile[counter] = f;
    counter++;
  }

  // Build nodes with metadata
  const nodes = [];
  for (const [id, filePath] of Object.entries(idToFile)) {
    const absPath = path.resolve(SRC_DIR, "..", filePath);
    let content = "";
    try {
      content = fs.readFileSync(absPath, "utf8");
    } catch {
      // external dep — keep empty
    }
    nodes.push({
      id: Number(id),
      exports: content ? extractExports(content) : [],
    });
  }

  // Build edges
  const edges = [];
  for (const [file, deps] of Object.entries(madge)) {
    const fromId = fileToId[file];
    for (const dep of deps) {
      if (fileToId[dep] !== undefined) {
        edges.push({ from: fromId, to: fileToId[dep] });
      }
    }
  }

  // Build reverse index
  const importedBy = {};
  for (const { from, to } of edges) {
    if (!importedBy[to]) importedBy[to] = [];
    importedBy[to].push(from);
  }

  // Write compact graph
  const graph = {
    meta: {
      generatedAt: new Date().toISOString(),
      srcDir: SRC_DIR,
      totalFiles: nodes.length,
      totalEdges: edges.length,
    },
    files: idToFile,
    nodes,
    edges,
    importedBy,
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(graph, null, 2));
  console.log(`✅  knowledge-graph.json written`);
  console.log(`   ${nodes.length} files · ${edges.length} edges`);
  console.log(`   Saved to: ${OUT_FILE}`);
}

main();
