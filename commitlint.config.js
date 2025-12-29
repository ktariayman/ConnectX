export default {
 extends: ["@commitlint/config-conventional"],
 rules: {
  "type-enum": [
   2,
   "always",
   [
    "fix",        // Fixes a bug
    "test",       // Adding or updating tests
    "tooling",      // Changes related to development tools or setup
    "refactor",   // Code changes that neither fix a bug nor add a feature
    "revert",     // Reverts a previous commit
    "example",    // Adds examples for features or components
    "docs",       // Documentation-only changes
    "format",     // Code formatting fixes (no functional changes)
    "feat",       // Indicates a new feature
    "chore",      // Changes that don't modify the source code (e.g., updating build tools)
    "ci",         // Continuous Integration or pipeline changes
    "style",      // Code style changes (e.g., formatting, white-space, etc.)
    "perf",       // Performance improvements
    "enhancement",// Enhancement to existing features or functionality
    "package",    // Changes to package.json or dependencies
    "types",      // Changes to type definitions or shared types
   ],
  ],
 },
};
