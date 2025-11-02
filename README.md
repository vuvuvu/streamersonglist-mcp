# StreamerSongList MCP Server (Node‑Minimal)

 MCP server exposing 6 read‑only StreamerSongList tools. Uses the StreamerSongList API. 

## Tools
- getStreamerByName — fetch streamer configuration
- getQueue — current song queue (pagination)
- getSongs — full song list (pagination)
- searchSongs — client‑side filter over the song list
- getSongDetails — direct endpoint by `songId`
- monitorQueue — initial snapshot + simulated description

## Quick Start
```npx streamersonglist-mcp -s <streamerName>
```
the -s flag sets the default streamer name to use when none is specified in requests.
- Use with MCP Inspector to test and inspect:
  ```npx @modelcontextprotocol/inspector@latest``` 
Alternative (local clone):
- npm install && npm start
- Or: node src/server.js -s belleune

## Configuration & Scripts
- Configuration
  - `DEFAULT_STREAMER` — optional default when `streamerName` is omitted
- Scripts
  - `npm install` — install dependencies
  - `npm start` — start the MCP server on stdio
  - `npm test` — protocol smoke test
  - `npm run test:integration` - end-to-end test

## Notes
- Release 1.4.0
  - Robust npx support: resolve MCP SDK via `require.resolve` for reliable installs
  - getSongDetails uses the direct endpoint (`/songs/{songId}`)
  - monitorQueue respects the configured API base
  - Removed undici; rely on Node 18+ native `fetch`
  - Slimmed docs to keep this branch lean; added integration test
- Not associated with streamersonglist.com — thanks to StreamerSongList for their public API service.

## License
MIT — see `LICENSE`.

## Source Code
https://github.com/vuvuvu/streamersonglist-mcp