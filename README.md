# StreamerSongList MCP Server (Node-Minimal)

Local-optimized, Node-only MCP server exposing read-only StreamerSongList tools. No TypeScript build, no extra docs — just run it.

## Requirements
- Node.js 18+ (uses native `fetch`)

## Quick Start

1) Install deps
```bash
npm install
```

2) Run the server on stdio
```bash
npm start
# or
node src/server.js
```

3) Optional: set a default streamer
```bash
# environment variable
DEFAULT_STREAMER=belleune npm start

# CLI flag
node src/server.js --streamer belleune
```

4) Inspect with MCP Inspector (recommended)
```bash
npx @modelcontextprotocol/inspector@latest -- node src/server.js
```

5) Quick JSON-RPC smoke test
```bash
printf '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}\n' | node src/server.js
```

## Tools (6)
- getStreamerByName — fetch streamer configuration
- getQueue — current song queue (pagination)
- getSongs — full song list (pagination)
- searchSongs — client-side filter over song list
- getSongDetails — direct endpoint by songId
- monitorQueue — initial snapshot + simulated description

## Configuration
- `DEFAULT_STREAMER` — default when `streamerName` omitted
- `SSL_API_BASE` — override API base (default `https://api.streamersonglist.com/v1`)

## Scripts
- `npm install` — install dependencies
- `npm start` — start the MCP server
- `npm test` — protocol smoke test
- `npm run test:integration` — end-to-end test (real API)

## Notes
- This branch removes non-essential artifacts (docs, TS build) to keep local usage lean.
- Use public streamer names only; endpoints are public read-only.

## License
MIT — see `LICENSE`.

