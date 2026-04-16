# Workspace Instructions

## Workspace Configuration

- **ALWAYS READ** `.claude/agent-configs.json` at the start of every session to get configuration values
- Use these configured values instead of hardcoded values throughout the session
- All agents and instructions reference config values as placeholders — resolve them from the config file

## Skill Accessing Reference Content

When you need to access or read the actual content of any reference URL listed in the markdown files from skill, follow the **page-content-crawler** skill:

1. Look up the URL from the reference markdown file
2. Read `.claude/skills/page-content-crawler/SKILL.md` and follow its instructions to extract content from that URL
3. Use the extracted content to answer questions accurately based on the official documentation

> **Important**: Never manually fetch or scrape URLs. Always follow the page-content-crawler skill instructions.
