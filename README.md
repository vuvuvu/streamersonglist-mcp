# StreamerSongList MCP Server

[![smithery badge](https://smithery.ai/badge/@vuvuvu/streamersonglist-mcp)](https://smithery.ai/server/@vuvuvu/streamersonglist-mcp)
[![Test MCP Server](https://github.com/vuvuvu/streamersonglist-mcp/actions/workflows/test.yml/badge.svg)](https://github.com/vuvuvu/streamersonglist-mcp/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)


MCP server exposing read-only StreamerSongList tools. Use LLM's to interface with a Live Streamers Song list. Claude Desktop and any MCP client.

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

See `claude-desktop-config.with-default-streamer.json` for an example with DEFAULT_STREAMER configured.

### Click on the smithery badge to test out the mcp server or deploy your own. 
[![smithery badge](https://smithery.ai/badge/@vuvuvu/streamersonglist-mcp)](https://smithery.ai/server/@vuvuvu/streamersonglist-mcp)

Optional Smithery install (requires Smithery account):

```bash
# First login to Smithery (one-time setup)
npx -y @smithery/cli login

# Then install the MCP server
npx -y @smithery/cli install @vuvuvu/streamersonglist-mcp --client claude
```

## Deploy to Smithery.ai

Want to test this MCP server instantly without any local setup? Click the Smithery badge above or visit:

**[🚀 Deploy to Smithery.ai](https://smithery.ai/server/@vuvuvu/streamersonglist-mcp)**

Smithery.ai provides a hosted environment where you can:
- Test all StreamerSongList tools immediately in your browser
- No installation or configuration required
- Perfect for trying out the server before local setup
- Great for sharing with others or quick demonstrations

Simply click the badge at the top of this README or the link above to get started instantly!

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

## Available Tools (6 Total)

### ✅ All Real API Data (6 tools)
- **getStreamerByName** — Fetch comprehensive streamer configuration
- **getQueue** — List current song queue with pagination
- **getSongs** — Fetch complete song list with pagination
- **searchSongs** — Search songs by title or artist
- **getSongDetails** — Get detailed information about a specific song
- **monitorQueue** — Monitor queue changes using real data

### Usage Examples

For comprehensive examples of how to use these tools, see **[docs/USAGE_EXAMPLES.md](./docs/USAGE_EXAMPLES.md)** including:

- 🎵 Music discovery and analysis
- 📊 Content creator tools and stream planning
- 🤖 AI assistant integration and smart recommendations
- 📈 Data analysis and insights
- 🎪 Event planning and collaboration tools
- 🛠️ Technical applications and automation

Quick examples:
```json
// Search for songs
{"tool": "searchSongs", "arguments": {"streamerName": "belleune", "query": "Frank Sinatra"}}

// Get most popular songs
{"tool": "getSongs", "arguments": {"streamerName": "belleune", "limit": 20}}

// Compare streamer libraries
{"tool": "getSongs", "arguments": {"streamerName": "vu_vu", "limit": 50}}
```

## API Status

**Working Endpoints**: All 6 tools use real API data
- Streamer information, queue management, and full song library access
- No authentication required for public endpoints
- All features fully functional with real StreamerSongList API data

#Please be considerate when using streamersonglists api. It's a shared but limitted resource, be mindful when using LLM's to access it, Please don't ruin it for everyone! 

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

Configuration options:
- `DEFAULT_STREAMER` — default streamer when an argument is omitted
- `SSL_API_BASE` — override API base (default `https://api.streamersonglist.com/v1`)

Version info: The server reports its version from `package.json`, matching the published package.

Security tip: use only public streamer names; the server calls public read-only endpoints.

## Scripts

- `npm install` — install dependencies
- `npm start` — run server on stdio
- `npm test` — spawn server and verify tools/list
- `npm run setup` — generate Claude Desktop entries

## License

MIT — see `LICENSE`.

## Contributing

Contributions are welcome via pull requests. Due to limitations of the public StreamerSongList API, scope for major new features is intentionally modest — helpful contributions include:
- Bug fixes, error handling, and robustness improvements
- Documentation updates and examples
- Small tooling or DX enhancements (tests, CI, config)

Please open an issue to discuss larger ideas before starting work, and run `npm test` before submitting PRs.

## Credits

This project builds on the excellent StreamerSonglist service. All data and API functionality are provided by StreamerSonglist:
- https://www.streamersonglist.com

I am not affiliated with or endorsed by StreamerSonglist so please don't bother them with any issues you find in my code. 
Thankyou Streamersonglist for providing such a useful service to the streamer community.  Very POG