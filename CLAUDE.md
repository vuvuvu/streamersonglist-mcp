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

This is a **Model Context Protocol (MCP) server** that provides 11 tools for interacting with StreamerSongList APIs. The server integrates with Claude Desktop and other MCP-compatible clients.

### Key Dependencies
- `@modelcontextprotocol/sdk@^1.13.3` - MCP protocol implementation
- `undici@^7.11.0` - Modern fetch API implementation for Node.js

### Server Architecture
- **Single-file implementation**: `src/server.js` (955 lines) contains the entire server
- **Dynamic SDK loading**: Smart resolution with fallback paths for different installation scenarios
- **Environment configuration**: Supports `DEFAULT_STREAMER` for convenient queue tool usage
- **MCP Protocol**: Uses stdio transport for communication with Claude Desktop

### Tool Categories
1. **Core Queue Management**: getStreamerByName, getQueue, getQueueStats, manageSongRequest, monitorQueue
2. **Play History & Song Database**: getPlayHistory, searchSongs, getSongDetails, manageSongAttributes
3. **Overlay & Analytics**: getOverlayData, getStreamStats

### Environment Variable Support
Set `DEFAULT_STREAMER` environment variable to automatically supply the streamerName argument for queue-related tools. Tools fall back to this default when the argument is omitted. You can also override it per-run with CLI flags such as `--streamer belleune`, `-s belleune`, or `-belleune` when starting the server.

### API Integration
- **Base URL**: `https://api.streamersonglist.com`
- **Endpoints**: Uses 11 RESTful API endpoints for comprehensive StreamerSongList integration
- **Error Handling**: Graceful degradation with informative error messages
- **No authentication required**: Simplified setup (some newer endpoints may require auth)

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
