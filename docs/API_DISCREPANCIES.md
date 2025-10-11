# API Documentation Discrepancies

## Overview

This document outlines the significant discrepancies between the API capabilities described in `SSLv1-keydata.md` and the actual live StreamerSongList API implementation.

## Documented vs. Actual API Comparison

### SSLv1-keydata.md Claims

The `SSLv1-keydata.md` file describes a comprehensive API with the following data models and endpoints:

#### Documented Data Models
1. **SongEntity** - Complete song information with tabs, lyrics, chords
2. **QueueForListDef** - Queue items with full request details
3. **SavedQueueEntity** - Offline/saved queue management
4. **PlayHistoryEntity** - Historical play data
5. **AttributeEntity** - Song tags with subscriber restrictions
6. **PollEntity & PollSongEntity** - Voting system for songs
7. **OverlayEntity** - Streaming overlay configuration
8. **GlobalCommandEntity** - Chat command management
9. **BotChatMessageEntity** - Bot interaction logs

#### Documented Endpoints (Inferred)
Based on the data models, the following endpoints should exist:
- `/v1/streamers/{streamerName}/history` - Play history access
- `/v1/streamers/{streamerName}/saved-queues` - Saved queue management
- `/v1/streamers/{streamerName}/polls` - Poll creation and management
- `/v1/streamers/{streamerName}/attributes` - Attribute management
- `/v1/streamers/{streamerName}/overlay` - Overlay configuration
- `/v1/songs/search` - Global song search
- `/v1/songs/{songId}` - Global song details

### Actual API Implementation

#### Working Endpoints (4/11+)
✅ **`GET /v1/streamers/{streamerName}`** - Streamer configuration
- Returns comprehensive settings, commands, attributes
- Includes SongEntity data for songs in the streamer's catalog

✅ **`GET /v1/streamers/{streamerName}/queue`** - Current queue
- Returns QueueForListDef style data
- Includes song information and request details

✅ **`GET /v1/streamers/{streamerName}/songs`** - Song catalog
- Returns paginated SongEntity data
- Includes most SongEntity fields (minus tabs/lyrics/chords)

✅ **`GET /v1/streamers/{streamerName}/songs/{songId}`** - Song details
- Returns complete SongEntity including tabs, lyrics, chords
- Matches the documented SongEntity structure

#### Missing Endpoints (7+)
❌ **`GET /v1/streamers/{streamerName}/history`** - Returns 404
❌ **`GET /v1/streamers/{streamerName}/queue/stats`** - Returns 404
❌ **`GET /v1/streamers/{streamerName}/polls`** - Returns 404
❌ **`GET /v1/streamers/{streamerName}/saved-queues`** - Returns 404
❌ **`GET /v1/streamers/{streamerName}/offline-queues`** - Returns 404
❌ **`GET /v1/streamers/{streamerName}/attributes`** - Returns 404
❌ **`GET /v1/streamers/{streamerName}/overlay`** - Returns 404
❌ **`GET /v1/songs/search`** - Returns 404
❌ **`GET /v1/songs/{songId}`** - Returns 404

## Data Model Comparison

### SongEntity - ✅ Mostly Accurate
**Documented**: Complete song metadata with tabs, lyrics, chords, attributes
**Actual**: Available via `/songs/{songId}` endpoint with all documented fields present

### QueueForListDef - ✅ Accurate
**Documented**: Queue items with song references and request details
**Actual**: Available via `/queue` endpoint with matching structure

### AttributeEntity - ⚠️ Partially Available
**Documented**: Manageable attributes with subscriber restrictions
**Actual**: Read-only attribute data embedded in streamer configuration

### SavedQueueEntity - ❌ Not Available
**Documented**: Offline queue management system
**Actual**: No corresponding endpoints exist

### PlayHistoryEntity - ❌ Not Available
**Documented**: Historical play data with filtering
**Actual**: No history endpoints exist

### PollEntity/PollSongEntity - ❌ Not Available
**Documented**: Song voting system
**Actual**: No poll endpoints exist

### OverlayEntity - ❌ Not Available
**Documented**: Streaming overlay configuration
**Actual**: No overlay endpoints exist

## Potential Explanations for Discrepancies

### 1. API Version Evolution
- SSLv1-keydata.md may describe a future or internal API version
- Current public API may be a subset of full functionality
- Features may be rolled out incrementally

### 2. Authentication Requirements
- Missing endpoints may require authentication
- Write operations likely need API keys or OAuth
- Some features may be partner-only

### 3. Documentation Lag
- Documentation may have been written for planned features
- API may have been simplified or changed
- Internal documentation vs. public API mismatch

### 4. Feature Deprecation
- Features may have been removed or deprecated
- API consolidation may have occurred
- Focus on core functionality over advanced features

## Impact on MCP Server

### Current Implementation Strategy
The MCP server handles these discrepancies by:

1. **Real Data Tools**: Using available endpoints for core functionality
2. **Simulated Data Tools**: Providing realistic mock data for missing features
3. **Graceful Degradation**: Maintaining full tool set despite API limitations

### Recommendations for Users

#### For Production Use
1. **Rely on Real Data Tools**: Use the 4 tools with actual API support
2. **Understand Limitations**: Be aware that 7 tools use simulated data
3. **Monitor API Changes**: Check for new endpoint availability

#### For Development
1. **Clear Documentation**: Clearly distinguish real vs. simulated features
2. **Error Handling**: Implement robust error handling for API changes
3. **Authentication Support**: Prepare for future authenticated endpoint access

## Future Possibilities

### API Development
- StreamerSongList may expand public API availability
- Authentication may unlock additional endpoints
- Feature parity with documentation may improve

### MCP Server Enhancement
- Dynamic endpoint detection and adaptation
- Authentication integration when available
- Enhanced error handling and user feedback

## Conclusion

The StreamerSongList API documentation in `SSLv1-keydata.md` describes a comprehensive system that significantly exceeds the current public API implementation. While the core functionality (streamer info, queue management, song catalog) works well, advanced features like history, polls, and analytics are not accessible.

The current MCP server implementation appropriately addresses this gap by providing simulated data for missing features while maintaining full functionality for available endpoints. Users should be aware of these limitations when using the advanced features of the MCP server.

**Recommendation**: Treat the documented API as a roadmap of potential future capabilities rather than current functionality.