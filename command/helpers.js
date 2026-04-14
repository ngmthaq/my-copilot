"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const {
  AGENT_SKILLS_MAP,
  ALL_AGENTS,
  REQUIRED_AGENTS,
  TEMPLATES,
} = require("./constants");

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

function redrawScreen(render) {
  // Full redraw avoids line-wrap corruption with long option lists.
  process.stdout.write("\x1b[2J\x1b[H");
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
    readline.emitKeypressEvents(process.stdin);
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
    function render() {
      const output = [];
      output.push(`\n  ${title}\n`);
      for (let i = 0; i < options.length; i++) {
        const isCurrent = i === selected;
        const cursor = isCurrent ? "\x1b[36m❯\x1b[0m" : " ";
        const mark = checks[i] ? "[x]" : "[ ]";
        const lock = options[i].required ? " \x1b[2m(required)\x1b[0m" : "";
        const label = isCurrent
          ? `\x1b[36m${options[i].label}\x1b[0m`
          : options[i].label;
        output.push(`  ${cursor} ${mark} ${label}${lock}`);
      }
      if (hint) {
        output.push(`\n  \x1b[2m${hint}\x1b[0m\n`);
      }
      return output.join("\n");
    }
    redrawScreen(render);
    readline.emitKeypressEvents(process.stdin);
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

function selectTemplate() {
  const options = TEMPLATES.map((template) => ({
    label: template.label,
    description: template.description,
    value: template,
  }));
  return selectOne({
    title: "Select a template:",
    options,
    hint: "Use ↑↓ arrows to navigate, Enter to select",
  });
}

function selectInitMode() {
  return selectOne({
    title: "Initialize from:",
    options: [
      {
        label: "Template",
        description: "Use predefined stack templates",
        value: "template",
      },
      {
        label: "Customize",
        description: "Choose agents and skills manually",
        value: "customize",
      },
    ],
    hint: "Use ↑↓ arrows to navigate, Enter to select",
  });
}

function filterSkillsByAgents(agents) {
  return unique(...agents.map((agent) => AGENT_SKILLS_MAP[agent] || []));
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

async function selectSkills(agents) {
  const filteredSkills = filterSkillsByAgents(agents);
  const options = filteredSkills.map((skill) => ({
    label: skill,
    value: skill,
    checked: false,
  }));
  if (!options.length) {
    return [];
  }
  return selectMany({
    title: "Select skills:",
    options,
    hint: "Use ↑↓ to navigate, Space to toggle, Enter to confirm",
  });
}

function resolveTemplate(argv) {
  const templateFlag = argv.find((a) => a.startsWith("--template="));
  const templateIdx = argv.indexOf("--template");
  if (templateFlag) {
    const name = templateFlag.split("=")[1];
    const template = TEMPLATES.find((t) => t.name === name);
    if (!template) {
      console.error(`Unknown template: ${name}`);
      console.error(
        "Available templates: " + TEMPLATES.map((t) => t.name).join(", "),
      );
      process.exit(1);
    }
    return template;
  }
  if (templateIdx !== -1 && argv[templateIdx + 1]) {
    const name = argv[templateIdx + 1];
    const template = TEMPLATES.find((t) => t.name === name);
    if (!template) {
      console.error(`Unknown template: ${name}`);
      console.error(
        "Available templates: " + TEMPLATES.map((t) => t.name).join(", "),
      );
      process.exit(1);
    }
    return template;
  }
  return null;
}

module.exports = {
  copyWithTemplate,
  filterSkillsByAgents,
  resolveTemplate,
  selectAgents,
  selectInitMode,
  selectSkills,
  selectTemplate,
};
