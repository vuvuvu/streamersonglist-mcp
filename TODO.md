# Streamline & Debloat TODO

- [x] Stash current working tree (include untracked)
- [x] Fix `monitorQueue` to respect `API_BASE`
- [x] Use direct song details endpoint in `getSongDetails`
- [x] Remove `undici` from dependencies and refresh lockfile
- [x] Update `smithery.yaml` runtime to `node`
- [x] Slim `Dockerfile` to copy only needed files
- [x] Remove unused `src/index.ts`
- [x] Update docs (`README.md`, `CLAUDE.md`) to reflect changes and remove undici mention
- [x] Add corrections to analysis docs to keep them grounded (`docs/analysis-reports/*`, `docs/API_TESTING_REPORT.md`)
- [x] Run `npm install` (or `npm ci`) to update `package-lock.json`

Notes:
- CI uses `npm ci`; lockfile must be refreshed after dependency changes.
- Search tool remains client-side filtering over the songs endpoint.
