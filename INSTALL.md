# Installation Guide

This guide will help you install and set up the StreamerSongList MCP Server with Claude Desktop.

## Prerequisites

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **Claude Desktop** - [Download here](https://claude.ai/download)

## Quick Installation

### Option 1: Using npx (Simplest)

No installation required! Just add this to your Claude Desktop config:

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

Then restart Claude Desktop and you're ready to go!

### Option 2: Automatic Local Setup

1. **Clone and install:**
   ```bash
   git clone https://github.com/vuvuvu/streamersonglist-mcp.git
   cd streamersonglist-mcp
   npm install
   ```

2. **Test the server:**
   ```bash
   npm test
   ```

3. **Automatically configure Claude Desktop:**
   ```bash
   npm run setup
   ```

4. **Restart Claude Desktop** and you're ready to go!

### Option 2: Manual Setup

1. **Clone and install:**
   ```bash
   git clone https://github.com/vuvuvu/streamersonglist-mcp.git
   cd streamersonglist-mcp
   npm install
   ```

2. **Test the server:**
   ```bash
   npm test
   ```

3. **Find your Claude Desktop config file:**
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

4. **Add the server configuration:**
   ```json
   {
     "mcpServers": {
       "streamersonglist": {
         "command": "node",
         "args": ["src/server.js"],
         "cwd": "/full/path/to/streamersonglist-mcp"
       }
     }
   }
   ```

5. **Restart Claude Desktop**

## Verification

After setup, test that everything works:

1. **Open Claude Desktop**
2. **Ask Claude:** *"What MCP tools do you have available?"*
3. **You should see StreamerSongList tools listed**
4. **Test a tool:** *"Use the getStreamerByName tool to get information about 'shroud'"*

## Troubleshooting

### Server Not Starting

```bash
# Check Node.js version (should be 18+)
node --version

# Test server manually
npm start
# Should show: "StreamerSongList MCP Server running on stdio"
# Press Ctrl+C to exit
```

### Claude Desktop Not Seeing Server

1. **Check config file location:**
   ```bash
   # macOS
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
   
   # Windows
   type %APPDATA%\Claude\claude_desktop_config.json
   ```

2. **Verify the path in config is correct:**
   - Use absolute paths (not relative)
   - Ensure the `cwd` points to your project directory
   - Check for JSON syntax errors

3. **Restart Claude Desktop completely:**
   - Quit the application entirely
   - Reopen it
   - Wait a moment for servers to load

### Permission Issues

```bash
# Make sure the server file is executable
chmod +x src/server.js

# Check file permissions
ls -la src/server.js
```

### Dependencies Issues

```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Advanced Configuration

### Environment Variables

You can set environment variables in the Claude Desktop config:

```json
{
  "mcpServers": {
    "streamersonglist": {
      "command": "node",
      "args": ["src/server.js"],
      "cwd": "/path/to/streamersonglist-mcp",
      "env": {
        "API_BASE_URL": "https://custom-api.example.com",
        "DEBUG": "true"
      }
    }
  }
}
```

### Multiple Servers

You can run multiple MCP servers:

```json
{
  "mcpServers": {
    "streamersonglist": {
      "command": "node",
      "args": ["src/server.js"],
      "cwd": "/path/to/streamersonglist-mcp"
    },
    "other-server": {
      "command": "python",
      "args": ["server.py"],
      "cwd": "/path/to/other-server"
    }
  }
}
```

## Getting Help

- **GitHub Issues**: Report problems or request features
- **MCP Documentation**: https://modelcontextprotocol.io
- **Claude Desktop Help**: https://claude.ai/help

## Next Steps

Once installed, try these commands with Claude:

- *"Get information about streamer 'ninja' using StreamerSongList tools"*
- *"Show me the current song queue for 'pokimane'"*
- *"Get queue statistics for a popular streamer"*
- *"Help me create a song request for 'shroud'"*