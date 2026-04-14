"use strict";

// Merge and deduplicate arrays
const unique = (...arrays) => [...new Set(arrays.flat())].sort();

const REQUIRED_AGENTS = [
  "code-reviewer.agent.md",
  "debugger.agent.md",
  "technical-leader.agent.md",
];

// Specific agents for Backend development
const BE_AGENTS = [
  ...REQUIRED_AGENTS,
  "be-developer.agent.md",
  "devops-engineer.agent.md",
  "qa-engineer.agent.md",
];

// Specific skills for Backend development
const BE_SKILLS = [
  "asp",
  "aws",
  "bash",
  "c",
  "cpp",
  "csharp",
  "django",
  "docker",
  "eslint",
  "expressjs",
  "git",
  "go",
  "graphql",
  "java",
  "javascript",
  "mongodb",
  "mysql",
  "nestjs",
  "nginx",
  "nodejs",
  "page-content-crawler",
  "php",
  "postgresql",
  "prettier",
  "prisma",
  "rust",
  "spring",
  "sql",
  "typescript",
];

// Specific agents for Frontend development
const FE_AGENTS = [
  ...REQUIRED_AGENTS,
  "devops-engineer.agent.md",
  "fe-developer.agent.md",
  "qa-engineer.agent.md",
];

// Specific skills for Frontend development
const FE_SKILLS = [
  "angular",
  "bootstrap",
  "css",
  "docker",
  "eslint",
  "git",
  "graphql",
  "html",
  "javascript",
  "jquery",
  "nginx",
  "page-content-crawler",
  "prettier",
  "react",
  "sass",
  "scss",
  "typescript",
  "ui-creation-guide",
  "vite",
  "vue",
];

// Specific agents for AI domains
const AI_AGENTS = [
  ...REQUIRED_AGENTS,
  "ai-engineer.agent.md",
  "devops-engineer.agent.md",
  "qa-engineer.agent.md",
];

// Specific skills for AI domains
const AI_SKILLS = [
  "ai",
  "docker",
  "dsa",
  "eslint",
  "git",
  "graphql",
  "huggingface",
  "javascript",
  "langchain",
  "nginx",
  "nodejs",
  "numpy",
  "ollama",
  "page-content-crawler",
  "pandas",
  "prettier",
  "python",
  "r",
  "scipy",
  "typescript",
];

// Specific agents for Mobile development
const MOBILE_AGENTS = [
  ...REQUIRED_AGENTS,
  "devops-engineer.agent.md",
  "mobile-developer.agent.md",
  "qa-engineer.agent.md",
];

// Specific skills for Mobile development
const MOBILE_SKILLS = [
  "dart",
  "docker",
  "eslint",
  "flutter",
  "git",
  "graphql",
  "javascript",
  "kotlin",
  "nginx",
  "page-content-crawler",
  "prettier",
  "swift",
  "typescript",
  "xml",
];

// Specific agents for Desktop development
const DESKTOP_AGENTS = [
  ...REQUIRED_AGENTS,
  "desktop-app-developer.agent.md",
  "devops-engineer.agent.md",
  "qa-engineer.agent.md",
];

// Specific skills for Desktop development
const DESKTOP_SKILLS = [
  "docker",
  "eslint",
  "git",
  "graphql",
  "javascript",
  "nginx",
  "nodejs",
  "page-content-crawler",
  "prettier",
  "react",
  "typescript",
  "vite",
  "xml",
];

// Specific skills for Code Reviewer
const CODE_REVIEWER_SKILLS = ["cyber-security", "page-content-crawler"];

// Specific skills for Debugger
const DEBUGGER_SKILLS = ["page-content-crawler"];

// Specific skills for DevOps
const DEVOPS_SKILLS = ["aws", "bash", "page-content-crawler"];

// Specific skills for QA Engineer
const QA_SKILLS = ["page-content-crawler"];

// Specific skills for Technical Leader
const TECHNICAL_LEADER_SKILLS = ["page-content-crawler"];

// Template definitions
const TEMPLATES = [
  {
    name: "all",
    label: "All (everything)",
    description: "All agents and skills",
    includeAgents: unique(
      AI_AGENTS,
      BE_AGENTS,
      FE_AGENTS,
      MOBILE_AGENTS,
      DESKTOP_AGENTS,
    ),
    includeSkills: unique(
      AI_SKILLS,
      BE_SKILLS,
      CODE_REVIEWER_SKILLS,
      DEBUGGER_SKILLS,
      DESKTOP_SKILLS,
      DEVOPS_SKILLS,
      FE_SKILLS,
      MOBILE_SKILLS,
      QA_SKILLS,
      TECHNICAL_LEADER_SKILLS,
    ),
  },
  {
    name: "web-fullstack",
    label: "Web Fullstack",
    description: "Frontend + Backend",
    includeAgents: unique(BE_AGENTS, FE_AGENTS),
    includeSkills: unique(
      BE_SKILLS,
      CODE_REVIEWER_SKILLS,
      DEBUGGER_SKILLS,
      DEVOPS_SKILLS,
      FE_SKILLS,
      QA_SKILLS,
      TECHNICAL_LEADER_SKILLS,
    ),
  },
  {
    name: "ai-application-fullstack",
    label: "AI Application Fullstack",
    description: "AI + Frontend + Backend",
    includeAgents: unique(AI_AGENTS, BE_AGENTS, FE_AGENTS),
    includeSkills: unique(
      AI_SKILLS,
      BE_SKILLS,
      CODE_REVIEWER_SKILLS,
      DEBUGGER_SKILLS,
      DEVOPS_SKILLS,
      FE_SKILLS,
      QA_SKILLS,
      TECHNICAL_LEADER_SKILLS,
    ),
  },
  {
    name: "ai-backend",
    label: "AI + Backend",
    description: "AI services + Backend APIs",
    includeAgents: unique(AI_AGENTS, BE_AGENTS),
    includeSkills: unique(
      AI_SKILLS,
      BE_SKILLS,
      CODE_REVIEWER_SKILLS,
      DEBUGGER_SKILLS,
      DEVOPS_SKILLS,
      QA_SKILLS,
      TECHNICAL_LEADER_SKILLS,
    ),
  },
  {
    name: "mobile-fullstack",
    label: "Mobile Fullstack",
    description: "Mobile + Backend",
    includeAgents: unique(MOBILE_AGENTS, BE_AGENTS),
    includeSkills: unique(
      BE_SKILLS,
      CODE_REVIEWER_SKILLS,
      DEBUGGER_SKILLS,
      DEVOPS_SKILLS,
      MOBILE_SKILLS,
      QA_SKILLS,
      TECHNICAL_LEADER_SKILLS,
    ),
  },
  {
    name: "desktop-app-fullstack",
    label: "Desktop App Fullstack",
    description: "Desktop + Backend",
    includeAgents: unique(DESKTOP_AGENTS, BE_AGENTS),
    includeSkills: unique(
      BE_SKILLS,
      CODE_REVIEWER_SKILLS,
      DEBUGGER_SKILLS,
      DESKTOP_SKILLS,
      DEVOPS_SKILLS,
      QA_SKILLS,
      TECHNICAL_LEADER_SKILLS,
    ),
  },
  {
    name: "backend-only",
    label: "Backend Only",
    description: "Backend APIs only",
    includeAgents: unique(BE_AGENTS),
    includeSkills: unique(
      BE_SKILLS,
      CODE_REVIEWER_SKILLS,
      DEBUGGER_SKILLS,
      DEVOPS_SKILLS,
      QA_SKILLS,
      TECHNICAL_LEADER_SKILLS,
    ),
  },
  {
    name: "frontend-only",
    label: "Frontend Only",
    description: "Frontend development only",
    includeAgents: unique(FE_AGENTS),
    includeSkills: unique(
      CODE_REVIEWER_SKILLS,
      DEBUGGER_SKILLS,
      DEVOPS_SKILLS,
      FE_SKILLS,
      QA_SKILLS,
      TECHNICAL_LEADER_SKILLS,
    ),
  },
];

const ALL_AGENTS = unique(
  AI_AGENTS,
  BE_AGENTS,
  FE_AGENTS,
  MOBILE_AGENTS,
  DESKTOP_AGENTS,
);

const AGENT_SKILLS_MAP = {
  "ai-engineer.agent.md": AI_SKILLS,
  "be-developer.agent.md": BE_SKILLS,
  "code-reviewer.agent.md": CODE_REVIEWER_SKILLS,
  "debugger.agent.md": DEBUGGER_SKILLS,
  "desktop-app-developer.agent.md": DESKTOP_SKILLS,
  "devops-engineer.agent.md": DEVOPS_SKILLS,
  "fe-developer.agent.md": FE_SKILLS,
  "mobile-developer.agent.md": MOBILE_SKILLS,
  "qa-engineer.agent.md": QA_SKILLS,
  "technical-leader.agent.md": TECHNICAL_LEADER_SKILLS,
};

module.exports = {
  AGENT_SKILLS_MAP,
  ALL_AGENTS,
  REQUIRED_AGENTS,
  TEMPLATES,
};
