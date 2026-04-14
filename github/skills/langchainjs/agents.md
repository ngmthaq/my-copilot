---
name: langchainjs-agents
description: "LangChain.js agents — ReAct pattern, createAgent(), multi-tool orchestration, middleware (wrapModelCall, wrapToolCall), summarization middleware. Use when: building autonomous agents; multi-step reasoning; adding middleware hooks; managing long conversations. DO NOT USE FOR: simple tool calling (use function-calling-tools); MCP servers (use mcp-integration)."
---

# LangChain.js Agents

## 1. ReAct Pattern

Agents follow a **Reason + Act** loop:

1. **Think** — model reasons about what to do next
2. **Act** — model calls a tool
3. **Observe** — model reads the tool result
4. **Repeat** until the task is complete, then respond to the user

---

## 2. Creating a Basic Agent

```javascript
import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const model = new ChatOpenAI({ modelName: "gpt-4o-mini" });

// Define tools
const searchTool = tool(
  async ({ query }) => {
    return `Search results for: ${query}`;
  },
  {
    name: "search",
    description: "Search the web for current information",
    schema: z.object({
      query: z.string().describe("The search query"),
    }),
  },
);

const calculatorTool = tool(
  async ({ expression }) => {
    return `${eval(expression)}`; // Use a safe math parser in production
  },
  {
    name: "calculator",
    description: "Evaluate a math expression",
    schema: z.object({
      expression: z.string().describe("The math expression to evaluate"),
    }),
  },
);

// Create agent with tools
const agent = createAgent({
  model,
  tools: [searchTool, calculatorTool],
});

// Run the agent
const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "What is the population of Tokyo? Multiply it by 2.",
    },
  ],
});

// Agent will: search for population → use calculator → respond
console.log(result.messages.at(-1).content);
```

---

## 3. Agent with System Prompt

```javascript
const agent = createAgent({
  model,
  tools: [searchTool, calculatorTool],
  prompt: "You are a research assistant. Always cite your sources. Be concise.",
});

const result = await agent.invoke({
  messages: [{ role: "user", content: "What causes aurora borealis?" }],
});
```

---

## 4. Middleware

Middleware intercepts agent execution at two points:

- **`wrapModelCall`** — before/after the model generates a response
- **`wrapToolCall`** — before/after a tool is executed

```javascript
import { createMiddleware } from "langchain";

const loggingMiddleware = createMiddleware({
  name: "logging",

  // Intercept model calls
  wrapModelCall: async (options, next) => {
    console.log("Model input:", options.messages.length, "messages");
    const startTime = Date.now();

    const result = await next(options);

    const duration = Date.now() - startTime;
    console.log(`Model responded in ${duration}ms`);
    return result;
  },

  // Intercept tool calls
  wrapToolCall: async (options, next) => {
    console.log(`Calling tool: ${options.toolCall.name}`);
    console.log(`Args: ${JSON.stringify(options.toolCall.args)}`);

    const result = await next(options);

    console.log(`Tool result: ${result}`);
    return result;
  },
});

// Apply middleware to agent
const agent = createAgent({
  model,
  tools: [searchTool],
  middleware: [loggingMiddleware],
});
```

### Middleware Use Cases

```javascript
// Guardrail middleware — block sensitive tool calls
const guardrailMiddleware = createMiddleware({
  name: "guardrail",
  wrapToolCall: async (options, next) => {
    if (options.toolCall.name === "delete_file") {
      return "Action blocked: file deletion is not allowed.";
    }
    return next(options);
  },
});

// Caching middleware — cache repeated model calls
const cacheMiddleware = createMiddleware({
  name: "cache",
  wrapModelCall: async (options, next) => {
    const cacheKey = JSON.stringify(options.messages);
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const result = await next(options);
    cache.set(cacheKey, result);
    return result;
  },
});
```

---

## 5. Summarization Middleware

For long conversations that exceed token limits:

```javascript
import { summarizationMiddleware } from "langchain";

const middleware = summarizationMiddleware({
  // Model used for summarization (can differ from agent model)
  model: new ChatOpenAI({ modelName: "gpt-4o-mini" }),

  // When to trigger summarization
  trigger: {
    tokenCount: 1000, // summarize when messages exceed this token count
  },

  // How many recent messages to keep unsummarized
  keep: 5,
});

const agent = createAgent({
  model,
  tools: [searchTool],
  middleware: [middleware],
});

// Agent automatically summarizes old messages to stay within token limits
```

---

## 6. Multi-Agent Patterns

```javascript
// Specialized agents for different tasks
const researchAgent = createAgent({
  model,
  tools: [searchTool],
  prompt: "You are a research specialist. Find accurate information.",
});

const analysisAgent = createAgent({
  model,
  tools: [calculatorTool],
  prompt: "You are a data analyst. Analyze and compute results.",
});

// Orchestrate manually
const researchResult = await researchAgent.invoke({
  messages: [{ role: "user", content: "Find the GDP of Japan" }],
});

const analysisResult = await analysisAgent.invoke({
  messages: [
    {
      role: "user",
      content: `Analyze this data: ${researchResult.messages.at(-1).content}`,
    },
  ],
});
```

---

## Anti-Patterns

- **Too many tools** — agents get confused with 10+ tools; keep tool sets focused
- **Vague tool descriptions** — agents rely on descriptions to choose tools; be specific
- **No system prompt** — always provide context about the agent's role and constraints
- **Unbounded loops** — set a maximum number of agent steps to prevent infinite loops
- **Heavy middleware** — keep middleware lightweight; avoid blocking operations
- **Not using summarization** — long conversations will hit token limits; use `summarizationMiddleware`
