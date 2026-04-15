# GitHub Copilot Workspace Instructions

## Workspace Configuration

- **ALWAYS READ** `.github/agent-configs.json` at the start of every session to get configuration values
- Use these configured values instead of hardcoded values throughout the session
- All agents and instructions reference config values as placeholders — resolve them from the config file

## Skill Accessing Reference Content

When you need to access or read the actual content of any reference URL listed in the markdown files from skill, use the **page-content-crawler** skill:

1. Look up the URL from the reference markdown file
2. Invoke the `page-content-crawler` skill to extract structured content from that URL
3. The page-content-crawler will use VSCode built-in page context first, with automatic fallback to external crawlers for SPA or incomplete content
4. Use the extracted content to answer questions accurately based on the official documentation

> **Important**: Never manually fetch or scrape URLs. Always delegate to the page-content-crawler skill.
