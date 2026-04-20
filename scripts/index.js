#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const {
  copyWithTemplate,
  selectTarget,
  ALL_AGENTS,
  ALL_SKILLS,
} = require("./helpers");
const COMMAND = process.argv[2];

// --- Commands ---

async function init() {
  const force = process.argv.includes("--force");
  const target = await selectTarget();
  const targetDir = path.join(process.cwd(), target);

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
      const backupDir = path.join(
        process.cwd(),
        `${target}-legacy-${timestamp}`,
      );
      fs.renameSync(targetDir, backupDir);
      console.log(
        `  Backed up existing ${target} to ${path.basename(backupDir)}`,
      );
    } else {
      console.log(`${target} folder already exists in the current directory.`);
      console.log("Use --force to overwrite.");
      process.exit(1);
    }
  }

  const includeAgents = ALL_AGENTS;
  const includeSkills = ALL_SKILLS;
  const template = {
    target,
    includeAgents,
    includeSkills,
  };

  console.log(
    `\n  Agents: ${template.includeAgents.map((a) => a.replace(".agent.md", "")).join(", ")}`,
  );
  console.log(`  Skills: ${template.includeSkills.join(", ")}`);
  copyWithTemplate(targetDir, template);
  console.log(`\n  ✔ Copied ${target} folder to ${process.cwd()}\n`);
}

function showHelp() {
  console.log(`
  @ngmthaq20/my-copilot

  Usage:
    npx @ngmthaq20/my-copilot init [options]

  Commands:
    init      Copy the configuration folder to the current directory
              (interactive: choose target, agents, and skills)
              Supported targets: .github (GitHub Copilot), .claude (Claude Code)

  Options:
    --force             Rename existing folder to <target>-legacy-<timestamp> and recreate
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
