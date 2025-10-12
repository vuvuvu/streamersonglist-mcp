# Documentation

This directory contains detailed documentation for the StreamerSongList MCP Server.

## Files

### API Documentation
- **[API_TESTING_REPORT.md](./API_TESTING_REPORT.md)** - API testing results and findings (public endpoints)
- **[SSLv1-keydata.md](./SSLv1-keydata.md)** - StreamerSongList API data models (reference)

### Project Analysis
- **[Enhanced-mcp.md](./Enhanced-mcp.md)** - Enhancement proposals and technical notes
- **[AGENTS.md](./AGENTS.md)** - Repository guidelines for contributors

### Research Materials
- API Endpoint Discovery Methods (PDFs) - Research on API discovery techniques

## Quick Reference

For most users, the main [README.md](../README.md) in the project root contains all necessary information to get started.

These documentation files are primarily for:
- Developers extending the MCP server
- Understanding API limitations and capabilities
- Research and development planning

## Status Summary

- ✅ Implemented tools use public, read-only API endpoints
- 📦 Package publishes only `src/` for minimal installs
- ⚙️ Configuration: `DEFAULT_STREAMER`, `SSL_API_BASE`

For most users, start with the project [README.md](../README.md). Developers can explore deeper docs here.

## Contributing & Credits

- Contributions are welcome via pull requests (docs, fixes, small enhancements). The upstream API has limited surface area, so large feature additions may be out of scope.
- StreamerSonglist is the original service and API provider: https://www.streamersonglist.com. This project is not affiliated with or endorsed by StreamerSonglist.
