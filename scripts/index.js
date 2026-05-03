#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");

const AVAILABLE_INSTRUCTION_FILE = {
  github: "copilot-instructions.md",
  claude: "CLAUDE.md",
};

function errorLog(message) {
  console.error("\x1b[31m%s\x1b[0m", message);
}

function successLog(message) {
  console.log("\x1b[32m%s\x1b[0m", message);
}

function infoLog(message) {
  console.log("\x1b[34m%s\x1b[0m", message);
}

async function init() {
  const TEMPLATE = process.argv[3];
  if (Object.keys(AVAILABLE_INSTRUCTION_FILE).indexOf(TEMPLATE) === -1) {
    errorLog(`An error occurred, unknown template: ${TEMPLATE}`);
    infoLog(
      `Supported templates: ${Object.keys(AVAILABLE_INSTRUCTION_FILE).join(", ")}`,
    );
    process.exit(1);
  }

  // Backup agent folder if it exists
  const agentDir = path.join(process.cwd(), `.${TEMPLATE}`);
  if (fs.existsSync(agentDir)) {
    const backupName = `.${TEMPLATE}_backup_${Date.now()}`;
    const backupDir = path.join(process.cwd(), backupName);
    fs.renameSync(agentDir, backupDir);
    successLog(`Existing .${TEMPLATE} directory backed up to ${backupName}`);
  }

  // Copy src directory to working directory
  const srcDir = path.join(__dirname, "..", "src");
  const destDir = path.join(process.cwd(), `.${TEMPLATE}`);
  fs.cpSync(srcDir, destDir, { recursive: true });

  // Rename default instruction file to corresponding template instruction file
  const instructionFile = AVAILABLE_INSTRUCTION_FILE[TEMPLATE];
  const defaultInstructionPath = path.join(destDir, "copilot-instructions.md");
  const destInstructionPath = path.join(
    process.cwd(),
    `.${TEMPLATE}`,
    instructionFile,
  );
  fs.renameSync(defaultInstructionPath, destInstructionPath);

  successLog(`Project initialized successfully with ${TEMPLATE} template!`);
}

function showHelp() {
  console.log(`
    > @ngmthaq20/my-copilot CLI

    Usage:
      npx @ngmthaq20/my-copilot@latest init [template]      - Initialize a new project
      npx @ngmthaq20/my-copilot@latest help                 - Show help message

    Templates:
      github    - Init .github directory with Github Copilot configuration
      claude    - Init .claude directory with Claude Code configuration
    `);
}

try {
  const COMMAND = process.argv[2];
  switch (COMMAND) {
    case "init":
      init();
      break;

    case undefined:
    case "help":
      showHelp();
      break;

    default:
      errorLog(`An error occurred, unknown command: ${COMMAND}`);
      infoLog(
        "Use 'npx @ngmthaq20/my-copilot@latest help' for usage information",
      );
      process.exit(1);
  }
} catch (error) {
  errorLog(`An error occurred: ${error.message}`);
  process.exit(1);
}
