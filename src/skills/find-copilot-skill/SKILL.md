---
name: find-copilot-skill
description: "Find an skill from awesome-copilot repository that matches a specific need or workflow."
---

# Find a Copilot Skill

To find a relevant skill from the awesome-copilot repository, follow these steps:

> **Note:** Make sure to replace `path/to/workspace/` with the actual path to your local workspace where you want to save the temporary file and `/path/to/skills/` with the actual path to your local `skills` folder. If not resolved, **DO NOT** proceed to the next steps and ask the user to provide the correct paths before continuing.

## Step 1: Fetch the README.skills.md file

Use `curl` to fetch the latest version of the README.skills.md file from the awesome-copilot repository:

```bash
curl -o path/to/workspace/__tmp__curl__/awesome-copilot/README.skills.md https://raw.githubusercontent.com/github/awesome-copilot/refs/heads/main/docs/README.skills.md
```

## Step 2: Search for relevant skills

Based on user prompt, get some keywords or phrases that describe the specific need or workflow. Use grep to search for skills that match your specific need or workflow. For example, if you are looking for skills related to "csharp", you can run:

```bash
grep -i "csharp" path/to/workspace/__tmp__curl__/awesome-copilot/README.skills.md
```

## Step 3: Ask user to install the skills

Once you find a relevant skills, review its details in the `Description` and `Bundled Assets` column to understand its purpose, usage, and any associated contents, scripts, tools or agents.

**Example prompt to user:**

```markdown
I found some skills related to "csharp" in the awesome-copilot repository. Would you like to install any of these skills and their associated assets? Please let me know which one you are interested in, and I can help you with the installation process.

| Name                        | Description                                                            | Bundled Assets |
| --------------------------- | ---------------------------------------------------------------------- | -------------- |
| csharp-async                | Get best practices for C# async programming                            | None           |
| csharp-mcp-server-generator | Generate a complete MCP server project in C#                           | None           |
| csharp-mstest               | Get best practices for MSTest 3.x/4.x unit testing,                    | None           |
| csharp-nunit                | Get best practices for NUnit unit testing, including data-driven tests | None           |
| csharp-tunit                | Get best practices for TUnit unit testing, including data-driven tests | None           |
| csharp-xunit                | Get best practices for XUnit unit testing, including data-driven tests | None           |
```

Follows up with the user to confirm if they want to install the skill and its associated assets. If they confirm, proceed to install the skill by following the instructions provided in the step 4.

## Step 4: Install the skill

Use `curl` to fetch the skill's file from the awesome-copilot repository and save it to the appropriate location in your local `skills` folder. For example, if you want to install the `csharp-async` skill, you can run:

For the skill file:

```bash
curl -o /path/to/skills/csharp-async/SKILL.md https://raw.githubusercontent.com/github/awesome-copilot/refs/heads/main/skills/csharp-async/SKILL.md
```

For the reference files:

```bash
curl -o /path/to/skills/csharp-async/references/csharp-async-code-example.md https://raw.githubusercontent.com/github/awesome-copilot/refs/heads/main/skills/csharp-async/references/csharp-async-code-example.md
```

## Step 5: Verify the installation

After installing the skill, verify that the skill file and its associated reference files are correctly saved in your local `skills` folder. You can open the skill file to review its content and ensure that it is properly formatted and contains the expected information.

Remove the temporary file after installation:

```bash
rm -rf path/to/workspace/__tmp__curl__/awesome-copilot
```

## Conclusion

By following these steps, you can easily find and install relevant skills from the awesome-copilot repository to enhance your AI copilot's capabilities and tailor it to your specific needs and workflows.
