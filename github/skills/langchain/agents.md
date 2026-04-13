---
name: langchain-agents
description: "LangChain agents — create_agent(), ReAct pattern (Reason→Act→Observe→Repeat), manual agent loops, AgentMiddleware, DynamicModelMiddleware, ToolErrorMiddleware. Use when: building autonomous agents that decide which tools to call; implementing ReAct loops; adding agent middleware for error handling or model switching. DO NOT USE FOR: creating tools (use langchain-tools); MCP integration (use langchain-mcp); document retrieval agents (use langchain-agentic-rag)."
---

# Agents

## Overview

Agents are autonomous systems that use the ReAct pattern (Reason → Act → Observe → Repeat) to decide which tools to use and when. LangChain provides `create_agent()` as a high-level API that handles the reasoning loop automatically.

---

## 1. Creating an Agent

```python
import os
from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain_core.messages import HumanMessage
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI

load_dotenv()

@tool
def calculate(expression: str) -> str:
    """Calculate a mathematical expression."""
    return str(eval(expression))

@tool
def get_weather(city: str) -> str:
    """Get current weather for a city."""
    return f"Weather in {city}: 22°C, sunny"

model = ChatOpenAI(
    model=os.getenv("AI_MODEL"),
    base_url=os.getenv("AI_ENDPOINT"),
    api_key=os.getenv("AI_API_KEY"),
)

agent = create_agent(model, tools=[calculate, get_weather])
```

---

## 2. Running an Agent

```python
# Invoke the agent with a query
response = agent.invoke({"messages": [HumanMessage(content="What is 25 * 4?")]})

# Get the final answer
answer = response["messages"][-1].content
print(answer)  # "25 × 4 = 100"
```

### With System Prompt

```python
agent = create_agent(
    model,
    tools=[calculate, get_weather],
    system_prompt="You are a helpful assistant. Always show your work step by step.",
)
```

### Async Invocation

```python
import asyncio

async def run_agent():
    response = await agent.ainvoke({"messages": [("human", "What is 25 * 4?")]})
    print(response["messages"][-1].content)

asyncio.run(run_agent())
```

---

## 3. ReAct Pattern

The agent follows a Reason → Act → Observe → Repeat loop:

```
User: "What's the weather in Paris and what's 15 * 23?"

Agent THINKS: I need weather info and a calculation. Let me use tools.
  → CALLS get_weather(city="Paris")
  → OBSERVES: "Weather in Paris: 22°C, sunny"
  → CALLS calculate(expression="15 * 23")
  → OBSERVES: "345"
  → RESPONDS: "The weather in Paris is 22°C and sunny. 15 × 23 = 345."
```

The agent automatically:

- Decides which tools to call (or none)
- Executes tools and reads results
- Continues reasoning until it has a complete answer

---

## 4. Manual ReAct Loop

For custom control over the agent loop:

```python
from langchain_core.messages import HumanMessage, ToolMessage

model_with_tools = model.bind_tools([calculate, get_weather])

messages = [HumanMessage(content="What's 25 * 4 + the temperature in NYC?")]

# Manual ReAct loop
while True:
    response = model_with_tools.invoke(messages)
    messages.append(response)

    if not response.tool_calls:
        break  # No more tools to call — final answer

    for tool_call in response.tool_calls:
        # Execute the tool
        tool_map = {"calculate": calculate, "get_weather": get_weather}
        tool_fn = tool_map[tool_call["name"]]
        result = tool_fn.invoke(tool_call["args"])

        # Add result to messages
        messages.append(ToolMessage(content=result, tool_call_id=tool_call["id"]))

# Final answer
print(messages[-1].content)
```

---

## 5. Agent Middleware

Middleware wraps agent behavior for cross-cutting concerns:

### DynamicModelMiddleware — Switch Models by Complexity

```python
from langchain.agents import AgentMiddleware

class DynamicModelMiddleware(AgentMiddleware):
    def wrap_model_call(self, messages, model, **kwargs):
        # Use a cheaper model for simple queries
        if len(messages) < 3:
            model = simple_model
        else:
            model = powerful_model
        return model.invoke(messages, **kwargs)
```

### ToolErrorMiddleware — Graceful Error Handling

```python
class ToolErrorMiddleware(AgentMiddleware):
    def wrap_tool_call(self, tool_call, tool, **kwargs):
        try:
            return tool.invoke(tool_call["args"])
        except Exception as e:
            return f"Tool error: {e}. Please try a different approach."
```

---

## 6. Troubleshooting

| Problem                   | Cause                                    | Fix                                                   |
| ------------------------- | ---------------------------------------- | ----------------------------------------------------- |
| Agent loops infinitely    | Tool returns unclear results             | Improve tool descriptions; add max iteration limit    |
| Agent calls wrong tool    | Vague or overlapping tool descriptions   | Make descriptions specific and distinct               |
| "Tool not found" error    | Tool not included in tools list          | Ensure all tools are passed to `create_agent()`       |
| Agent ignores tools       | Query doesn't match any tool description | Rephrase query or improve tool descriptions           |
| Agent repeats same action | Tool output doesn't resolve the question | Return clearer results from tools; add error messages |

---

## 7. Anti-Patterns

| Anti-Pattern                                       | Correct Approach                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| Building custom agent loops for standard use cases | Use `create_agent()` — it handles ReAct automatically              |
| Overlapping tool descriptions                      | Each tool should have a unique, specific purpose                   |
| No system prompt                                   | Always provide a system prompt to set agent behavior and scope     |
| Ignoring the agent's tool call decisions           | Trust the agent loop; debug tool descriptions if choices are wrong |
| No timeout or iteration limit                      | Use `asyncio.wait_for()` or max iteration checks in production     |
