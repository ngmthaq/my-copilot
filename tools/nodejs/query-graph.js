#!/usr/bin/env node
/**
 * query-graph.js
 * CLI tool for AI agents to fetch a focused subgraph for any file.
 * Outputs minimal JSON — designed to burn as few tokens as possible.
 *
 * Usage:
 *   node query-graph.js --graph knowledge-graph.json --file src/App.tsx
 *   node query-graph.js --graph knowledge-graph.json --file src/App.tsx --depth 2
 *   node query-graph.js --graph knowledge-graph.json --symbol useAuth
 *   node query-graph.js --graph knowledge-graph.json --type component
 */

const fs = require('fs');

// ─── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const get = (flag, fallback = '') => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : fallback;
};
const GRAPH_FILE = get('--graph', 'knowledge-graph.json');
const QUERY_FILE = get('--file', '');
const QUERY_SYM = get('--symbol', '');
const DEPTH = parseInt(get('--depth', '1'), 10);

// ─── Load graph ──────────────────────────────────────────────────────────────
if (!fs.existsSync(GRAPH_FILE)) {
  console.error(`❌  Graph not found: ${GRAPH_FILE}`);
  process.exit(1);
}

const graph = JSON.parse(fs.readFileSync(GRAPH_FILE, 'utf8'));
const { files, nodes, edges, importedBy } = graph;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const nodeById = (id) => nodes.find((n) => n.id === id);
const pathById = (id) => files[id];

function subgraph(rootId, depth) {
  const visited = new Set();
  const queue = [{ id: rootId, d: 0 }];
  const resultNodes = [];
  const resultEdges = [];

  while (queue.length) {
    const { id, d } = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);

    const node = nodeById(id);
    if (node) resultNodes.push({ ...node, id });

    if (d < depth) {
      for (const e of edges.filter((e) => e.from === id)) {
        resultEdges.push(e);
        queue.push({ id: e.to, d: d + 1 });
      }
      for (const fromId of importedBy[id] ?? []) {
        resultEdges.push({ from: fromId, to: id });
        queue.push({ id: fromId, d: d + 1 });
      }
    }
  }

  // Deduplicate edges
  const seen = new Set();
  const deduped = resultEdges.filter((e) => {
    const key = `${e.from}>${e.to}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { nodes: resultNodes, edges: deduped };
}

function formatNode(n) {
  if (!n) return null;
  return {
    id: n.id,
    path: pathById(n.id),
    exports: n.exports,
  };
}

// ─── Query: by file path ──────────────────────────────────────────────────────
if (QUERY_FILE) {
  const match = Object.entries(files).find(
    ([, p]) => p === QUERY_FILE || p.endsWith(QUERY_FILE),
  );
  if (!match) {
    console.error(`❌  File not found in graph: ${QUERY_FILE}`);
    console.log('Available files (sample):', Object.values(files).slice(0, 10));
    process.exit(1);
  }
  const rootId = Number(match[0]);
  const { nodes: sNodes, edges: sEdges } = subgraph(rootId, DEPTH);

  const result = {
    query: QUERY_FILE,
    depth: DEPTH,
    root: formatNode(nodeById(rootId)),
    imports: edges
      .filter((e) => e.from === rootId)
      .map((e) => formatNode(nodeById(e.to)))
      .filter(Boolean),
    importedBy: (importedBy[rootId] ?? [])
      .map((id) => formatNode(nodeById(id)))
      .filter(Boolean),
    subgraph: {
      nodes: sNodes.map(formatNode),
      edges: sEdges,
    },
  };

  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

// ─── Query: by exported symbol ────────────────────────────────────────────────
if (QUERY_SYM) {
  const matches = nodes
    .filter((n) => n.exports.includes(QUERY_SYM))
    .map(formatNode);

  console.log(
    JSON.stringify({ symbol: QUERY_SYM, definedIn: matches }, null, 2),
  );
  process.exit(0);
}

// ─── Default: print summary ───────────────────────────────────────────────────
console.log(
  JSON.stringify(
    {
      meta: graph.meta,
      summary: {
        totalFiles: nodes.length,
        totalEdges: edges.length,
      },
      usage: {
        byFile: 'node query-graph.js --file src/App.tsx [--depth 2]',
        bySymbol: 'node query-graph.js --symbol useAuth',
      },
    },
    null,
    2,
  ),
);
