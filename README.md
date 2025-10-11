# StreamerSongList MCP Server

[![Test MCP Server](https://github.com/vuvuvu/streamersonglist-mcp/actions/workflows/test.yml/badge.svg)](https://github.com/vuvuvu/streamersonglist-mcp/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![smithery badge](https://smithery.ai/badge/@vuvuvu/streamersonglist-mcp)](https://smithery.ai/server/@vuvuvu/streamersonglist-mcp)

MCP server exposing read-only StreamerSongList tools. Works with Claude Desktop and any MCP client.

## Quick Start

- Node.js 18+ required
- Claude Desktop recommended for daily use

Add to Claude Desktop via npx:

```json
{
  "mcpServers": {
    "streamersonglist": {
      "command": "npx",
      "args": ["streamersonglist-mcp"]
    }
  }
}
```

Optional Smithery install:

```bash
npx -y @smithery/cli install @vuvuvu/streamersonglist-mcp --client claude
```

## Inspect / Debug (Recommended)

Use the MCP Inspector to explore tools and run requests interactively:

```bash
npx @modelcontextprotocol/inspector@latest -- npx streamersonglist-mcp
# or from a local clone
npx @modelcontextprotocol/inspector@latest -- node src/server.js
```

Alternative (raw stdio):

```bash
npm start
printf '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}\n' | node src/server.js
```

## Available Tools (11 Total)

### ✅ Real API Data (4 tools)
- **getStreamerByName** — Fetch comprehensive streamer configuration
- **getQueue** — List current song queue with pagination
- **monitorQueue** — Monitor queue changes with polling intervals
- **getSongDetails** — Get detailed song information (tabs, lyrics, chords)

### ⚠️ Simulated Data (7 tools)
*These tools return realistic mock data as the API endpoints are not available*

- **getQueueStats** — Queue statistics and analytics
- **manageSongRequest** — Create/update/delete song requests
- **getPlayHistory** — Retrieve play history with filtering
- **searchSongs** — Search song database with filters
- **manageSongAttributes** — Manage song tags and attributes
- **getOverlayData** — Fetch overlay data for streaming software
- **getStreamStats** — Get comprehensive streaming statistics

## API Status

**Working Endpoints**: 4/11+ documented StreamerSongList API endpoints are functional
- Streamer information, queue management, and song catalog access
- No authentication required for public endpoints
- Advanced features (history, stats, polls) not available in live API

For detailed API testing results, see [docs/API_TESTING_REPORT.md](./docs/API_TESTING_REPORT.md)

## Environment

Optionally set a default streamer used when `streamerName` is omitted:

```json
{
  "mcpServers": {
    "streamersonglist": {
      "command": "npx",
      "args": ["streamersonglist-mcp"],
      "env": { "DEFAULT_STREAMER": "public_streamer" }
    }
  }
}
```

CLI override examples:

```bash
DEFAULT_STREAMER=public_streamer npx streamersonglist-mcp
npx streamersonglist-mcp --streamer public_streamer
```

Security tip: use only public streamer names; the server calls public read-only endpoints.

## Scripts

- `npm install` — install dependencies
- `npm start` — run server on stdio
- `npm test` — spawn server and verify tools/list
- `npm run setup` — generate Claude Desktop entries

## License

MIT — see `LICENSE`.

## Contributing

PRs welcome. Please run `npm test` before submitting.

