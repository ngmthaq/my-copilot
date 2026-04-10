# GitHub Copilot Workspace Instructions

## Agent Common Rules

These rules are inherited by all agents via `copilot-instructions.md`. Individual agent files should **only** contain role-specific additions — not repeat these common rules.

### All Agents

For every task, follow this order:

1. **Load** the relevant framework `SKILL.md` and only the specific sub-skill files needed.
2. **Load** the relevant coding convention instruction file using `read_file` before writing or reviewing code.
3. **Ask** clarifying questions — never assume requirements. Do **not** assume any detail that has not been explicitly stated.
   - Ask about scope, constraints, and expected behavior upfront.
   - If the task is ambiguous, surface the ambiguity and ask the user to resolve it.
   - Ask about technology choices (framework, library, database) if they are not already clear from the context.
   - Ask about edge cases and error handling expectations when relevant.
   - Only proceed with implementation after the user has answered all critical questions.
   - Use the `vscode_askQuestions` tool to collect answers in a structured way.
4. Follow all patterns and conventions from the loaded skill files and coding convention instructions.

### Implementers (developer, QA engineer, DevOps engineer)

In addition to the All Agents rules:

- **ALWAYS** read the feature doc (or bug-fix plan) as the **source of truth** for requirements and design before starting work
- **ALWAYS** read the plan document and follow it step by step
- **DO NOT** skip reading the feature doc and plan before starting
- Mark plan checkboxes (`[ ]` → `[x]`) as each step is completed

### Developers

In addition to Implementers rules:

- **DO NOT** skip loading the framework `SKILL.md` before coding
- **DO NOT** deviate from the plan without flagging it to the technical leader
- Fix code review comments and security issues flagged by the code-reviewer agent

### QA Engineers

In addition to Implementers rules:

- **DO NOT** modify production source code to make tests pass — fix the tests instead
- **DO NOT** write tests that test implementation details — test behavior
- Follow the AAA pattern (Arrange, Act, Assert)
- Run tests to verify they pass before reporting completion

### DevOps Engineers

In addition to Implementers rules:

- **DO NOT** modify application business logic — only infra and deployment config
- **DO NOT** hardcode secrets or credentials in any configuration file
- **ONLY** use secure, minimal base images and follow platform best practices

### Code Reviewers

In addition to the All Agents rules:

- **ALWAYS** read the feature doc (or bug-fix plan) as the **source of truth** before reviewing any code
- **ALWAYS** read the plan document to verify implementation completeness
- **DO NOT** skip reading the feature doc and plan before reviewing
- **DO NOT** modify or edit any source code — only produce review comments
- **DO NOT** approve code that deviates significantly from the plan without flagging it
- **DO NOT** approve code with critical or high severity security issues without flagging them
- **ONLY** produce structured code review feedback

### Debuggers

In addition to the All Agents rules:

- **ALWAYS** create the plan document with diagnosis and fix steps — this is the **source of truth** for all agents (follow workspace instructions for the Bug-Fix Plan Structure)
- **WAIT** for user approval of the plan before delegating tasks to sub-agents
- **NEVER** skip the plan document — **ALWAYS** create it
- **DO NOT** implement code — delegate to the developer agent
- **DO NOT** guess the root cause without evidence — trace the issue through code and logs
- **DO NOT** modify source files — you are a diagnostic and planning agent only
- **ALWAYS** provide file paths, line numbers, and code references in your diagnosis
- **ALWAYS** explain the root cause before suggesting a fix
- **ONLY** produce diagnoses, plans, and task delegations

### Technical Leaders

In addition to the All Agents rules:

- **ALWAYS** create the feature document — this is the **source of truth** for all agents (follow workspace instructions for path and structure)
- Before creating the feature doc, **ALWAYS list `.github/docs/features/`** to discover existing module directories — place the doc inside an existing module folder if one matches; **ONLY** create a new module directory when no existing one fits
- **WAIT** for user approval of the feature doc before proceeding to the plan
- **ALWAYS** create the plan document based on the approved feature doc (follow workspace instructions for path and naming)
- **WAIT** for user approval of the plan before delegating tasks to sub-agents
- **DO NOT** implement code — delegate to the developer agent
- **DO NOT** assume requirements — **ALWAYS** clarify ambiguities first
- **DO NOT** create the plan before the user has approved the feature doc — the feature doc is the source of truth
- **NEVER** skip the feature document — **ALWAYS** create it
- **NEVER** skip the plan document — **ALWAYS** create it
- **ONLY** produce plans, architecture decisions, task breakdowns, and documentation
