"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Add a new entry here to support a new platform.
// Each key is the folder name that will be created in the user's project.
const PLATFORM_CONFIG = {
  ".github": {
    label: "GitHub Copilot",
    sourceDir: "github",
    agentsDir: "agents",
    skillsDir: "skills",
    toolsDir: "tools",
    rootFile: "copilot-instructions.md",
  },
  ".claude": {
    label: "Claude Code",
    sourceDir: "claude",
    agentsDir: "agents",
    skillsDir: "skills",
    toolsDir: "tools",
    rootFile: "CLAUDE.md",
  },
};

// Reference platform used to enumerate available agents (must have agent templates)
const REFERENCE_PLATFORM = ".github";

const rootDir = path.join(__dirname, "..");
const skillsDir = path.join(rootDir, "skills");
const toolsDir = path.join(rootDir, "tools");
const agentsDir = path.join(rootDir, "agents");
const agentConfigsPath = path.join(rootDir, "agent-configs.json");
const ALL_AGENTS = fs
  .readdirSync(
    path.join(
      rootDir,
      PLATFORM_CONFIG[REFERENCE_PLATFORM].sourceDir,
      PLATFORM_CONFIG[REFERENCE_PLATFORM].agentsDir,
    ),
  )
  .filter((f) => f.endsWith(".agent.md"))
  .sort();
const ALL_SKILLS = fs
  .readdirSync(skillsDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

// Pre-load all platform-specific files at module init time so they are available
// even if the source directory is renamed later (e.g. by --force backup in init()).
const PLATFORM_FILES = {};
for (const [platform, config] of Object.entries(PLATFORM_CONFIG)) {
  const platformDir = path.join(rootDir, config.sourceDir);
  PLATFORM_FILES[platform] = { agents: {}, rootFile: null };

  // Agent templates (frontmatter + placeholder)
  const templatesDir = path.join(platformDir, config.agentsDir);
  for (const agentFile of ALL_AGENTS) {
    const p = path.join(templatesDir, agentFile);
    if (fs.existsSync(p)) {
      PLATFORM_FILES[platform].agents[agentFile] = fs.readFileSync(p, "utf8");
    }
  }

  // Root instruction file (copilot-instructions.md or CLAUDE.md)
  const rootFilePath = path.join(platformDir, config.rootFile);
  if (fs.existsSync(rootFilePath)) {
    PLATFORM_FILES[platform].rootFile = fs.readFileSync(rootFilePath, "utf8");
  }
}

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

function copyWithTemplate(targetDir, template) {
  const target = template.target;
  const config = PLATFORM_CONFIG[target];
  const files = PLATFORM_FILES[target];

  fs.mkdirSync(targetDir, { recursive: true });

  // 1. Skills → platform-specific skills folder
  const includeSet = new Set(template.includeSkills);
  copyDirSync(skillsDir, path.join(targetDir, config.skillsDir), includeSet);

  // 2. Agents → platform-specific agents folder (keep template metadata, replace body placeholder)
  const agentsDestPath = path.join(targetDir, config.agentsDir);
  fs.mkdirSync(agentsDestPath, { recursive: true });
  for (const agentFile of template.includeAgents) {
    const agentName = agentFile.replace(".agent.md", "");
    const merged = files.agents[agentFile].replace(
      "<agent_content>",
      fs.readFileSync(path.join(agentsDir, `${agentName}.md`), "utf8"),
    );
    fs.writeFileSync(path.join(agentsDestPath, agentFile), merged);
  }

  // 3. agent-configs.json
  fs.writeFileSync(
    path.join(targetDir, "agent-configs.json"),
    fs.readFileSync(agentConfigsPath, "utf8").replaceAll("<target>", target),
  );

  // 4. Root instruction file (e.g. copilot-instructions.md or CLAUDE.md)
  if (files.rootFile !== null) {
    fs.writeFileSync(path.join(targetDir, config.rootFile), files.rootFile);
  }

  // 5. docs/
  const docsSourcePath = path.join(rootDir, config.sourceDir, "docs");
  if (fs.existsSync(docsSourcePath)) {
    copyDirSync(docsSourcePath, path.join(targetDir, "docs"));
  }

  // 6. tools/
  copyDirSync(toolsDir, path.join(targetDir, config.toolsDir));
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

async function selectTarget() {
  const options = Object.entries(PLATFORM_CONFIG).map(([folder, cfg]) => ({
    label: folder,
    value: folder,
    description: cfg.label,
  }));
  return selectOne({
    title: "Select target folder:",
    options,
    hint: "Use ↑↓ to navigate, Enter to confirm",
  });
}

module.exports = {
  copyWithTemplate,
  selectTarget,
  ALL_AGENTS,
  ALL_SKILLS,
};
