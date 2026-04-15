"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const REQUIRED_AGENTS = [
  "code-reviewer.agent.md",
  "debugger.agent.md",
  "technical-leader.agent.md",
];

const REQUIRED_SKILLS = ["page-content-crawler"];

const githubDir = path.join(__dirname, "..", "github");
const ALL_AGENTS = fs
  .readdirSync(path.join(githubDir, "agents"))
  .filter((f) => f.endsWith(".agent.md"))
  .sort();
const ALL_SKILLS = fs
  .readdirSync(path.join(githubDir, "skills"), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

function copyDirSync(src, dest, includeSet) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (includeSet && !includeSet.has(entry.name)) continue;
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
      const includeSet = new Set(template.includeAgents);
      copyDirSync(srcPath, destPath, includeSet);
    } else if (entry.isDirectory() && entry.name === "skills") {
      const includeSet = new Set(template.includeSkills);
      copyDirSync(srcPath, destPath, includeSet);
    } else if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function unique(...arrays) {
  return [...new Set(arrays.flat())].sort();
}

function toAgentLabel(agentFile) {
  return agentFile.replace(".agent.md", "");
}

function ensureInteractiveOrExit(message) {
  if (!process.stdin.isTTY) {
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}

// Register keypress events once to avoid duplicate listeners
let keypressInitialized = false;
function initKeypress() {
  if (!keypressInitialized) {
    readline.emitKeypressEvents(process.stdin);
    keypressInitialized = true;
  }
}

function redrawScreen(render) {
  // Clear screen, scrollback buffer, and move cursor to top-left.
  process.stdout.write("\x1b[2J\x1b[3J\x1b[H");
  process.stdout.write(render());
}

function selectOne({ title, options, hint }) {
  return new Promise((resolve) => {
    ensureInteractiveOrExit("interactive terminal required for selection.");
    let selected = 0;
    function render() {
      const output = [];
      output.push(`\n  ${title}\n`);
      for (let i = 0; i < options.length; i++) {
        const cursor = i === selected ? "\x1b[36m❯\x1b[0m" : " ";
        const label =
          i === selected
            ? `\x1b[36m${options[i].label}\x1b[0m`
            : options[i].label;
        const desc = options[i].description
          ? `  \x1b[2m${options[i].description}\x1b[0m`
          : "";
        output.push(`  ${cursor} ${label}${desc}`);
      }
      if (hint) {
        output.push(`\n  \x1b[2m${hint}\x1b[0m\n`);
      }
      return output.join("\n");
    }
    redrawScreen(render);
    initKeypress();
    process.stdin.setRawMode(true);
    process.stdin.resume();
    const onKeypress = (_, key) => {
      if (!key) return;
      if (key.name === "up") {
        selected = (selected - 1 + options.length) % options.length;
        redrawScreen(render);
      } else if (key.name === "down") {
        selected = (selected + 1) % options.length;
        redrawScreen(render);
      } else if (key.name === "return") {
        process.stdin.off("keypress", onKeypress);
        process.stdin.setRawMode(false);
        process.stdin.pause();
        resolve(options[selected].value);
      } else if (key.name === "c" && key.ctrl) {
        process.stdin.off("keypress", onKeypress);
        process.stdin.setRawMode(false);
        console.log("\n  Aborted.");
        process.exit(0);
      } else if (key.name === "escape") {
        process.stdin.off("keypress", onKeypress);
        process.stdin.setRawMode(false);
        console.log("\n  Aborted.");
        process.exit(0);
      }
    };
    process.stdin.on("keypress", onKeypress);
  });
}

function selectMany({ title, options, hint }) {
  return new Promise((resolve) => {
    ensureInteractiveOrExit("interactive terminal required for selection.");
    let selected = 0;
    const checks = options.map((option) => !!option.checked);
    const allIndices = options.map((_, i) => i);

    function render() {
      const output = [];
      const checked = checks.filter(Boolean).length;
      const total = options.length;
      output.push(
        `\n  ${title}  \x1b[2m(${checked}/${total} selected)\x1b[0m\n`,
      );

      // Viewport: reserve lines for header (3) + hints (2) + padding
      const termRows = process.stdout.rows || 24;
      const reserved = 7;
      const maxVisible = Math.max(5, termRows - reserved);
      let startPos = 0;
      if (allIndices.length > maxVisible) {
        startPos = Math.max(
          0,
          Math.min(
            selected - Math.floor(maxVisible / 2),
            allIndices.length - maxVisible,
          ),
        );
      }
      const endPos = Math.min(startPos + maxVisible, allIndices.length);

      if (startPos > 0) {
        output.push(`  \x1b[2m  ↑ ${startPos} more above\x1b[0m`);
      }
      for (let i = startPos; i < endPos; i++) {
        const isCurrent = i === selected;
        const cursor = isCurrent ? "\x1b[36m❯\x1b[0m" : " ";
        const mark = checks[i] ? "[x]" : "[ ]";
        const lock = options[i].required ? " \x1b[2m(required)\x1b[0m" : "";
        const label = isCurrent
          ? `\x1b[36m${options[i].label}\x1b[0m`
          : options[i].label;
        output.push(`  ${cursor} ${mark} ${label}${lock}`);
      }
      if (endPos < allIndices.length) {
        output.push(
          `  \x1b[2m  ↓ ${allIndices.length - endPos} more below\x1b[0m`,
        );
      }
      const hints = [
        "↑↓ navigate",
        "Space toggle",
        "a select all",
        "n deselect all",
        "Enter confirm",
      ];
      output.push(`\n  \x1b[2m${hints.join("  |  ")}\x1b[0m\n`);
      return output.join("\n");
    }

    redrawScreen(render);
    initKeypress();
    process.stdin.setRawMode(true);
    process.stdin.resume();

    const onKeypress = (ch, key) => {
      if (!key) return;

      if (key.name === "c" && key.ctrl) {
        process.stdin.off("keypress", onKeypress);
        process.stdin.setRawMode(false);
        console.log("\n  Aborted.");
        process.exit(0);
      } else if (key.name === "escape") {
        process.stdin.off("keypress", onKeypress);
        process.stdin.setRawMode(false);
        console.log("\n  Aborted.");
        process.exit(0);
      } else if (key.name === "up") {
        selected = (selected - 1 + options.length) % options.length;
        redrawScreen(render);
      } else if (key.name === "down") {
        selected = (selected + 1) % options.length;
        redrawScreen(render);
      } else if (key.name === "space") {
        if (!options[selected].required) {
          checks[selected] = !checks[selected];
          redrawScreen(render);
        }
      } else if (key.name === "return") {
        process.stdin.off("keypress", onKeypress);
        process.stdin.setRawMode(false);
        process.stdin.pause();
        const values = options
          .filter((_, index) => checks[index])
          .map((option) => option.value);
        resolve(values);
      } else if (ch === "a" && !key.ctrl && !key.meta) {
        for (let i = 0; i < options.length; i++) {
          if (!options[i].required) checks[i] = true;
        }
        redrawScreen(render);
      } else if (ch === "n" && !key.ctrl && !key.meta) {
        for (let i = 0; i < options.length; i++) {
          if (!options[i].required) checks[i] = false;
        }
        redrawScreen(render);
      }
    };
    process.stdin.on("keypress", onKeypress);
  });
}

async function selectAgents() {
  const requiredSet = new Set(REQUIRED_AGENTS);
  const options = ALL_AGENTS.map((agentFile) => ({
    label: toAgentLabel(agentFile),
    value: agentFile,
    checked: requiredSet.has(agentFile),
    required: requiredSet.has(agentFile),
  }));
  const selectedAgents = await selectMany({
    title: "Select agents:",
    options,
    hint: "Use ↑↓ to navigate, Space to toggle, Enter to confirm",
  });
  return unique(selectedAgents, REQUIRED_AGENTS);
}

async function selectSkills() {
  const requiredSet = new Set(REQUIRED_SKILLS);
  const options = ALL_SKILLS.map((skill) => ({
    label: skill,
    value: skill,
    checked: requiredSet.has(skill),
    required: requiredSet.has(skill),
  }));
  const selectedSkills = await selectMany({
    title: "Select skills:",
    options,
    hint: "Use ↑↓ to navigate, Space to toggle, Enter to confirm",
  });
  return unique(selectedSkills, REQUIRED_SKILLS);
}

module.exports = {
  copyWithTemplate,
  selectAgents,
  selectSkills,
};
