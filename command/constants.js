"use strict";

// Common agents that are included in all templates by default
const COMMON_AGENTS = [
  "technical-leader.agent.md",
  "debugger.agent.md",
  "code-reviewer.agent.md",
  "be-developer.agent.md",
  "qa-engineer.agent.md",
  "devops-engineer.agent.md",
];

// Specific agents for AI domains
const AI_AGENTS = ["ai-engineer.agent.md"];

// Specific agents for Frontend development
const FE_AGENTS = ["fe-developer.agent.md"];

// Specific agents for Mobile development
const MOBILE_AGENTS = ["mobile-developer.agent.md"];

// Specific agents for Desktop development
const DESKTOP_AGENTS = ["desktop-app-developer.agent.md"];

// Common skills that are included in all templates by default
const COMMON_SKILLS = [
  "docker",
  "git",
  "github-mcp",
  "graphql",
  "expressjs",
  "nestjs",
  "nginx",
  "nosql",
  "prisma",
  "relational-database",
  "restapi",
  "typeorm",
  "typescript",
];

// Specific skills for AI domains
const AI_SKILLS = ["huggingface", "langchain", "langchainjs", "ollama", "python"];

// Specific skills for Frontend development
const FE_SKILLS = [
  "css",
  "html",
  "javascript",
  "linting",
  "reactjs",
  "vite",
  "vuejs-composition-api",
  "vuejs-options-api",
];

// Specific skills for Mobile development
const MOBILE_SKILLS = ["dart", "flutter", "react-native"];

// Specific skills for Desktop development
const DESKTOP_SKILLS = ["electron-forge", "electronjs"];

// Template definitions
const TEMPLATES = [
  {
    name: "all",
    label: "All (everything)",
    description: "All agents and skills",
    includeAgents: [...COMMON_AGENTS, ...AI_AGENTS, ...FE_AGENTS, ...MOBILE_AGENTS, ...DESKTOP_AGENTS],
    includeSkills: [...COMMON_SKILLS, ...AI_SKILLS, ...FE_SKILLS, ...MOBILE_SKILLS, ...DESKTOP_SKILLS],
  },
  {
    name: "web-fullstack",
    label: "Web Fullstack",
    description: "Frontend + Backend",
    includeAgents: [...COMMON_AGENTS, ...FE_AGENTS],
    includeSkills: [...COMMON_SKILLS, ...FE_SKILLS],
  },
  {
    name: "ai-application-fullstack",
    label: "AI Application Fullstack",
    description: "AI + Frontend + Backend",
    includeAgents: [...COMMON_AGENTS, ...AI_AGENTS, ...FE_AGENTS],
    includeSkills: [...COMMON_SKILLS, ...AI_SKILLS, ...FE_SKILLS],
  },
  {
    name: "ai-backend",
    label: "AI + Backend",
    description: "AI services + Backend APIs",
    includeAgents: [...COMMON_AGENTS, ...AI_AGENTS],
    includeSkills: [...COMMON_SKILLS, ...AI_SKILLS],
  },
  {
    name: "mobile-fullstack",
    label: "Mobile Fullstack",
    description: "Mobile + Backend",
    includeAgents: [...COMMON_AGENTS, ...MOBILE_AGENTS],
    includeSkills: [...COMMON_SKILLS, ...MOBILE_SKILLS],
  },
  {
    name: "desktop-app-fullstack",
    label: "Desktop App Fullstack",
    description: "Desktop + Backend",
    includeAgents: [...COMMON_AGENTS, ...DESKTOP_AGENTS],
    includeSkills: [...COMMON_SKILLS, ...DESKTOP_SKILLS],
  },
  {
    name: "backend-only",
    label: "Backend Only",
    description: "Backend APIs only",
    includeAgents: [...COMMON_AGENTS],
    includeSkills: [...COMMON_SKILLS],
  },
  {
    name: "frontend-only",
    label: "Frontend Only",
    description: "Frontend development only",
    includeAgents: [...COMMON_AGENTS, ...FE_AGENTS],
    includeSkills: [...COMMON_SKILLS, ...FE_SKILLS],
  },
];

module.exports = { TEMPLATES };
