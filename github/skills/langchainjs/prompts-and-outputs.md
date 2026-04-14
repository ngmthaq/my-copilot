---
name: langchainjs-prompts-and-outputs
description: "LangChain.js prompts & structured outputs — messages vs templates decision, ChatPromptTemplate, PromptTemplate, few-shot prompting, template composition, structured outputs with Zod. Use when: creating reusable prompts; extracting structured data; few-shot examples. DO NOT USE FOR: basic message passing (use setup-and-fundamentals); tool calling (use function-calling-tools)."
---

# LangChain.js Prompts & Structured Outputs

## 1. Messages vs Templates Decision

```
Do you need reusable, parameterized prompts?
│
├─ No → Use direct message objects (HumanMessage, SystemMessage)
│
└─ Yes
    ├─ Single string input → PromptTemplate
    └─ Conversation with roles → ChatPromptTemplate
```

---

## 2. ChatPromptTemplate (Preferred)

```javascript
import { ChatPromptTemplate } from "@langchain/core/prompts";

// From template strings — uses {variable} syntax
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a {role} who speaks {language}."],
  ["human", "{input}"],
]);

// Format with variables
const messages = await prompt.formatMessages({
  role: "chef",
  language: "French",
  input: "How do I make croissants?",
});

const response = await model.invoke(messages);

// Chain prompt directly to model
const chain = prompt.pipe(model);
const response2 = await chain.invoke({
  role: "chef",
  language: "French",
  input: "How do I make croissants?",
});
```

---

## 3. PromptTemplate (Simple String)

```javascript
import { PromptTemplate } from "@langchain/core/prompts";

// Single string template
const prompt = PromptTemplate.fromTemplate(
  "Translate the following to {language}: {text}",
);

const formatted = await prompt.format({
  language: "Spanish",
  text: "Hello, world!",
});
// → "Translate the following to Spanish: Hello, world!"
```

---

## 4. Few-Shot Prompting

```javascript
import {
  FewShotChatMessagePromptTemplate,
  ChatPromptTemplate,
} from "@langchain/core/prompts";

// Define example template
const examplePrompt = ChatPromptTemplate.fromMessages([
  ["human", "{input}"],
  ["ai", "{output}"],
]);

// Provide examples
const examples = [
  { input: "dog", output: "animal" },
  { input: "rose", output: "flower" },
  { input: "Python", output: "programming language" },
];

// Create few-shot template
const fewShotPrompt = new FewShotChatMessagePromptTemplate({
  examplePrompt,
  examples,
  inputVariables: ["input"],
});

// Combine with system message
const finalPrompt = ChatPromptTemplate.fromMessages([
  ["system", "Classify the given word into a category."],
  fewShotPrompt,
  ["human", "{input}"],
]);

const chain = finalPrompt.pipe(model);
const response = await chain.invoke({ input: "TypeScript" });
```

---

## 5. Template Composition

```javascript
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Compose prompts from reusable parts
const systemTemplate = ChatPromptTemplate.fromMessages([
  ["system", "You are a {role}. Respond in {format} format."],
]);

const conversationTemplate = ChatPromptTemplate.fromMessages([
  ...systemTemplate.promptMessages,
  ["human", "{input}"],
]);

// MessagesPlaceholder for dynamic message insertion
import { MessagesPlaceholder } from "@langchain/core/prompts";

const promptWithHistory = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant."],
  new MessagesPlaceholder("history"),
  ["human", "{input}"],
]);

const response = await model.invoke(
  await promptWithHistory.formatMessages({
    history: [new HumanMessage("Hi!"), new AIMessage("Hello! How can I help?")],
    input: "What did I just say?",
  }),
);
```

---

## 6. Structured Outputs with Zod

```javascript
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({ modelName: "gpt-4o-mini" });

// Define output schema with Zod
const PersonSchema = z.object({
  name: z.string().describe("The person's full name"),
  age: z.number().describe("The person's age"),
  occupation: z.string().describe("The person's job title"),
  skills: z.array(z.string()).describe("List of skills"),
});

// Bind schema to model
const structuredModel = model.withStructuredOutput(PersonSchema, {
  strict: true, // enforce exact schema match
});

const result = await structuredModel.invoke(
  "Extract info: John Doe is a 30-year-old software engineer skilled in TypeScript and Python.",
);

// result is typed: { name: string, age: number, occupation: string, skills: string[] }
console.log(result.name); // "John Doe"
console.log(result.skills); // ["TypeScript", "Python"]
```

### Complex Nested Schemas

```javascript
const ReviewSchema = z.object({
  sentiment: z
    .enum(["positive", "negative", "neutral"])
    .describe("Overall sentiment"),
  score: z.number().min(1).max(5).describe("Rating from 1 to 5"),
  summary: z.string().describe("Brief summary of the review"),
  topics: z
    .array(
      z.object({
        name: z.string().describe("Topic name"),
        sentiment: z.enum(["positive", "negative", "neutral"]),
      }),
    )
    .describe("Topics mentioned in the review"),
});

const structuredModel = model.withStructuredOutput(ReviewSchema, {
  strict: true,
});

const analysis = await structuredModel.invoke(
  "Review: The food was amazing but the service was terrible. Great ambiance though.",
);
```

---

## 7. Chaining Prompts with Pipes

```javascript
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// Chain: prompt → model → parser
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a translator."],
  ["human", "Translate to {language}: {text}"],
]);

const chain = prompt.pipe(model).pipe(new StringOutputParser());

// Returns plain string instead of AIMessage
const translated = await chain.invoke({
  language: "Japanese",
  text: "Hello, world!",
});
```

---

## Anti-Patterns

- **String concatenation instead of templates** — use `ChatPromptTemplate` for parameterized prompts
- **Missing `.describe()` on Zod fields** — descriptions guide the model on what to extract
- **Not using `strict: true`** with `withStructuredOutput()` — without it, output may not match schema exactly
- **Overly complex schemas** — keep schemas focused; split into multiple calls if needed
- **Hardcoded examples in prompts** — use `FewShotChatMessagePromptTemplate` for maintainable few-shot prompting
