# Committing Guide 📝

We use [Commitlint](https://commitlint.js.org/) and [Husky](https://typicode.github.io/husky/) to enforce the [Conventional Commits](https://www.conventionalcommits.org/) specification. This ensures a clean, readable, and automated changelog for our open-source community.

## Commit Message Format

Each commit message must follow this format:
`<type>: <description>`

### Allowed Types

| Type | Description |
| :--- | :--- |
| `feat` | A new feature |
| `fix` | A bug fix |
| `tooling` | Changes to development tools, build scripts, or project setup |
| `refactor` | Code changes that neither fix a bug nor add a feature |
| `revert` | Reverting a previous commit |
| `example` | Adding examples for features or components |
| `docs` | Documentation only changes |
| `format` | Code formatting/linting fixes (no functional changes) |
| `chore` | Maintenance tasks that don't modify source or tests |
| `ci` | CI configuration files and scripts |
| `style` | UI styling changes (CSS/SCSS) |
| `perf` | Performance improvements |
| `enhancement` | Improvements to existing features |
| `package` | Changes to `package.json` or project dependencies |
| `types` | Changes to shared interfaces or TypeScript definitions |
| `test` | Adding or updating tests |

## Examples

### ✅ Good Commits
- `feat: implement real-time player chat`
- `fix: resolve issue with piece overlapping`
- `tooling: add husky and commitlint`
- `types: update Room interface to include maxPlayers`
- `docs: update deployment instructions`

### ❌ Bad Commits (Will be rejected)
- `fixed some bugs` (No type)
- `feat: Adding something` (Should be lowercase description)
- `working on room logic` (Missing colon and type)
- `random: just playing around` (Type `random` is not allowed)

## Enforcement
If your commit message does not meet these standards, the git hook will automatically reject the commit and provide an error message.
