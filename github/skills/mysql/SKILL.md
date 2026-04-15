---
name: mysql
description: "Reference links for MySQL relational database documentation, SQL queries, joins, and administration."
---

# MySQL

## Purpose

Provide curated reference links for MySQL documentation. Use these links to quickly look up official docs, tutorials, and API references.

## When to Use

- When you need to find official documentation links for MySQL
- When answering questions about MySQL and want to cite sources
- When building learning paths or documentation indexes

## Table of Contents

- [w3school-mysql-references.json](./w3school-mysql-references.json)

## Constraints

- Links may become outdated as documentation sites update their URLs
- Only contains links crawled at a specific point in time; may not cover every topic
- Do not assume link content — always verify by visiting the URL

## Accessing Reference Content

When you need to access or read the actual content of any reference URL listed in the JSON files from skill, use the **page-content-crawler** skill:

1. Look up the URL from the reference JSON file
2. Invoke the `page-content-crawler` skill to extract structured content from that URL
3. The page-content-crawler will use VSCode built-in page context first, with automatic fallback to external crawlers for SPA or incomplete content
4. Use the extracted content to answer questions accurately based on the official documentation

> **Important**: Never manually fetch or scrape URLs. Always delegate to the page-content-crawler skill.

## Best Practices

- Use the reference links to point users to the most relevant documentation page
- Combine multiple reference files in this folder for comprehensive answers
- Cross-reference with other related skill folders when topics overlap
- When users ask about specific content from a reference page, use the page-content-crawler skill to fetch and extract the content

## Anti-Patterns

- Do not fabricate links that are not in the reference files
- Do not rely solely on link titles — verify content when accuracy matters
- Do not use these references as a substitute for reading actual documentation
