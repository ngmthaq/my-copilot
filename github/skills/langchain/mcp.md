---
name: langchain-mcp
description: "LangChain MCP (Model Context Protocol) integration — MultiServerMCPClient, streamable HTTP and stdio transports, multi-server agents, custom MCP servers (FastMCP), error handling, retries and timeouts. Use when: connecting agents to external MCP servers; choosing transport types; building multi-server agents; creating custom MCP servers; handling MCP connection errors. DO NOT USE FOR: creating manual tools (use langchain-tools); basic agent creation (use langchain-agents); document retrieval (use langchain-embeddings-search)."
---

# Model Context Protocol (MCP)

## Overview

MCP is an open standard that lets AI agents connect to external tools via a universal interface — like USB-C for AI. Instead of writing custom integrations, you connect to MCP servers that expose tools through a standard protocol. Works seamlessly with the same `create_agent()` pattern.

---

## 1. Installation

```bash
pip install langchain langchain-openai langchain-mcp-adapters mcp python-dotenv
```

---

## 2. Transport Types

| Transport       | Communication                | Best For                               | Config Key                                                |
| --------------- | ---------------------------- | -------------------------------------- | --------------------------------------------------------- |
| Streamable HTTP | Network-based (HTTP)         | Remote or local web-accessible servers | `{"transport": "streamable_http", "url": "..."}`          |
| stdio           | Process-based (stdin/stdout) | Local subprocess tools, tight coupling | `{"transport": "stdio", "command": "...", "args": [...]}` |

### Key Difference

- **Streamable HTTP**: MCP server is a separate web service (like calling a web API)
- **stdio**: MCP server runs as a subprocess of your app (like running a program and talking to it)

---

## 3. Connecting to an MCP Server (HTTP)

```python
import asyncio
import os
from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_openai import ChatOpenAI

load_dotenv()

async def main():
    client = MultiServerMCPClient({
        "context7": {
            "transport": "streamable_http",
            "url": "https://mcp.context7.com/mcp",
        }
    })

    try:
        # Get tools from MCP server
        tools = await client.get_tools()
        print(f"Retrieved {len(tools)} tools")

        model = ChatOpenAI(
            model=os.getenv("AI_MODEL"),
            base_url=os.getenv("AI_ENDPOINT"),
            api_key=os.getenv("AI_API_KEY"),
        )

        # Same create_agent() pattern — tools from MCP instead of manual
        agent = create_agent(model, tools)

        response = await agent.ainvoke({"messages": [("human", "How do I use Python requests?")]})
        print(response["messages"][-1].content)
    finally:
        print("MCP connection closed")

asyncio.run(main())
```

---

## 4. Connecting via stdio Transport

```python
from pathlib import Path

async def main():
    client = MultiServerMCPClient({
        "calculator": {
            "transport": "stdio",
            "command": "python",
            "args": [str(Path(__file__).parent / "servers" / "calculator_server.py")],
        }
    })

    tools = await client.get_tools()
    agent = create_agent(model, tools)
    response = await agent.ainvoke({"messages": [("human", "What is 15 * 23?")]})
```

---

## 5. Multi-Server Agent

Connect to multiple servers simultaneously — the agent auto-selects the right tool:

```python
client = MultiServerMCPClient({
    "context7": {
        "transport": "streamable_http",
        "url": "https://mcp.context7.com/mcp",
    },
    "calculator": {
        "transport": "stdio",
        "command": "python",
        "args": [str(server_path)],
    },
})

# Tools from ALL servers combined
tools = await client.get_tools()
agent = create_agent(model, tools)

# Agent routes to the right server automatically
await agent.ainvoke({"messages": [("human", "What is 25 * 4?")]})       # → calculator
await agent.ainvoke({"messages": [("human", "How do I use FastAPI?")]})  # → context7
```

---

## 6. Creating Custom MCP Servers

Expose your own tools via MCP:

```python
from mcp.server.fastmcp import FastMCP
import math

mcp = FastMCP("my-calculator")

# Safe namespace for eval
safe_namespace = {"sqrt": math.sqrt, "pow": pow, "abs": abs}

@mcp.tool()
def calculate(expression: str) -> str:
    """Perform mathematical calculations.

    Args:
        expression: Math expression to evaluate, e.g., '2 + 2', 'sqrt(16)'
    """
    result = eval(expression, {"__builtins__": {}}, safe_namespace)
    return str(result)

# Run with HTTP transport
mcp.run(transport="streamable-http", port=3000)
# Server available at http://localhost:3000/mcp
```

---

## 7. Error Handling & Production Patterns

### Retry with Built-In Backoff

```python
# LangChain's built-in retry — no custom loops needed
reliable_model = model.with_retry(stop_after_attempt=3)
agent = create_agent(reliable_model, tools)
```

### Timeout Handling

```python
import asyncio

timeout_seconds = 30
response = await asyncio.wait_for(
    agent.ainvoke({"messages": [("human", query)]}),
    timeout=timeout_seconds,
)
```

### Proper Cleanup

```python
client = MultiServerMCPClient(config)
try:
    tools = await client.get_tools()
    agent = create_agent(model, tools)
    response = await agent.ainvoke({"messages": [("human", query)]})
finally:
    # Python MCP client handles cleanup automatically
    pass
```

### Authentication

```python
client = MultiServerMCPClient({
    "context7": {
        "transport": "streamable_http",
        "url": "https://mcp.context7.com/mcp",
        "headers": {
            "Authorization": f"Bearer {os.getenv('CONTEXT7_API_KEY')}",
        },
    }
})
```

---

## 8. Troubleshooting

| Problem                     | Cause                                  | Fix                                                             |
| --------------------------- | -------------------------------------- | --------------------------------------------------------------- |
| "Failed to connect"         | Server unreachable or wrong URL        | Verify URL; check server is running; add timeout                |
| "No tools returned"         | Server not exposing tools or auth fail | Check server logs; verify API keys; test server directly        |
| "Module not found" (stdio)  | Wrong server file path                 | Use `Path(__file__).parent / ...`; verify file exists           |
| Agent doesn't use MCP tools | Tools not passed or descriptions vague | Print tool list; check descriptions; test with explicit queries |
| "Session terminated"        | Connection closed unexpectedly         | Use try/finally; implement retry logic; check timeouts          |
| Tool name conflicts         | Multiple servers with same tool name   | MCP auto-namespaces; rely on descriptions for disambiguation    |

---

## 9. Anti-Patterns

| Anti-Pattern                                          | Correct Approach                                            |
| ----------------------------------------------------- | ----------------------------------------------------------- |
| Writing custom integrations for each service          | Use MCP — one protocol for all services                     |
| Hardcoding MCP server URLs                            | Use environment variables for server URLs                   |
| Skipping error handling for MCP connections           | Always use try/finally and `model.with_retry()`             |
| Not using `asyncio.wait_for()` for MCP calls          | Add timeouts to prevent indefinite hangs                    |
| Running stdio servers manually                        | Let `MultiServerMCPClient` manage subprocess lifecycle      |
| Mixing HTTP and stdio without understanding tradeoffs | Choose HTTP for shared services, stdio for integrated tools |
