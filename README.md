# StreamerSongList MCP Server

[![Test MCP Server](https://github.com/vuvuvu/streamersonglist-mcp/actions/workflows/test.yml/badge.svg)](https://github.com/vuvuvu/streamersonglist-mcp/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

A Model Context Protocol (MCP) server that provides tools for interacting with StreamerSongList APIs. This server enables AI assistants like Claude to manage song requests, monitor queues, and interact with streaming platforms' song request systems.

## Features

### 🎵 Available Tools

- **getStreamerByName**: Fetch detailed information about a specific streamer
- **getQueue**: View current song queues with pagination support  
- **getQueueStats**: Get comprehensive stats about song queues including total songs, duration, and popular tracks
- **manageSongRequest**: Create, update, and delete song requests
- **monitorQueue**: Monitor queue changes with configurable polling intervals

### 🔧 Technical Features

- **MCP Protocol Compliant**: Works with Claude Desktop, OpenAI agents, and other MCP clients
- **Type Safety**: Built with comprehensive input validation
- **Error Handling**: Robust error handling and user-friendly error messages
- **No Authentication Required**: Simplified setup without auth complexity

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

## Tool Documentation

### getStreamerByName

Fetch detailed information about a specific streamer.

**Parameters:**
- `streamerName` (string, required): The name of the streamer

**Example:**
```
Use getStreamerByName with streamerName "shroud"
```

### getQueue

View current song queues with pagination support.

**Parameters:**
- `streamerName` (string, required): The name of the streamer whose queue to fetch
- `limit` (number, optional): Maximum number of songs to return (default: 50)
- `offset` (number, optional): Number of songs to skip for pagination (default: 0)

**Example:**
```
Use getQueue with streamerName "pokimane" and limit 10
```

### getQueueStats

Get comprehensive stats about song queues.

**Parameters:**
- `streamerName` (string, required): The name of the streamer whose queue stats to fetch

**Example:**
```
Use getQueueStats with streamerName "ninja"
```

### manageSongRequest

Create, update, and delete song requests.

**Parameters:**
- `action` (string, required): The action to perform ("create", "update", or "delete")
- `streamerName` (string, required): The name of the streamer
- `requestId` (string, optional): The ID of the request (required for update/delete)
- `songTitle` (string, optional): The title of the song (required for create/update)
- `artist` (string, optional): The artist name
- `requesterName` (string, optional): The name of the person making the request
- `message` (string, optional): Optional message with the request

**Examples:**
```
Use manageSongRequest to create a new request:
- action: "create"
- streamerName: "shroud"
- songTitle: "Bohemian Rhapsody"
- artist: "Queen"
- requesterName: "ChatUser123"
```

### monitorQueue

Monitor queue changes with configurable polling intervals.

**Parameters:**
- `streamerName` (string, required): The name of the streamer whose queue to monitor
- `interval` (number, optional): Polling interval in seconds (default: 30)
- `duration` (number, optional): How long to monitor in seconds (default: 300)

**Example:**
```
Use monitorQueue with streamerName "pokimane", interval 60, duration 600
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

The server interacts with these StreamerSongList API endpoints:

- `GET /v1/streamers/{streamerName}` - Get streamer information
- `GET /v1/streamers/{streamerName}/queue` - Get song queue
- `GET /v1/streamers/{streamerName}/queue/stats` - Get queue statistics
- `POST /v1/streamers/{streamerName}/requests` - Create song request
- `PUT /v1/streamers/{streamerName}/requests/{requestId}` - Update song request
- `DELETE /v1/streamers/{streamerName}/requests/{requestId}` - Delete song request

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
   - The StreamerSongList API endpoints are simulated for demonstration
   - In a real implementation, you would need valid API credentials
   - Check network connectivity if using real endpoints

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

### v1.0.0
- Initial release
- All 5 StreamerSongList tools implemented
- MCP protocol compliance
- Claude Desktop integration
- Comprehensive error handling