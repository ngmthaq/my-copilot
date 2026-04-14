---
name: langchainjs-chat-models
description: "LangChain.js chat models — multi-turn conversations, streaming, model parameters, error handling, retries, token tracking. Use when: building chatbots; streaming responses; tuning temperature/tokens; handling API errors. DO NOT USE FOR: prompt templates (use prompts-and-outputs); tool calling (use function-calling-tools)."
---

# LangChain.js Chat Models

## 1. Multi-Turn Conversations

```javascript
import { ChatOpenAI } from "@langchain/openai";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";

const model = new ChatOpenAI({ modelName: "gpt-4o-mini" });

// Build conversation history manually
const messages = [
  new SystemMessage("You are a helpful assistant."),
  new HumanMessage("What is TypeScript?"),
  new AIMessage("TypeScript is a typed superset of JavaScript..."),
  new HumanMessage("How does it compare to Flow?"),
];

const response = await model.invoke(messages);
// Model has full conversation context
```

---

## 2. Streaming Responses

```javascript
const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  streaming: true,
});

// Stream chunks as they arrive
const stream = await model.stream("Write a poem about coding.");

for await (const chunk of stream) {
  process.stdout.write(chunk.content);
}

// Collect full response from stream
const chunks = [];
for await (const chunk of stream) {
  chunks.push(chunk.content);
}
const fullResponse = chunks.join("");
```

---

## 3. Model Parameters

```javascript
const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0, // 0 = deterministic, 1 = creative (default ~0.7)
  maxTokens: 500, // max tokens in response
  topP: 0.9, // nucleus sampling threshold
  frequencyPenalty: 0.5, // penalize repeated tokens
  presencePenalty: 0.5, // penalize tokens already present
  stop: ["\n\n"], // stop sequences
  timeout: 30000, // request timeout in ms
});
```

### Parameter Guidelines

| Parameter   | Low Values      | High Values     | Typical Use              |
| ----------- | --------------- | --------------- | ------------------------ |
| temperature | Deterministic   | Creative/random | 0 for code, 0.7 for chat |
| maxTokens   | Short responses | Long responses  | Set based on use case    |
| topP        | Focused output  | Diverse output  | Usually leave at 1       |

---

## 4. Error Handling with Retries

```javascript
// Built-in retry mechanism
const modelWithRetry = model.withRetry({
  stopAfterAttempt: 3,
});

// Handles transient errors (rate limits, network issues)
const response = await modelWithRetry.invoke("Hello!");

// Manual error handling
try {
  const response = await model.invoke("Hello!");
} catch (error) {
  if (error.status === 429) {
    console.error("Rate limited — wait and retry");
  } else if (error.status === 401) {
    console.error("Invalid API key");
  } else {
    console.error("Unexpected error:", error.message);
  }
}
```

---

## 5. Token Tracking

```javascript
const response = await model.invoke("Explain quantum computing.");

// Access token usage from response metadata
const usage = response.usage_metadata;
console.log(`Input tokens: ${usage.input_tokens}`);
console.log(`Output tokens: ${usage.output_tokens}`);
console.log(`Total tokens: ${usage.total_tokens}`);

// Use for cost estimation and budget tracking
```

---

## 6. Callbacks for Monitoring

```javascript
const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  callbacks: [
    {
      handleLLMStart: (llm, prompts) => {
        console.log("Starting LLM call...");
      },
      handleLLMEnd: (output) => {
        console.log("LLM call completed.");
      },
      handleLLMError: (error) => {
        console.error("LLM error:", error);
      },
    },
  ],
});
```

---

## Anti-Patterns

- **Unbounded conversation history** — token limits exist; implement summarization or sliding window for long conversations
- **Not using streaming for UX** — users perceive streaming as faster; always stream in interactive apps
- **Ignoring token counts** — track usage to avoid surprise costs
- **Retrying without backoff** — use `withRetry()` which handles backoff automatically
- **Setting temperature=1 for factual tasks** — use low temperature for deterministic/factual outputs
