# Workspace Instructions

## Workspace Configuration

- **ALWAYS READ** `.claude/agent-configs.json` at the start of every session to get configuration values
- Use these configured values instead of hardcoded values throughout the session
- All agents and instructions reference config values as placeholders — resolve them from the config file
- Before implement any task, check if there are onboarding instructions for the project in `onboarding_directory` directory
- If onboarding instructions exist, Use this knowledge base to inform all future tasks and implementations for the project
- If onboarding instructions do not exist, follow current codebase implementations and patterns
