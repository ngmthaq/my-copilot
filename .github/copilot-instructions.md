# GitHub Copilot Workspace Instructions

## Objective

Guide AI assistants to generate consistent, maintainable, and production-quality code aligned with this repository.

---

## Core Principles

- Prioritize **clarity over complexity**
- Prefer **simple, maintainable solutions**
- Follow **existing patterns in the codebase**
- Keep code **modular and reusable**
- Avoid unnecessary abstractions
- Write code that is easy to read and reason about

---

## Code Generation Rules

- Generate **complete and functional code**
- Avoid placeholders unless explicitly requested
- Do not introduce new patterns without clear justification
- Reuse existing utilities and modules when possible
- Keep implementations minimal but correct

---

## Naming Conventions

- Use descriptive, meaningful names
- Avoid ambiguous names like `data`, `temp`, `value`
- Keep naming consistent across the codebase

---

## Code Structure

- Keep functions small and focused (single responsibility)
- Avoid deep nesting (max ~3 levels where possible)
- Extract reusable logic into separate functions/modules
- Organize code logically by responsibility

---

## Comments & Documentation

- Add comments only when necessary:
  - Complex logic
  - Non-obvious decisions
- Avoid redundant or obvious comments
- Prefer self-explanatory code over excessive comments

---

## Error Handling

- Handle errors explicitly
- Do not silently ignore failures
- Provide meaningful and actionable error messages
- Avoid exposing sensitive information

---

## Consistency

- Match formatting, structure, and patterns already used
- Follow existing linting and formatting rules
- Do not introduce conflicting styles

---

## Dependencies

- Avoid adding new dependencies unless necessary
- Prefer existing tools and libraries already in the project
- Keep external dependencies minimal

---

## Performance Awareness

- Avoid unnecessary computations
- Eliminate redundant operations
- Use efficient data handling when relevant

---

## Security Awareness

- Do not expose secrets or sensitive data
- Validate and sanitize inputs
- Avoid common vulnerabilities (injection, unsafe parsing, etc.)

---

## Testing Awareness

- Write code that is testable
- Prefer deterministic logic
- Avoid hidden side effects

---

## When Modifying Existing Code

- Preserve original intent and behavior
- Make minimal, focused changes
- Do not refactor unrelated parts unless explicitly asked

---

## When Explaining Code

- Be concise and precise
- Focus on reasoning and trade-offs
- Avoid unnecessary verbosity

---

## When Uncertain

- Choose the simplest valid solution
- Do not assume missing requirements
- Ask for clarification if needed

---

## Anti-Patterns to Avoid

- Large, complex functions
- Repetitive or duplicated code
- Hardcoded values without reason
- Deeply nested logic
- Over-engineering

---

## Workspace Configuration

- **ALWAYS READ** `.github/agent-configs.json` at the start of every session to get configuration values
- Use these configured values instead of hardcoded values throughout the session
- All agents and instructions reference config values as placeholders — resolve them from the config file

---

## Summary

Act as a disciplined engineering assistant:

- Follow existing patterns
- Keep solutions simple and robust
- Optimize for long-term maintainability
