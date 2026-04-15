#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const { copyWithTemplate, selectAgents, selectSkills } = require("./helpers");
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

  const includeAgents = await selectAgents();
  const includeSkills = await selectSkills();
  const template = {
    label: "customize",
    includeAgents,
    includeSkills,
  };

  console.log(
    `\n  Agents: ${template.includeAgents.map((a) => a.replace(".agent.md", "")).join(", ")}`,
  );
  console.log(`  Skills: ${template.includeSkills.join(", ")}`);
  copyWithTemplate(sourceDir, targetDir, template);
  console.log(`\n  ✔ Copied .github folder to ${process.cwd()}\n`);
}

function showHelp() {
  console.log(`
  @ngmthaq20/my-copilot

  Usage:
    npx @ngmthaq20/my-copilot init [options]

  Commands:
    init      Copy the .github folder to the current directory
              (interactive: choose agents and skills)

  Options:
    --force             Rename existing .github to .github-legacy-<timestamp> and recreate
    --help              Show this help message
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
