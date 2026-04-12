---
name: langchain-prompts-templates
description: "LangChain prompts, templates, and structured outputs — ChatPromptTemplate, PromptTemplate, FewShotChatMessagePromptTemplate, structured outputs with Pydantic, output parsers. Use when: creating reusable prompt templates; formatting messages with variables; few-shot prompting; extracting structured data from LLM responses. DO NOT USE FOR: chat model setup (use langchain-chat-models); tool creation (use langchain-tools); agent workflows (use langchain-agents)."
---

# Prompts & Templates

## Overview

Prompts and templates provide reusable, parameterized ways to construct messages for LLMs. Structured outputs let you extract typed data from responses.

---

## 1. Messages vs Templates

| Approach        | Use When                               | Reusable? |
| --------------- | -------------------------------------- | --------- |
| Direct messages | One-off calls, simple conversations    | No        |
| Templates       | Repeated patterns with variable inputs | Yes       |

### Direct Messages (Simple)

```python
from langchain_core.messages import SystemMessage, HumanMessage

messages = [
    SystemMessage(content="You are a helpful assistant."),
    HumanMessage(content="What is Python?"),
]
response = model.invoke(messages)
```

### Templates (Reusable)

```python
from langchain_core.prompts import ChatPromptTemplate

template = ChatPromptTemplate.from_messages([
    ("system", "You are an expert in {topic}."),
    ("human", "{question}"),
])

# Reuse with different inputs
messages = template.invoke({"topic": "Python", "question": "What are decorators?"})
response = model.invoke(messages)
```

---

## 2. ChatPromptTemplate

The primary template for chat models:

```python
from langchain_core.prompts import ChatPromptTemplate

# From message tuples
template = ChatPromptTemplate.from_messages([
    ("system", "You are a {role} assistant."),
    ("human", "{user_input}"),
])

# Invoke with variables
messages = template.invoke({"role": "coding", "user_input": "Write a hello world"})
response = model.invoke(messages)
```

### Multi-Turn Template

```python
template = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful tutor."),
    ("human", "{question}"),
    ("ai", "Let me think about that..."),
    ("human", "Can you elaborate on {aspect}?"),
])
```

---

## 3. PromptTemplate (String-Based)

For simple string formatting without message structure:

```python
from langchain_core.prompts import PromptTemplate

template = PromptTemplate.from_template(
    "Explain {concept} in {language} with an example."
)

prompt = template.invoke({"concept": "recursion", "language": "Python"})
response = model.invoke(prompt.text)
```

---

## 4. Few-Shot Prompting

Provide examples to guide the model's output format:

```python
from langchain_core.prompts import ChatPromptTemplate, FewShotChatMessagePromptTemplate

# Define examples
examples = [
    {"input": "happy",  "output": "sad"},
    {"input": "tall",   "output": "short"},
    {"input": "bright", "output": "dark"},
]

# Create example template
example_template = ChatPromptTemplate.from_messages([
    ("human", "{input}"),
    ("ai", "{output}"),
])

# Build few-shot template
few_shot = FewShotChatMessagePromptTemplate(
    example_prompt=example_template,
    examples=examples,
)

# Combine with system message
final_template = ChatPromptTemplate.from_messages([
    ("system", "You give the opposite of each word."),
    few_shot,
    ("human", "{input}"),
])

response = model.invoke(final_template.invoke({"input": "cold"}))
print(response.content)  # "hot"
```

---

## 5. Structured Outputs with Pydantic

Extract typed, validated data from LLM responses:

```python
from pydantic import BaseModel, Field

class MovieReview(BaseModel):
    title: str = Field(description="The movie title")
    rating: int = Field(description="Rating from 1-10")
    summary: str = Field(description="Brief review summary")
    recommended: bool = Field(description="Whether you recommend it")

# Bind structured output to model
structured_model = model.with_structured_output(MovieReview)

response = structured_model.invoke("Review the movie Inception")
print(response.title)        # "Inception"
print(response.rating)       # 9
print(response.recommended)  # True
```

### Nested Structures

```python
from pydantic import BaseModel, Field

class Address(BaseModel):
    street: str
    city: str
    country: str

class Person(BaseModel):
    name: str = Field(description="Full name")
    age: int = Field(description="Age in years")
    address: Address = Field(description="Home address")

structured_model = model.with_structured_output(Person)
response = structured_model.invoke("Extract info: John Smith, 30, lives at 123 Main St, NYC, USA")
```

### Best Practices for Structured Outputs

| Practice                           | Why                                              |
| ---------------------------------- | ------------------------------------------------ |
| Add `Field(description=...)`       | Helps the LLM understand what each field expects |
| Use specific types (`int`, `bool`) | Ensures proper type coercion                     |
| Keep schemas focused               | Smaller schemas = more reliable extraction       |
| Validate with Pydantic             | Automatic type checking and error messages       |

---

## 6. Anti-Patterns

| Anti-Pattern                                   | Correct Approach                                                 |
| ---------------------------------------------- | ---------------------------------------------------------------- |
| String concatenation for prompts               | Use `ChatPromptTemplate` with variables                          |
| Duplicating prompt logic across files          | Define templates once, import and reuse                          |
| Using raw dicts for structured output          | Use Pydantic `BaseModel` with `with_structured_output()`         |
| Skipping `Field(description=...)` in Pydantic  | Always add descriptions — they guide the LLM's extraction        |
| Putting examples directly in the system prompt | Use `FewShotChatMessagePromptTemplate` for maintainable few-shot |
