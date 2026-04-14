#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const { TEMPLATES } = require("./constants");
const {
  copyWithTemplate,
  selectTemplate,
  resolveTemplate,
} = require("./helpers");
const COMMAND = process.argv[2];

// --- Commands ---

async function init() {
  const sourceDir = path.join(__dirname, "..", "github");
  const targetDir = path.join(process.cwd(), ".github");
  const force = process.argv.includes("--force");
  if (!fs.existsSync(sourceDir)) {
    console.error("Error: github folder not found in the package.");
    process.exit(1);
  }
  if (fs.existsSync(targetDir)) {
    if (force) {
      const now = new Date();
      const timestamp = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
        String(now.getHours()).padStart(2, "0"),
        String(now.getMinutes()).padStart(2, "0"),
        String(now.getSeconds()).padStart(2, "0"),
      ].join("");
      const backupDir = path.join(process.cwd(), `.github-legacy-${timestamp}`);
      fs.renameSync(targetDir, backupDir);
      console.log(
        `  Backed up existing .github to ${path.basename(backupDir)}`,
      );
    } else {
      console.log(".github folder already exists in the current directory.");
      console.log("Use --force to overwrite.");
      process.exit(1);
    }
  }
  const template = resolveTemplate(process.argv) || (await selectTemplate());
  console.log(`\n  Template: \x1b[36m${template.label}\x1b[0m`);
  console.log(
    `  Agents: ${template.includeAgents.map((a) => a.replace(".agent.md", "")).join(", ")}`,
  );
  console.log(`  Skills: ${template.includeSkills.join(", ")}`);
  copyWithTemplate(sourceDir, targetDir, template);
  console.log(`\n  ✔ Copied .github folder to ${process.cwd()}\n`);
}

function showHelp() {
  const templateList = TEMPLATES.map(
    (t) => `    ${t.name.padEnd(28)} ${t.description}`,
  ).join("\n");
  console.log(`
  @ngmthaq/my-copilot

  Usage:
    npx @ngmthaq/my-copilot init [options]

  Commands:
    init      Copy the .github folder to the current directory

  Options:
    --template <name>   Use a template (skip interactive selection)
    --force             Rename existing .github to .github-legacy-<timestamp> and recreate
    --help              Show this help message

  Templates:
${templateList}
`);
}

// --- Main ---

switch (COMMAND) {
  case "init":
    init();
    break;
  case "--help":
  case "-h":
  case undefined:
    showHelp();
    break;
  default:
    console.error(`Unknown command: ${COMMAND}`);
    showHelp();
    process.exit(1);
}
