# StreamerSongList API Testing Report

> Update (2025-11-01): This report’s API findings remain useful, but the MCP server implementation has been streamlined. The server exposes 6 tools total, all using public read-only endpoints; `searchSongs` performs client-side filtering and `monitorQueue` returns an initial snapshot with a simulated description of monitoring. `getSongDetails` now calls the direct endpoint (`/streamers/{name}/songs/{songId}`).

**Date**: October 12, 2025
**Test Streamer**: vu_vu (ID: 21108)
**API Base URL**: https://api.streamersonglist.com/v1/

## Executive Summary

After comprehensive testing of the StreamerSongList API, we discovered significant discrepancies between the documented API capabilities (in SSLv1-keydata.md) and the actual live implementation. Only 4 out of 11+ documented endpoints are functional, with the rest returning 404 errors.

## Working Endpoints ✅

### 1. Get Streamer Information
**Endpoint**: `GET /v1/streamers/{streamerName}`
**Status**: ✅ WORKING
**Authentication**: None required
**Response**: Comprehensive streamer configuration including:
- Basic info (ID, name, creation date)
- Queue settings (limits, permissions, request modes)
- Attributes array (tags with subscriber restrictions)
- Global commands (23 available commands)
- Command messages (automated responses)
- Moderator settings

**Example Response Structure**:
```json
{
  "id": 21108,
  "name": "vu_vu",
  "allowDuplicates": true,
  "requestsActive": true,
  "attributes": [...],
  "globalCommands": [...],
  "commandMessages": [...]
}
```

### 2. Get Current Queue
**Endpoint**: `GET /v1/streamers/{streamerName}/queue`
**Status**: ✅ WORKING
**Authentication**: None required
**Parameters**: `limit`, `offset` for pagination
**Response**: Queue items with:
- Position, song details, request information
- Donation amounts, notes, creation timestamps
- Full song objects embedded

### 3. Get Streamer Song List
**Endpoint**: `GET /v1/streamers/{streamerName}/songs`
**Status**: ✅ WORKING
**Authentication**: None required
**Parameters**: Pagination support
**Response**: Complete song catalog (266 songs for vu_vu) including:
- Song metadata (title, artist, creation date)
- Play statistics (times played, last played)
- Attribute associations
- Minimum donation amounts

### 4. Get Individual Song Details
**Endpoint**: `GET /v1/streamers/{streamerName}/songs/{songId}`
**Status**: ✅ WORKING
**Authentication**: None required
**Response**: Detailed song information including:
- Basic metadata (title, artist, active status)
- Musical information (tabs, lyrics, chords, capo)
- Play history and statistics
- Attribute associations

## Non-Working Endpoints ❌

The following endpoints are documented but return **404 Not Found**:

### Queue Management
- `GET /v1/streamers/{streamerName}/queue/stats` - Queue statistics
- `POST /v1/streamers/{streamerName}/requests` - Create song request
- `PUT /v1/streamers/{streamerName}/requests/{requestId}` - Update request
- `DELETE /v1/streamers/{streamerName}/requests/{requestId}` - Delete request

### History & Analytics
- `GET /v1/streamers/{streamerName}/history` - Play history
- `GET /v1/streamers/{streamerName}/stats` - Stream statistics

### Advanced Features
- `GET /v1/streamers/{streamerName}/overlay` - Overlay data
- `GET /v1/streamers/{streamerName}/attributes` - Attribute management
- `GET /v1/streamers/{streamerName}/polls` - Poll management
- `GET /v1/streamers/{streamerName}/saved-queues` - Saved queues
- `GET /v1/streamers/{streamerName}/offline-queues` - Offline queues

### Global Search
- `GET /v1/songs/search` - Global song search
- `GET /v1/songs/{songId}` - Global song details

## Authentication Testing

### Public Endpoints
- Working endpoints require **no authentication**
- CORS headers allow browser access
- Rate limiting appears minimal or non-existent

### Protected Endpoints
- POST requests to existing endpoints return "401 Unauthorized"
- Suggests write operations require authentication
- Authentication method not documented (likely API keys or OAuth)

## Data Quality Analysis

### Rich Data Available
1. **Streamer Configuration**: Comprehensive settings including request limits, subscriber tiers, command configurations
2. **Song Metadata**: Detailed information including tabs, lyrics, chords for musical performance
3. **Queue Management**: Real-time queue data with request details and donation information
4. **Attribute System**: Tag-based categorization with subscriber restrictions

### Missing Features
1. **Historical Data**: No access to play history or statistics
2. **Advanced Management**: No poll, saved queue, or overlay management
3. **Search Functionality**: No global or advanced search capabilities
4. **Analytics**: No statistics or analytics endpoints

## MCP Server Impact Assessment

### Current Implementation Status
The MCP server (`src/server.js`) contains 6 tools, all using public read-only endpoints:

1. `getStreamerByName` — GET `/v1/streamers/{name}` (fully functional)
2. `getQueue` — GET `/v1/streamers/{name}/queue` (fully functional)
3. `getSongs` — GET `/v1/streamers/{name}/songs` (fully functional)
4. `searchSongs` — Client-side filtering over fetched songs (uses real data from songs endpoint)
5. `getSongDetails` — GET `/v1/streamers/{name}/songs/{songId}` (direct endpoint)
6. `monitorQueue` — Returns initial snapshot and describes a simulated monitoring flow

### Recommendations

#### Immediate Actions
1. **Documentation clarity**: Clearly denote that `searchSongs` uses client-side filtering and `monitorQueue` is a snapshot + simulation.
2. **Enhance tools**: Add optional params (filters, limits) and stronger error messages.
3. **Optional**: Implement real polling/streaming if upstream supports it; add basic rate-limit backoff.

#### Future Enhancements
1. **Authentication Integration**: Implement API key or OAuth authentication when available
2. **Simulated Data Improvement**: Enhance mock data for non-functional endpoints to be more realistic
3. **Alternative Data Sources**: Consider additional data sources for missing functionality

## Technical Findings

### API Performance
- Response times: ~200-500ms for working endpoints
- Data format: Consistent JSON structure
- Error handling: Clear HTTP status codes and messages
- Pagination: Supported on songs and queue endpoints

### API Design Patterns
- RESTful design with proper HTTP methods
- Consistent naming conventions
- Logical resource hierarchy
- Proper HTTP status codes

### Documentation Gaps
- SSLv1-keydata.md describes comprehensive API that doesn't exist
- No public OpenAPI/Swagger specification available
- Authentication methods not documented
- Rate limits not specified

## Conclusion

The StreamerSongList API provides solid foundational functionality for basic streamer information, queue management, and song catalog access. However, the advanced features described in internal documentation are not available in the live implementation.

The current MCP server appropriately handles this limitation by providing simulated data for advanced features while maintaining full functionality for available endpoints. For production use, the server should be updated to clearly document which features use real data versus simulated responses.

**API Maturity Level**: Basic (Read-only public endpoints available)
**Recommended for Production**: Yes, with clear documentation of limitations
**Enhancement Potential**: High, pending API development or authentication access
