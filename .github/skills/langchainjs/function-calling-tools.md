---
name: langchainjs-function-calling-tools
description: "LangChain.js function calling & tools — defining tools with Zod schemas, binding tools to models, tool execution loop, multiple tools, provider built-in tools. Use when: giving LLMs ability to call functions; building tool-calling workflows; integrating external APIs. DO NOT USE FOR: autonomous agents (use agents); MCP tool servers (use mcp-integration)."
---

# LangChain.js Function Calling & Tools

## 1. Defining Tools

```javascript
import { tool } from "@langchain/core/tools";
import { z } from "zod";

// Define a tool with Zod schema
const weatherTool = tool(
  async ({ city }) => {
    // Tool implementation — call real API here
    return `The weather in ${city} is 72°F and sunny.`;
  },
  {
    name: "get_weather",
    description: "Get the current weather for a given city",
    schema: z.object({
      city: z.string().describe("The city to get weather for"),
    }),
  },
);

// Tool with multiple parameters
const calculatorTool = tool(
  async ({ operation, a, b }) => {
    switch (operation) {
      case "add":
        return `${a + b}`;
      case "subtract":
        return `${a - b}`;
      case "multiply":
        return `${a * b}`;
      case "divide":
        return b !== 0 ? `${a / b}` : "Cannot divide by zero";
      default:
        return "Unknown operation";
    }
  },
  {
    name: "calculator",
    description: "Perform basic math operations",
    schema: z.object({
      operation: z.enum(["add", "subtract", "multiply", "divide"]).describe("The math operation"),
      a: z.number().describe("First number"),
      b: z.number().describe("Second number"),
    }),
  },
);
```

---

## 2. Binding Tools to Models

```javascript
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({ modelName: "gpt-4o-mini" });

// Bind tools — model can now decide to call them
const modelWithTools = model.bindTools([weatherTool, calculatorTool]);

// Model will return tool_calls when it decides a tool is needed
const response = await modelWithTools.invoke("What's the weather in Tokyo?");

// Check if model wants to call a tool
if (response.tool_calls?.length > 0) {
  console.log("Tool calls:", response.tool_calls);
  // [{ name: "get_weather", args: { city: "Tokyo" }, id: "call_..." }]
}
```

---

## 3. Tool Execution Loop (3-Step Pattern)

```javascript
import { HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";

const modelWithTools = model.bindTools([weatherTool]);

// Step 1: Send user message → model decides to call tool
const messages = [new HumanMessage("What's the weather in Paris?")];
const aiResponse = await modelWithTools.invoke(messages);
messages.push(aiResponse);

// Step 2: Execute tool and add result
if (aiResponse.tool_calls?.length > 0) {
  for (const toolCall of aiResponse.tool_calls) {
    // Find and execute the matching tool
    const selectedTool = [weatherTool].find((t) => t.name === toolCall.name);
    const toolResult = await selectedTool.invoke(toolCall.args);

    // Add tool result as ToolMessage
    messages.push(
      new ToolMessage({
        content: toolResult,
        tool_call_id: toolCall.id,
      }),
    );
  }

  // Step 3: Model generates final response using tool results
  const finalResponse = await modelWithTools.invoke(messages);
  console.log(finalResponse.content);
}
```

---

## 4. Complete Tool Execution Example

```javascript
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

// Define tools
const searchTool = tool(
  async ({ query }) => {
    return `Results for "${query}": LangChain is a framework for LLM apps.`;
  },
  {
    name: "search",
    description: "Search the web for information",
    schema: z.object({
      query: z.string().describe("The search query"),
    }),
  },
);

const tools = [searchTool];
const model = new ChatOpenAI({ modelName: "gpt-4o-mini" });
const modelWithTools = model.bindTools(tools);

// Full execution loop
async function runWithTools(userMessage) {
  const messages = [new HumanMessage(userMessage)];

  // Loop until model responds without tool calls
  while (true) {
    const response = await modelWithTools.invoke(messages);
    messages.push(response);

    if (!response.tool_calls?.length) {
      return response.content; // Final answer
    }

    // Execute all tool calls
    for (const toolCall of response.tool_calls) {
      const matchedTool = tools.find((t) => t.name === toolCall.name);
      const result = await matchedTool.invoke(toolCall.args);
      messages.push(
        new ToolMessage({
          content: result,
          tool_call_id: toolCall.id,
        }),
      );
    }
  }
}

const answer = await runWithTools("What is LangChain?");
```

---

## 5. Provider Built-In Tools

```javascript
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({ modelName: "gpt-4o-mini" });

// Some providers offer built-in tools (e.g., web search)
const modelWithBuiltIn = model.bindTools([
  { type: "web_search_preview" }, // OpenAI built-in web search
]);

const response = await modelWithBuiltIn.invoke("What are the latest news about LangChain?");
```

---

## Anti-Patterns

- **Missing `.describe()` on schema fields** — descriptions tell the model when and how to use each parameter
- **Vague tool descriptions** — be specific about what the tool does and when to use it
- **Not handling missing tools** — always validate that `toolCall.name` matches available tools before invoking
- **Forgetting ToolMessage** — the model needs tool results via `ToolMessage` with matching `tool_call_id`
- **Single iteration without loop** — models may need multiple tool calls; use a loop pattern
- **Exposing sensitive operations** — validate tool inputs before executing; don't blindly trust model arguments
