# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Testing and Running
- `npm test` - Run MCP protocol validation tests using the custom test harness
- `npm start` - Start the MCP server manually for testing (listens on stdio)
- `npm run setup` - Automatically configure Claude Desktop integration

### Package Management
- `npm install` - Install dependencies
- `node src/server.js` - Direct server execution (same as npm start)

## Architecture Overview

This is a **Model Context Protocol (MCP) server** that provides tools for interacting with StreamerSongList APIs. The server integrates with Claude Desktop and other MCP-compatible clients.

Note: This server targets public, read-only endpoints of the StreamerSongList API. All implemented tools use real API responses (no simulated data). See `docs/API_TESTING_REPORT.md` for details.

### Key Dependencies
- `@modelcontextprotocol/sdk@^1.20.0` - MCP protocol implementation

### Server Architecture
- **Single-file implementation**: `src/server.js` (955 lines) contains the entire server
- **Dynamic SDK loading**: Smart resolution with fallback paths for different installation scenarios
- **Environment configuration**: Supports `DEFAULT_STREAMER` for convenient queue tool usage
- **MCP Protocol**: Uses stdio transport for communication with Claude Desktop

### Available Tools (all real API data)
- `getStreamerByName` — GET `/v1/streamers/{name}`
- `getQueue` — GET `/v1/streamers/{name}/queue`
- `getSongs` — GET `/v1/streamers/{name}/songs`
- `searchSongs` — Client-side filtering over `getSongs`
- `getSongDetails` — Uses direct endpoint `/v1/streamers/{name}/songs/{songId}`
- `monitorQueue` — Polls `getQueue` at intervals

### Environment Variable Support
- `DEFAULT_STREAMER` — default streamer when `streamerName` is omitted (overridable via CLI `--streamer`)
- `SSL_API_BASE` — override API base (default `https://api.streamersonglist.com/v1`)

CLI overrides: `npx streamersonglist-mcp --streamer belleune`

### API Integration
- Base URL: `https://api.streamersonglist.com/v1` (configurable via `SSL_API_BASE`)
- All tools use real API endpoints; no authentication is required for public data
- Error handling: consistent response checks and messages

### Endpoints Used
- `GET /v1/streamers/{streamerName}` — streamer configuration
- `GET /v1/streamers/{streamerName}/queue` — current queue data
- `GET /v1/streamers/{streamerName}/songs` — full catalog

### Development Patterns
- **Tool Definition Pattern**: Each tool has comprehensive JSON Schema validation
- **Stream Parameter Handling**: Tools that accept streamerName fall back to DEFAULT_STREAMER when available
- **API Response Handling**: Consistent error handling and response formatting across all tools
- **Dynamic Import Pattern**: Smart SDK loading handles various installation scenarios

### Testing
- **Custom Test Harness**: `test-server.js` validates MCP protocol compliance
- **Manual Testing**: Server accepts JSON-RPC messages on stdin/stdout
- **CI/CD**: GitHub Actions tests against Node.js 18, 20, 22

### Package Structure
- **No build process**: Published as source for maximum compatibility
- **Binary entry**: `src/server.js` is both main file and CLI entry point
- **Configuration example**: `claude-desktop-config.example.json` shows integration pattern
 
