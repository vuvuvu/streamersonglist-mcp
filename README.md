
# StreamerSongList MCP Server

[![Test MCP Server](https://github.com/vuvuvu/streamersonglist-mcp/actions/workflows/test.yml/badge.svg)](https://github.com/vuvuvu/streamersonglist-mcp/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![smithery badge](https://smithery.ai/badge/@vuvuvu/streamersonglist-mcp)](https://smithery.ai/server/@vuvuvu/streamersonglist-mcp)

A Model Context Protocol (MCP) server that provides tools for interacting with StreamerSongList APIs. This server enables AI assistants like Claude to manage song requests, monitor queues, and interact with streaming platforms' song request systems.

## Features

### 🎵 4 Available Tools

#### Core Queue Insights
- **getStreamerByName**: Fetch detailed information about a specific streamer
- **getQueue**: View current song queues with pagination support
- **getQueueStats**: Get comprehensive stats about song queues including total songs, duration, and popular tracks

#### Monitoring Utility
- **monitorQueue**: Monitor queue changes with configurable polling intervals

### 🔧 Technical Features

- **MCP Protocol Compliant**: Works with Claude Desktop, OpenAI agents, and other MCP clients
- **Type Safety**: Built with comprehensive input validation
- **Error Handling**: Robust error handling and user-friendly error messages
- **No Authentication Required**: Only public, read-only StreamerSongList endpoints are exposed—no API token needed

> ℹ️  Tools that require StreamerSongList authentication have been intentionally removed to keep this MCP server simple and safe by default.

## Quick Start

### Prerequisites

- **Node.js** (version 18 or higher)
- **Claude Desktop** or another MCP-compatible client

### Installation

#### Option 1: Using npx (Recommended)

No installation required! Just configure Claude Desktop to use:

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

#### Option 2: Local Installation

1. **Clone this repository:**
   ```bash
   git clone https://github.com/vuvuvu/streamersonglist-mcp.git
   cd streamersonglist-mcp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Test the server:**
   ```bash
   npm test
   ```

### Installing via Smithery

To install streamersonglist-mcp for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@vuvuvu/streamersonglist-mcp):

```bash
npx -y @smithery/cli install @vuvuvu/streamersonglist-mcp --client claude
```

### Usage with Claude Desktop

#### Quick Setup (npx method)

1. **Find your Claude Desktop config file:**
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Add the server to your config:**
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

3. **Restart Claude Desktop**

4. **Test it out:**
   Ask Claude: *"Use the getStreamerByName tool to get information about a popular streamer"*

#### Alternative: Local Installation Method

If you prefer to run from a local clone:

```json
{
  "mcpServers": {
    "streamersonglist": {
      "command": "node",
      "args": ["src/server.js"],
      "cwd": "/path/to/streamersonglist-mcp"
    }
  }
}
```

## Default Streamer Configuration

Set the `DEFAULT_STREAMER` environment variable to automatically supply the `streamerName` argument for the `getStreamerByName`, `getQueue`, `getQueueStats`, and `monitorQueue` tools. These handlers fall back to the configured default when the argument is omitted, while still allowing you to override it by passing a `streamerName` explicitly. If neither the argument nor the environment variable is provided, the server will respond with an error.

### Setting `DEFAULT_STREAMER` in Claude Desktop

Add an `env` block to your Claude Desktop configuration when registering the server:

```json
{
  "mcpServers": {
    "streamersonglist": {
      "command": "npx",
      "args": ["streamersonglist-mcp"],
      "env": {
        "DEFAULT_STREAMER": "belleune"
      }
    }
  }
}
```

You can also set the variable for one-off terminal sessions:

```bash
DEFAULT_STREAMER=belleune npx streamersonglist-mcp
```

## Tool Documentation

### getStreamerByName

Fetch detailed information about a specific streamer.

**Parameters:**
- `streamerName` (string, optional): The name of the streamer. Defaults to the `DEFAULT_STREAMER` environment variable when set.

**Example:**
```
Use getStreamerByName with streamerName "belleune"
```

### getQueue

View current song queues with pagination support.

**Parameters:**
- `streamerName` (string, optional): The name of the streamer whose queue to fetch. Defaults to the `DEFAULT_STREAMER` environment variable when set.
- `limit` (number, optional): Maximum number of songs to return (default: 50)
- `offset` (number, optional): Number of songs to skip for pagination (default: 0)

**Example:**
```
Use getQueue with streamerName "belleune" and limit 10
```

### getQueueStats

Get comprehensive stats about song queues.

**Parameters:**
- `streamerName` (string, optional): The name of the streamer whose queue stats to fetch. Defaults to the `DEFAULT_STREAMER` environment variable when set.

**Example:**
```
Use getQueueStats with streamerName "belleune"
```

### monitorQueue

Monitor queue changes with configurable polling intervals.

**Parameters:**
- `streamerName` (string, optional): The name of the streamer whose queue to monitor. Defaults to the `DEFAULT_STREAMER` environment variable when set.
- `interval` (number, optional): Polling interval in seconds (default: 30)
- `duration` (number, optional): How long to monitor in seconds (default: 300)

**Example:**
```
Use monitorQueue with streamerName "belleune", interval 60, duration 600
```

## Development

### Project Structure

```
streamersonglist-mcp/
├── src/
│   └── server.js          # Main MCP server implementation
├── package.json           # Node.js dependencies and scripts
├── test-server.js         # Test script
└── README.md             # This file
```

### Testing

Run the test script to verify the server works correctly:

```bash
npm test
```

This will:
- Start the MCP server
- Send a test request
- Verify the server responds with the correct tools

### Manual Testing

You can also test the server manually:

```bash
npm start
```

The server will start and wait for MCP protocol messages on stdin. You can send a test message:

```json
{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}
```

## API Endpoints

The streamlined server interacts with the following public StreamerSongList endpoints:

- `GET /v1/streamers/{streamerName}` – Fetch streamer information (`getStreamerByName`)
- `GET /v1/streamers/{streamerName}/queue` – Fetch queue contents (`getQueue`, `monitorQueue`)
- `GET /v1/streamers/{streamerName}/queue/stats` – Fetch queue statistics (`getQueueStats`)

## Troubleshooting

### Common Issues

1. **Server not starting:**
   - Ensure Node.js 18+ is installed
   - Run `npm install` to install dependencies
   - Check for error messages in the console

2. **Claude Desktop not seeing the server:**
   - Verify the config file path is correct
   - Ensure the `cwd` path points to your project directory
   - Restart Claude Desktop completely
   - Check for JSON syntax errors in the config file

3. **API errors:**
   - The server only calls public StreamerSongList GET endpoints—double-check the streamer name and that their queue is public
   - StreamerSongList may return `404` if a streamer disables public access to their queue or stats
   - Verify network connectivity if you continue to see errors

### Getting Help

- **Issues**: Report bugs or request features on GitHub
- **MCP Documentation**: https://modelcontextprotocol.io
- **Claude Desktop**: https://claude.ai/download

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Changelog

### Unreleased
- Removed tools that require StreamerSongList authentication to keep the MCP server read-only by default
- Updated documentation to highlight the simplified, public-only toolset

### v1.1.0
- **NEW**: Added 6 additional StreamerSongList API endpoints
- **NEW**: Play history retrieval with filtering (`getPlayHistory`)
- **NEW**: Song database search functionality (`searchSongs`)
- **NEW**: Detailed song information access (`getSongDetails`)
- **NEW**: Real-time overlay data for streaming software (`getOverlayData`)
- **NEW**: Comprehensive streaming analytics (`getStreamStats`)
- **NEW**: Song attribute management system (`manageSongAttributes`)
- Enhanced API coverage from 5 to 11 total tools
- Improved documentation with categorized tool sections
- Extended API endpoint coverage for comprehensive StreamerSongList integration

### v1.0.0
- Initial release
- Core 5 StreamerSongList tools implemented
- MCP protocol compliance
- Claude Desktop integration
- Comprehensive error handling
