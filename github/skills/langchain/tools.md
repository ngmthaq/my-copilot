---
name: langchain-tools
description: "LangChain function calling and tools — @tool decorator, Pydantic schemas for parameters, bind_tools(), 3-step execution pattern (plan/do/communicate), ToolMessage, multi-tool systems. Use when: creating custom tools for LLMs; binding tools to models; executing tool calls; building multi-tool systems. DO NOT USE FOR: MCP server tools (use langchain-mcp); building autonomous agents (use langchain-agents); prompt engineering (use langchain-prompts-templates)."
---

# Function Calling & Tools

## Overview

Tools let LLMs call external functions. The LLM decides which tool to call and with what arguments — your code executes the function and returns results.

---

## 1. Creating Tools with @tool

```python
from langchain_core.tools import tool

@tool
def calculate(expression: str) -> str:
    """Calculate a mathematical expression.

    Args:
        expression: A math expression like '2 + 2' or '10 * 5'
    """
    return str(eval(expression))
```

### With Pydantic Schemas (Recommended for Complex Tools)

```python
from pydantic import BaseModel, Field
from langchain_core.tools import tool

class WeatherInput(BaseModel):
    city: str = Field(description="The city name to get weather for")
    unit: str = Field(default="celsius", description="Temperature unit: 'celsius' or 'fahrenheit'")

@tool(args_schema=WeatherInput)
def get_weather(city: str, unit: str = "celsius") -> str:
    """Get the current weather for a city."""
    return f"Weather in {city}: 22°{'C' if unit == 'celsius' else 'F'}, sunny"
```

### Tool Design Best Practices

| Practice                          | Why                                                    |
| --------------------------------- | ------------------------------------------------------ |
| Clear, descriptive tool name      | LLM reads the name to decide which tool to use         |
| Detailed docstring                | LLM uses docstring to understand tool purpose          |
| Pydantic schema with descriptions | Ensures proper parameter types and guides the LLM      |
| Return strings                    | LLMs process text; convert results to readable strings |

---

## 2. Binding Tools to Models

```python
from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    model=os.getenv("AI_MODEL"),
    base_url=os.getenv("AI_ENDPOINT"),
    api_key=os.getenv("AI_API_KEY"),
)

# Bind tools — model can now choose to call them
model_with_tools = model.bind_tools([calculate, get_weather])
```

---

## 3. Three-Step Execution Pattern

Tools follow a plan → do → communicate pattern:

```
1. LLM PLANS  → Generates tool_calls (which tool, what args)
2. YOU DO      → Execute the tool with the args
3. LLM TALKS  → Generates final response using the tool result
```

### Complete Example

```python
from langchain_core.messages import HumanMessage, ToolMessage

# Step 1: LLM plans (generates tool calls)
response = model_with_tools.invoke([HumanMessage(content="What's 25 * 4?")])

if response.tool_calls:
    tool_call = response.tool_calls[0]
    print(f"Tool: {tool_call['name']}, Args: {tool_call['args']}")

    # Step 2: Execute the tool
    result = calculate.invoke(tool_call["args"])

    # Step 3: Send result back to LLM for final response
    messages = [
        HumanMessage(content="What's 25 * 4?"),
        response,  # AIMessage with tool_calls
        ToolMessage(content=result, tool_call_id=tool_call["id"]),
    ]
    final = model_with_tools.invoke(messages)
    print(final.content)  # "25 × 4 = 100"
```

---

## 4. ToolMessage

Used to send tool execution results back to the model:

```python
from langchain_core.messages import ToolMessage

tool_msg = ToolMessage(
    content="The result is 100",       # Tool output (string)
    tool_call_id=tool_call["id"],      # Must match the tool_call ID
)
```

---

## 5. Multi-Tool Systems

Bind multiple tools — the LLM automatically selects the right one:

```python
@tool
def calculate(expression: str) -> str:
    """Calculate a mathematical expression."""
    return str(eval(expression))

@tool
def get_weather(city: str) -> str:
    """Get current weather for a city."""
    return f"Weather in {city}: 22°C, sunny"

@tool
def search_web(query: str) -> str:
    """Search the web for information."""
    return f"Search results for: {query}"

# Bind all tools
model_with_tools = model.bind_tools([calculate, get_weather, search_web])

# LLM chooses the right tool based on the query
response = model_with_tools.invoke("What's the weather in Paris?")
# → Calls get_weather with {"city": "Paris"}
```

---

## 6. Handling Multiple Tool Calls

Some queries trigger multiple tool calls in one response:

```python
response = model_with_tools.invoke("What's 2+2 and the weather in NYC?")

for tool_call in response.tool_calls:
    print(f"Tool: {tool_call['name']}, Args: {tool_call['args']}")

# Tool: calculate, Args: {'expression': '2+2'}
# Tool: get_weather, Args: {'city': 'NYC'}
```

---

## 7. Anti-Patterns

| Anti-Pattern                                           | Correct Approach                                                |
| ------------------------------------------------------ | --------------------------------------------------------------- |
| Vague tool descriptions ("does stuff")                 | Write clear docstrings explaining exactly what the tool does    |
| Skipping Pydantic schemas for complex parameters       | Use `args_schema=MyModel` for type safety and LLM guidance      |
| Forgetting `tool_call_id` in ToolMessage               | Always pass the matching `tool_call["id"]` from the response    |
| Executing tools without checking `response.tool_calls` | Always check if `response.tool_calls` is non-empty first        |
| Returning non-string values from tools                 | Convert results to strings — LLMs process text                  |
| Not handling tool execution errors                     | Wrap tool calls in try/except, return error messages as strings |
