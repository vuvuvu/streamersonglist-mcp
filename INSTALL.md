# Installation

Set up the StreamerSongList MCP server quickly with either npx or a local clone.

## Prerequisites

- Node.js 18+
- (Optional) Claude Desktop for day-to-day use

## Option A — Claude Desktop via npx (Recommended)

Add to your Claude Desktop config:

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

Restart Claude Desktop.

## Option B — Local Clone

```bash
git clone https://github.com/vuvuvu/streamersonglist-mcp.git
cd streamersonglist-mcp
npm install
```

Register the server with Claude Desktop using either:

```json
{
  "mcpServers": {
    "streamersonglist": {
      "command": "node",
      "args": ["src/server.js"],
      "cwd": "/absolute/path/to/streamersonglist-mcp"
    }
  }
}
```

## Inspect / Verify

Recommended: use the MCP Inspector to explore tools and make requests:

```bash
npx @modelcontextprotocol/inspector@latest -- npx streamersonglist-mcp
# or when running from a local clone
npx @modelcontextprotocol/inspector@latest -- node src/server.js
```

Scripted checks:

```bash
npm test   # starts server and verifies tools/list
npm start  # run server on stdio (advanced)
printf '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}\n' | node src/server.js
```

## Optional: Default Streamer

Provide a fallback when `streamerName` is omitted:

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

CLI alternatives:

```bash
DEFAULT_STREAMER=public_streamer npx streamersonglist-mcp
npx streamersonglist-mcp --streamer public_streamer
```

Security tip: do not default to private streamer names; this server targets public read-only endpoints only.

