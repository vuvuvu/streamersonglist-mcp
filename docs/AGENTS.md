# Repository Guidelines

## Project Structure & Module Organization
Core code lives in `src/server.js`, which exposes the MCP tools and handles SDK wiring. Integration helpers such as `setup-claude.js` and the CLI entrypoint declared in `package.json` stay at the repo root. Tests reside in `test-server.js`, while documentation (`README.md`, `INSTALL.md`, `CLAUDE.md`) and configuration samples (`claude-desktop-config.example.json`) share the same level.

## Build, Test, and Development Commands
Run `npm install` once to pull dependencies (Node.js 18+ required). Use `npm start` to launch the MCP server on stdio for manual inspection. Execute `npm test` to spawn the server, issue a `tools/list` request, and verify the exported tool metadata. `npm run setup` generates Claude Desktop entries and is useful when onboarding new environments.

## Coding Style & Naming Conventions
This project uses CommonJS modules with two-space indentation, semicolons, and double-quoted JSON payloads. Prefer `const` unless reassignment is required, and keep helper functions colocated near their usage. Align new tool definitions with the existing array in `src/server.js`, mirroring property order (`name`, `description`, `inputSchema`). Inline comments should explain reasoning, not restate obvious code.

## Testing Guidelines
`npm test` is the canonical regression check and should pass before every PR. When adding tools, extend the test to assert the tool name appears in the response. For manual validation, run `npm start` and send a `tools/list` message via another terminal: `printf '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}\n' | node src/server.js`.

## Commit & Pull Request Guidelines
Adopt conventional commit prefixes seen in history (e.g., `feat:`, `fix:`, `chore:`) and keep messages imperative. Each PR should describe the scenario, link related issues, and note any configuration updates (such as new env vars). Include test output when behavior changes and attach screenshots or transcripts if client-visible responses are affected.

## Security & Configuration Tips
Never commit personal StreamerSongList credentials; the server only targets public endpoints. Document any new environment variables and avoid defaulting to private streamer names. Before publishing, confirm `DEFAULT_STREAMER` is unset or points to a public account to prevent unintentionally leaking private queues.
