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
  "c",
  "cpp",
  "docker",
  "expressjs",
  "git",
  "github-mcp",
  "graphql",
  "javascript",
  "linting",
  "nestjs",
  "nginx",
  "nosql",
  "prisma",
  "relational-database",
  "restapi",
  "typeorm",
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
  "css",
  "docker",
  "git",
  "github-mcp",
  "graphql",
  "html",
  "javascript",
  "linting",
  "nginx",
  "reactjs",
  "restapi",
  "typescript",
  "vite",
  "vuejs-composition-api",
  "vuejs-options-api",
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
  "docker",
  "git",
  "github-mcp",
  "graphql",
  "huggingface",
  "javascript",
  "langchain",
  "langchainjs",
  "linting",
  "nginx",
  "ollama",
  "python",
  "restapi",
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
  "flutter",
  "git",
  "github-mcp",
  "graphql",
  "javascript",
  "linting",
  "nginx",
  "react-native",
  "restapi",
  "typescript",
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
  "electron-forge",
  "electronjs",
  "git",
  "github-mcp",
  "graphql",
  "javascript",
  "linting",
  "nginx",
  "restapi",
  "typescript",
  "vite",
];

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
      FE_SKILLS,
      MOBILE_SKILLS,
      DESKTOP_SKILLS,
    ),
  },
  {
    name: "web-fullstack",
    label: "Web Fullstack",
    description: "Frontend + Backend",
    includeAgents: unique(BE_AGENTS, FE_AGENTS),
    includeSkills: unique(BE_SKILLS, FE_SKILLS),
  },
  {
    name: "ai-application-fullstack",
    label: "AI Application Fullstack",
    description: "AI + Frontend + Backend",
    includeAgents: unique(AI_AGENTS, BE_AGENTS, FE_AGENTS),
    includeSkills: unique(AI_SKILLS, BE_SKILLS, FE_SKILLS),
  },
  {
    name: "ai-backend",
    label: "AI + Backend",
    description: "AI services + Backend APIs",
    includeAgents: unique(AI_AGENTS, BE_AGENTS),
    includeSkills: unique(AI_SKILLS, BE_SKILLS),
  },
  {
    name: "mobile-fullstack",
    label: "Mobile Fullstack",
    description: "Mobile + Backend",
    includeAgents: unique(MOBILE_AGENTS, BE_AGENTS),
    includeSkills: unique(MOBILE_SKILLS, BE_SKILLS),
  },
  {
    name: "desktop-app-fullstack",
    label: "Desktop App Fullstack",
    description: "Desktop + Backend",
    includeAgents: unique(DESKTOP_AGENTS, BE_AGENTS),
    includeSkills: unique(DESKTOP_SKILLS, BE_SKILLS),
  },
  {
    name: "backend-only",
    label: "Backend Only",
    description: "Backend APIs only",
    includeAgents: unique(BE_AGENTS),
    includeSkills: unique(BE_SKILLS),
  },
  {
    name: "frontend-only",
    label: "Frontend Only",
    description: "Frontend development only",
    includeAgents: unique(FE_AGENTS),
    includeSkills: unique(FE_SKILLS),
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
  "code-reviewer.agent.md": [],
  "debugger.agent.md": [],
  "desktop-app-developer.agent.md": DESKTOP_SKILLS,
  "devops-engineer.agent.md": [],
  "fe-developer.agent.md": FE_SKILLS,
  "mobile-developer.agent.md": MOBILE_SKILLS,
  "qa-engineer.agent.md": [],
  "technical-leader.agent.md": [],
};

module.exports = {
  AGENT_SKILLS_MAP,
  ALL_AGENTS,
  REQUIRED_AGENTS,
  TEMPLATES,
};
