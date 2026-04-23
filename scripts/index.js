#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");

const AVAILABLE_TEMPLATES = ["github", "claude"];
const INSTRUCTION_FILES = {
  [AVAILABLE_TEMPLATES[0]]: "copilot-instructions.md",
  [AVAILABLE_TEMPLATES[1]]: "CLAUDE.md",
};
const CWD = process.cwd();

function getCommand() {
  const args = process.argv.slice(2);
  return args[0];
}

function getTemplate() {
  const args = process.argv.slice(2);
  const normalizedTemplate = args[1] ? args[1].trim() : "";
  const template = AVAILABLE_TEMPLATES.includes(normalizedTemplate)
    ? normalizedTemplate
    : null;
  if (!template) {
    throw new Error(
      `Invalid template: ${args[1]}. Available templates: ${AVAILABLE_TEMPLATES.join(", ")}`,
    );
  }
  return template;
}

async function backupExistingDirectory(template) {
  const targetDir = path.join(CWD, `.${template}`);
  if (fs.existsSync(targetDir)) {
    const now = new Date();
    const timestamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
      String(now.getHours()).padStart(2, "0"),
      String(now.getMinutes()).padStart(2, "0"),
      String(now.getSeconds()).padStart(2, "0"),
    ].join("");
    const backupDir = path.join(CWD, `.${template}-legacy-${timestamp}`);
    fs.renameSync(targetDir, backupDir);
    console.warn(
      `Existing .${template} directory renamed to ${backupDir} to prevent data loss.`,
    );
  }
}

function copyAgents(template) {
  const agentPath = path.join(__dirname, "..", "agents", template);
  const agentFiles = fs
    .readdirSync(agentPath, { withFileTypes: true })
    .filter((dir) => !dir.isDirectory())
    .map((dir) => dir.name);
  const targetDir = path.join(CWD, `.${template}`);
  const agentDir = path.join(targetDir, "agents");
  fs.mkdirSync(agentDir, { recursive: true });
  agentFiles.forEach((file) => {
    const src = path.join(agentPath, file);
    const target = path.join(agentDir, file);
    fs.copyFileSync(src, target);
  });
}

function copySkills(template) {
  const skillPath = path.join(__dirname, "..", "skills");
  const skillFiles = fs
    .readdirSync(skillPath, { withFileTypes: true })
    .map((dir) => dir.name);
  const targetDir = path.join(CWD, `.${template}`);
  const skillDir = path.join(targetDir, "skills");
  fs.mkdirSync(skillDir, { recursive: true });
  skillFiles.forEach((file) => {
    const src = path.join(skillPath, file);
    const target = path.join(skillDir, file);
    fs.cpSync(src, target, { recursive: true });
  });
}

function copyInstructions(template) {
  fs.copyFileSync(
    path.join(__dirname, "..", "INSTRUCTIONS.md"),
    path.join(CWD, `.${template}`, INSTRUCTION_FILES[template]),
  );
  fs.copyFileSync(
    path.join(__dirname, "..", "README.md"),
    path.join(CWD, `.${template}`, "README.md"),
  );
}

function createDocFolder(template) {
  fs.mkdirSync(path.join(CWD, `.${template}`, "docs"));
}

async function init() {
  const template = getTemplate();
  backupExistingDirectory(template);
  copyAgents(template);
  copySkills(template);
  copyInstructions(template);
  createDocFolder(template);
  console.log(`Project initialized with ${template} template!`);
}

function showHelp() {
  console.log(`
    @ngmthaq20/my-copilot CLI

    Usage:
      npx @ngmthaq20/my-copilot@latest init [template]        Initialize a new project
      npx @ngmthaq20/my-copilot@latest help                   Show help message

    Templates:
      github      Init .github directory with Github Copilot configuration
      claude      Init .claude directory with Claude Code configuration
    `);
}

try {
  const COMMAND = getCommand();
  switch (COMMAND) {
    case "init":
      init();
      break;

    case undefined:
    case "help":
      showHelp();
      break;

    default:
      console.error(`Unknown command: ${COMMAND}`);
      showHelp();
      process.exit(1);
  }
} catch (error) {
  console.error("An error occurred:", error.message);
  process.exit(1);
}
