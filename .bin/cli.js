#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const COMMAND = process.argv[2];

// --- Template Definitions ---

const AI_AGENTS = ["ai-engineer.agent.md"];
const MOBILE_AGENTS = ["mobile-developer.agent.md"];
const DESKTOP_AGENTS = ["desktop-app-developer.agent.md"];
const FE_AGENTS = ["fe-developer.agent.md"];

const AI_SKILLS = ["huggingface", "langchain", "langchainjs", "ollama", "python"];
const MOBILE_SKILLS = ["dart", "flutter", "react-native"];
const DESKTOP_SKILLS = ["electron-forge", "electronjs"];
const FE_SKILLS = [
  "css",
  "html",
  "javascript",
  "reactjs",
  "vuejs-composition-api",
  "vuejs-options-api",
  "vite",
  "linting",
];

const TEMPLATES = [
  {
    name: "all",
    label: "All (everything)",
    description: "All agents and skills — no exclusions",
    excludeAgents: [],
    excludeSkills: [],
  },
  {
    name: "web-fullstack",
    label: "Web Fullstack",
    description: "Frontend + Backend (exclude AI, Mobile, Desktop)",
    excludeAgents: [...AI_AGENTS, ...MOBILE_AGENTS, ...DESKTOP_AGENTS],
    excludeSkills: [...AI_SKILLS, ...MOBILE_SKILLS, ...DESKTOP_SKILLS],
  },
  {
    name: "ai-application-fullstack",
    label: "AI Application Fullstack",
    description: "AI + Frontend + Backend (exclude Mobile, Desktop)",
    excludeAgents: [...MOBILE_AGENTS, ...DESKTOP_AGENTS],
    excludeSkills: [...MOBILE_SKILLS, ...DESKTOP_SKILLS],
  },
  {
    name: "mobile-fullstack",
    label: "Mobile Fullstack",
    description: "Mobile + Backend (exclude AI, Desktop, Web Frontend)",
    excludeAgents: [...AI_AGENTS, ...DESKTOP_AGENTS, ...FE_AGENTS],
    excludeSkills: [...AI_SKILLS, ...DESKTOP_SKILLS, ...FE_SKILLS],
  },
  {
    name: "desktop-app-fullstack",
    label: "Desktop App Fullstack",
    description: "Desktop + Backend (exclude AI, Mobile, Web Frontend)",
    excludeAgents: [...AI_AGENTS, ...MOBILE_AGENTS, ...FE_AGENTS],
    excludeSkills: [...AI_SKILLS, ...MOBILE_SKILLS, ...FE_SKILLS],
  },
  {
    name: "backend-only",
    label: "Backend Only",
    description: "Backend APIs only (exclude AI, Mobile, Desktop, Web Frontend)",
    excludeAgents: [...AI_AGENTS, ...MOBILE_AGENTS, ...DESKTOP_AGENTS, ...FE_AGENTS],
    excludeSkills: [...AI_SKILLS, ...MOBILE_SKILLS, ...DESKTOP_SKILLS, ...FE_SKILLS],
  },
  {
    name: "ai-backend",
    label: "AI + Backend",
    description: "AI services + Backend APIs (exclude Mobile, Desktop, Web Frontend)",
    excludeAgents: [...MOBILE_AGENTS, ...DESKTOP_AGENTS, ...FE_AGENTS],
    excludeSkills: [...MOBILE_SKILLS, ...DESKTOP_SKILLS, ...FE_SKILLS],
  },
];

// --- File Operations ---

function copyDirSync(src, dest, excludeSet) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (excludeSet && excludeSet.has(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function copyWithTemplate(sourceDir, targetDir, template) {
  fs.mkdirSync(targetDir, { recursive: true });
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(sourceDir, entry.name);
    const destPath = path.join(targetDir, entry.name);

    if (entry.isDirectory() && entry.name === "agents") {
      const excludeSet = new Set(template.excludeAgents);
      copyDirSync(srcPath, destPath, excludeSet);
    } else if (entry.isDirectory() && entry.name === "skills") {
      const excludeSet = new Set(template.excludeSkills);
      copyDirSync(srcPath, destPath, excludeSet);
    } else if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// --- TUI Arrow-Key Selector ---

function selectTemplate() {
  return new Promise((resolve) => {
    let selected = 0;

    function render() {
      // Move cursor up to overwrite previous render (except first render)
      const output = [];
      output.push("\n  Select a template:\n");
      for (let i = 0; i < TEMPLATES.length; i++) {
        const cursor = i === selected ? "\x1b[36m❯\x1b[0m" : " ";
        const label =
          i === selected
            ? `\x1b[36m${TEMPLATES[i].label}\x1b[0m`
            : TEMPLATES[i].label;
        const desc = `\x1b[2m${TEMPLATES[i].description}\x1b[0m`;
        output.push(`  ${cursor} ${label}  ${desc}`);
      }
      output.push("\n  \x1b[2mUse ↑↓ arrows to navigate, Enter to select\x1b[0m\n");
      return output.join("\n");
    }

    const totalLines = TEMPLATES.length + 5;

    process.stdout.write(render());

    if (!process.stdin.isTTY) {
      console.error("Error: interactive terminal required for template selection.");
      console.error("Use --template <name> to specify a template non-interactively.");
      process.exit(1);
    }

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();

    process.stdin.on("keypress", (_, key) => {
      if (!key) return;

      if (key.name === "up") {
        selected = (selected - 1 + TEMPLATES.length) % TEMPLATES.length;
        process.stdout.write(`\x1b[${totalLines}A`);
        process.stdout.write(render());
      } else if (key.name === "down") {
        selected = (selected + 1) % TEMPLATES.length;
        process.stdout.write(`\x1b[${totalLines}A`);
        process.stdout.write(render());
      } else if (key.name === "return") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        resolve(TEMPLATES[selected]);
      } else if (key.name === "c" && key.ctrl) {
        process.stdin.setRawMode(false);
        console.log("\n  Aborted.");
        process.exit(0);
      } else if (key.name === "escape") {
        process.stdin.setRawMode(false);
        console.log("\n  Aborted.");
        process.exit(0);
      }
    });
  });
}

// --- Commands ---

async function init() {
  const sourceDir = path.join(__dirname, "..", ".github");
  const targetDir = path.join(process.cwd(), ".github");
  const force = process.argv.includes("--force");

  if (!fs.existsSync(sourceDir)) {
    console.error("Error: .github folder not found in the package.");
    process.exit(1);
  }

  if (fs.existsSync(targetDir)) {
    if (force) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    } else {
      console.log(".github folder already exists in the current directory.");
      console.log("Use --force to overwrite.");
      process.exit(1);
    }
  }

  // Resolve template: --template flag or interactive TUI
  const templateFlag = process.argv.find((a) => a.startsWith("--template="));
  const templateIdx = process.argv.indexOf("--template");
  let template;

  if (templateFlag) {
    const name = templateFlag.split("=")[1];
    template = TEMPLATES.find((t) => t.name === name);
    if (!template) {
      console.error(`Unknown template: ${name}`);
      console.error("Available templates: " + TEMPLATES.map((t) => t.name).join(", "));
      process.exit(1);
    }
  } else if (templateIdx !== -1 && process.argv[templateIdx + 1]) {
    const name = process.argv[templateIdx + 1];
    template = TEMPLATES.find((t) => t.name === name);
    if (!template) {
      console.error(`Unknown template: ${name}`);
      console.error("Available templates: " + TEMPLATES.map((t) => t.name).join(", "));
      process.exit(1);
    }
  } else {
    template = await selectTemplate();
  }

  console.log(`\n  Template: \x1b[36m${template.label}\x1b[0m`);

  if (template.excludeAgents.length > 0) {
    console.log(`  Excluded agents: ${template.excludeAgents.map((a) => a.replace(".agent.md", "")).join(", ")}`);
  }
  if (template.excludeSkills.length > 0) {
    console.log(`  Excluded skills: ${template.excludeSkills.join(", ")}`);
  }

  copyWithTemplate(sourceDir, targetDir, template);
  console.log(`\n  ✔ Copied .github folder to ${process.cwd()}\n`);
}

function showHelp() {
  const templateList = TEMPLATES.map((t) => `    ${t.name.padEnd(28)} ${t.description}`).join("\n");

  console.log(`
  @ngmthaq/my-copilot

  Usage:
    npx @ngmthaq/my-copilot init [options]

  Commands:
    init      Copy the .github folder to the current directory

  Options:
    --template <name>   Use a template (skip interactive selection)
    --force             Overwrite existing .github folder
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
