"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { TEMPLATES } = require("./constants");

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

function selectTemplate() {
  return new Promise((resolve) => {
    let selected = 0;
    function render() {
      const output = [];
      output.push("\n  Select a template:\n");
      for (let i = 0; i < TEMPLATES.length; i++) {
        const cursor = i === selected ? "\x1b[36m❯\x1b[0m" : " ";
        const label = i === selected ? `\x1b[36m${TEMPLATES[i].label}\x1b[0m` : TEMPLATES[i].label;
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

function resolveTemplate(argv) {
  const templateFlag = argv.find((a) => a.startsWith("--template="));
  const templateIdx = argv.indexOf("--template");
  if (templateFlag) {
    const name = templateFlag.split("=")[1];
    const template = TEMPLATES.find((t) => t.name === name);
    if (!template) {
      console.error(`Unknown template: ${name}`);
      console.error("Available templates: " + TEMPLATES.map((t) => t.name).join(", "));
      process.exit(1);
    }
    return template;
  }
  if (templateIdx !== -1 && argv[templateIdx + 1]) {
    const name = argv[templateIdx + 1];
    const template = TEMPLATES.find((t) => t.name === name);
    if (!template) {
      console.error(`Unknown template: ${name}`);
      console.error("Available templates: " + TEMPLATES.map((t) => t.name).join(", "));
      process.exit(1);
    }
    return template;
  }
  return null;
}

module.exports = { copyWithTemplate, selectTemplate, resolveTemplate };
