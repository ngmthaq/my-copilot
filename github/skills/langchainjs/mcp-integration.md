---
name: langchainjs-mcp-integration
description: "LangChain.js MCP integration — Model Context Protocol, MultiServerMCPClient, HTTP/stdio transports, multi-server agents, custom MCP servers. Use when: connecting agents to MCP tool servers; building MCP-powered workflows; creating custom MCP servers. DO NOT USE FOR: inline tool definitions (use function-calling-tools); agents without MCP (use agents)."
---

# LangChain.js MCP Integration

## 1. What is MCP?

Model Context Protocol (MCP) is a standard protocol for connecting LLMs to external tools and data sources. Instead of defining tools inline, tools are served by **MCP servers** that agents connect to as clients.

**Benefits:**

- Tool definitions are decoupled from agent code
- Multiple agents can share the same tool servers
- Tools can be added/removed without changing agent code
- Standard protocol works across different LLM frameworks

---

## 2. Connecting to an MCP Server

```javascript
import { MultiServerMCPClient } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";

// Connect to MCP server(s)
const mcpClient = new MultiServerMCPClient({
  // HTTP transport (Streamable HTTP)
  math: {
    transport: "http",
    url: "http://localhost:3001/mcp",
  },
});

// Get tools from MCP server
const tools = await mcpClient.getTools();

// Create agent with MCP tools
const model = new ChatOpenAI({ modelName: "gpt-4o-mini" });
const agent = createAgent({ model, tools });

const result = await agent.invoke({
  messages: [{ role: "user", content: "What is 25 * 48?" }],
});

// Clean up when done
await mcpClient.close();
```

---

## 3. Transport Types

### HTTP Transport (Streamable HTTP)

```javascript
const mcpClient = new MultiServerMCPClient({
  serverName: {
    transport: "http",
    url: "http://localhost:3001/mcp",
  },
});
```

### Stdio Transport (Local Process)

```javascript
const mcpClient = new MultiServerMCPClient({
  serverName: {
    transport: "stdio",
    command: "node",
    args: ["./path/to/mcp-server.js"],
  },
});
```

### Stdio with Environment Variables

```javascript
const mcpClient = new MultiServerMCPClient({
  serverName: {
    transport: "stdio",
    command: "npx",
    args: ["-y", "@some-org/mcp-server"],
    env: {
      API_KEY: process.env.EXTERNAL_API_KEY,
    },
  },
});
```

---

## 4. Multi-Server Setup

```javascript
const mcpClient = new MultiServerMCPClient({
  // Math tool server
  math: {
    transport: "http",
    url: "http://localhost:3001/mcp",
  },

  // Weather tool server
  weather: {
    transport: "http",
    url: "http://localhost:3002/mcp",
  },

  // File system tool server (local process)
  filesystem: {
    transport: "stdio",
    command: "node",
    args: ["./servers/filesystem-server.js"],
  },
});

// All tools from all servers are available
const tools = await mcpClient.getTools();

const agent = createAgent({
  model: new ChatOpenAI({ modelName: "gpt-4o-mini" }),
  tools,
});

// Agent can use tools from any connected server
const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "What's 25 * 48? Also, what's the weather in Tokyo?",
    },
  ],
});

await mcpClient.close();
```

---

## 5. Building a Custom MCP Server

```javascript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { z } from "zod";

const app = express();
app.use(express.json());

// Create MCP server
const mcpServer = new McpServer({
  name: "my-tools",
  version: "1.0.0",
});

// Register tools on the server
mcpServer.tool(
  "get_weather",
  "Get weather for a city",
  { city: z.string().describe("City name") },
  async ({ city }) => ({
    content: [
      {
        type: "text",
        text: `Weather in ${city}: 72°F, sunny`,
      },
    ],
  }),
);

mcpServer.tool(
  "calculate",
  "Perform math calculations",
  { expression: z.string().describe("Math expression") },
  async ({ expression }) => ({
    content: [
      {
        type: "text",
        text: `Result: ${eval(expression)}`, // Use safe parser in production
      },
    ],
  }),
);

// Set up HTTP transport
const transports = {};
app.post("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  transports[transport.sessionId] = transport;
  await mcpServer.connect(transport);
  await transport.handleRequest(req, res);
});

app.listen(3001, () => {
  console.log("MCP server running on http://localhost:3001/mcp");
});
```

---

## 6. Error Handling

```javascript
const mcpClient = new MultiServerMCPClient({
  math: {
    transport: "http",
    url: "http://localhost:3001/mcp",
  },
});

try {
  const tools = await mcpClient.getTools();
  const agent = createAgent({ model, tools });

  const result = await agent.invoke({
    messages: [{ role: "user", content: "Calculate 10 + 20" }],
  });
} catch (error) {
  console.error("MCP error:", error.message);
} finally {
  // Always close connections
  await mcpClient.close();
}
```

---

## Anti-Patterns

- **Not calling `mcpClient.close()`** — always clean up connections to avoid resource leaks
- **Hardcoding server URLs** — use environment variables for server addresses
- **Missing error handling** — MCP servers can be unavailable; handle connection failures gracefully
- **Single monolithic MCP server** — split tools into focused servers by domain
- **Using `eval()` in tools** — always use safe parsers; never execute untrusted input
- **Skipping tool descriptions** — MCP tools need clear descriptions for agents to use them correctly
