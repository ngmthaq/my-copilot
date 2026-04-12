---
name: langchainjs-setup-and-fundamentals
description: "LangChain.js setup & fundamentals — installation, environment config, first LLM call, message types, model providers. Use when: setting up a LangChain.js project; making first LLM call; understanding message types; comparing providers. DO NOT USE FOR: multi-turn conversations (use chat-models); prompt templates (use prompts-and-outputs)."
---

# LangChain.js Setup & Fundamentals

## 1. Installation

```bash
# Core package + provider (OpenAI example)
npm install langchain @langchain/openai @langchain/core

# Other providers
npm install @langchain/anthropic   # Anthropic Claude
npm install @langchain/google-genai # Google Gemini
npm install @langchain/groq        # Groq
```

---

## 2. Environment Configuration

```bash
# .env file — never commit this
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AI...
```

```javascript
// Load environment variables
import "dotenv/config";

// Or load manually
import { config } from "dotenv";
config({ path: ".env" });
```

---

## 3. First LLM Call

```javascript
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0,
});

// Simple string invoke
const response = await model.invoke("What is LangChain?");
console.log(response.content);

// With message objects (preferred)
const response2 = await model.invoke([new HumanMessage("What is LangChain?")]);
console.log(response2.content);
```

---

## 4. Message Types

```javascript
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";

// SystemMessage — sets behavior/persona
const system = new SystemMessage("You are a helpful coding assistant.");

// HumanMessage — user input
const human = new HumanMessage("Explain closures in JavaScript.");

// AIMessage — model response (used in multi-turn context)
const ai = new AIMessage("A closure is a function that...");

// Combined conversation
const messages = [system, human];
const response = await model.invoke(messages);
```

---

## 5. Model Providers

```javascript
// OpenAI
import { ChatOpenAI } from "@langchain/openai";
const openai = new ChatOpenAI({ modelName: "gpt-4o-mini" });

// Anthropic
import { ChatAnthropic } from "@langchain/anthropic";
const anthropic = new ChatAnthropic({ modelName: "claude-sonnet-4-20250514" });

// Google Gemini
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
const gemini = new ChatGoogleGenerativeAI({ modelName: "gemini-2.0-flash" });

// All providers share the same interface
// Swap models without changing application logic
const response = await openai.invoke("Hello!");
const response2 = await anthropic.invoke("Hello!");
```

---

## 6. Response Structure

```javascript
const response = await model.invoke("Hello");

// AIMessage object
response.content; // string — the text response
response.response_metadata; // provider-specific metadata
response.usage_metadata; // { input_tokens, output_tokens, total_tokens }
response.id; // unique response ID
```

---

## Anti-Patterns

- **Hardcoding API keys** — always use environment variables
- **Skipping error handling** on model calls — network/API errors are common
- **Not specifying modelName** — defaults may change, always be explicit
- **Importing from wrong package** — messages come from `@langchain/core/messages`, models from provider packages
