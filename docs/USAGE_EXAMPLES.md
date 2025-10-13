# StreamerSongList MCP Server - Usage Examples

This document provides practical examples of how to use the StreamerSongList MCP server's 7 tools for various use cases including music discovery, content creation, analytics, and automation.

## Available Tools

- **getStreamerByName** - Fetch detailed streamer information
- **getQueue** - View current song queue with pagination
 
- **monitorQueue** - Monitor queue changes over time
- **getSongs** - Fetch complete song list with pagination
- **searchSongs** - Search songs by title or artist
- **getSongDetails** - Get detailed information about a specific song

## 🎵 Music Discovery & Analysis

### Compare Streamer Music Libraries

Discover different music tastes and preferences between streamers:

```json
{
  "tool": "getSongs",
  "arguments": {
    "streamerName": "vu_vu",
    "limit": 50
  }
}
```

```json
{
  "tool": "getSongs",
  "arguments": {
    "streamerName": "belleune",
    "limit": 50
  }
}
```

**Use Case**: Compare music collections - vu_vu (266 songs, pop/rock) vs belleune (545 songs, jazz standards)

### Find Similar Songs Across Streamers

```json
{
  "tool": "searchSongs",
  "arguments": {
    "streamerName": "vu_vu",
    "query": "Dua Lipa",
    "limit": 10
  }
}
```

```json
{
  "tool": "searchSongs",
  "arguments": {
    "streamerName": "belleune",
    "query": "Frank Sinatra",
    "limit": 10
  }
}
```

**Use Case**: See which artists are popular across different streamers

### Artist Popularity Analysis

```json
{
  "tool": "searchSongs",
  "arguments": {
    "streamerName": "vu_vu",
    "query": "Taylor Swift"
  }
}
```

```json
{
  "tool": "searchSongs",
  "arguments": {
    "streamerName": "belleune",
    "query": "Ella Fitzgerald"
  }
}
```

**Use Case**: Analyze which artists dominate each streamer's library

## 📊 Content Creator Tools

### Stream Theme Planning

Plan themed streams based on available music:

```json
{
  "tool": "getSongs",
  "arguments": {
    "streamerName": "belleune",
    "limit": 30
  }
}
```

**Use Case**: Jazz night - explore belleune's extensive jazz collection

```json
{
  "tool": "searchSongs",
  "arguments": {
    "streamerName": "vu_vu",
    "query": "rock",
    "limit": 20
  }
}
```

**Use Case**: Rock night - find rock songs in vu_vu's library

### Audience Request Management

Check if requested songs are available:

```json
{
  "tool": "searchSongs",
  "arguments": {
    "streamerName": "vu_vu",
    "query": "Bohemian Rhapsody"
  }
}
```

Get detailed information about specific songs:

```json
{
  "tool": "getSongDetails",
  "arguments": {
    "streamerName": "belleune",
    "songId": 1940224
  }
}
```

**Use Case**: Verify song details before accepting viewer requests

### Queue Analytics

Monitor current queue status:

```json
{
  "tool": "getQueue",
  "arguments": {
    "streamerName": "vu_vu",
    "limit": 10
  }
}
```

 
Use case: For queue analytics, combine `getQueue` responses over time or use `monitorQueue` to observe changes.

## 🎯 Automated Workflows

### Daily Music Reports

Generate daily summaries of most popular songs:

```json
{
  "tool": "getSongs",
  "arguments": {
    "streamerName": "belleune",
    "limit": 100
  }
}
```

**Use Case**: Extract top played songs for daily reports (sort by `timesPlayed` field)

### Real-time Queue Monitoring

```json
{
  "tool": "monitorQueue",
  "arguments": {
    "streamerName": "vu_vu",
    "interval": 60,
    "duration": 3600
  }
}
```

**Use Case**: Monitor queue changes during active streaming hours

### Library Management

Find duplicate or similar songs:

```json
{
  "tool": "searchSongs",
  "arguments": {
    "streamerName": "vu_vu",
    "query": "Love",
    "limit": 20
  }
}
```

```json
{
  "tool": "searchSongs",
  "arguments": {
    "streamerName": "vu_vu",
    "query": "Heart",
    "limit": 20
  }
}
```

**Use Case**: Identify potential duplicates or themed song groups

### Performance Tracking

Track which songs get played most often:

```json
{
  "tool": "getSongDetails",
  "arguments": {
    "streamerName": "belleune",
    "songId": 1831207
  }
}
```

**Use Case**: Monitor performance of "La Vie En Rose" (64 plays)

## 🤖 AI Assistant Integration

### Smart Music Recommendations

Claude can suggest songs based on context:

**Weather-based suggestions:**
```json
{
  "tool": "searchSongs",
  "arguments": {
    "streamerName": "belleune",
    "query": "Rain",
    "limit": 10
  }
}
```

**Time of day suggestions:**
```json
{
  "tool": "searchSongs",
  "arguments": {
    "streamerName": "belleune",
    "query": "Moon",
    "limit": 10
  }
}
```

**Mood-based suggestions:**
```json
{
  "tool": "searchSongs",
  "arguments": {
    "streamerName": "vu_vu",
    "query": "Happy",
    "limit": 10
  }
}
```

### Interactive Games

**"Guess the Artist" games:**
```json
{
  "tool": "searchSongs",
  "arguments": {
    "streamerName": "vu_vu",
    "query": "Queen"
  }
}
```

```json
{
  "tool": "searchSongs",
  "arguments": {
    "streamerName": "vu_vu",
    "query": "Beatles"
  }
}
```

**"Music Trivia" with themed questions:**
```json
{
  "tool": "searchSongs",
  "arguments": {
    "streamerName": "belleune",
    "query": "Love",
    "limit": 15
  }
}
```

```json
{
  "tool": "searchSongs",
  "arguments": {
    "streamerName": "belleune",
    "query": "River",
    "limit": 10
  }
}
```

## 📈 Data Analysis & Insights

### Genre Distribution Analysis

Analyze music preferences by streamer:

```json
{
  "tool": "getSongs",
  "arguments": {
    "streamerName": "vu_vu",
    "limit": 50
  }
}
```

**Expected Pattern**: Pop/rock/modern music

```json
{
  "tool": "getSongs",
  "arguments": {
    "streamerName": "belleune",
    "limit": 50
  }
}
```

**Expected Pattern**: Jazz standards and classics

### Engagement Metrics

See which songs drive audience engagement:

```json
{
  "tool": "getQueue",
  "arguments": {
    "streamerName": "vu_vu"
  }
}
```

**Use Case**: What songs are currently requested by viewers

```json
{
  "tool": "getSongDetails",
  "arguments": {
    "streamerName": "belleune",
    "songId": 1831207
  }
}
```

**Use Case**: Analyze most popular song performance (64 plays)

### Trend Analysis

Monitor music trends over time:

```json
{
  "tool": "monitorQueue",
  "arguments": {
    "streamerName": "vu_vu",
    "interval": 300,
    "duration": 7200
  }
}
```

**Use Case**: 2-hour monitoring during peak streaming time

```json
{
  "tool": "searchSongs",
  "arguments": {
    "streamerName": "belleune",
    "query": "2024",
    "limit": 20
  }
}
```

**Use Case**: Find recently added songs from 2024

## 🎪 Event Planning

### Special Occasion Streams

**Birthday celebration streams:**
```json
{
  "tool": "searchSongs",
  "arguments": {
    "streamerName": "belleune",
    "query": "Happy",
    "limit": 10
  }
}
```

```json
{
  "tool": "searchSongs",
  "arguments": {
    "streamerName": "vu_vu",
    "query": "Celebration",
    "limit": 10
  }
}
```

**Holiday-themed streams:**
```json
{
  "tool": "searchSongs",
  "arguments": {
    "streamerName": "belleune",
    "query": "Christmas",
    "limit": 15
  }
}
```

```json
{
  "tool": "searchSongs",
  "arguments": {
    "streamerName": "vu_vu",
    "query": "Halloween",
    "limit": 10
  }
}
```

### Collaboration Planning

Find common songs between streamers for collaborations:

```json
{
  "tool": "getSongs",
  "arguments": {
    "streamerName": "vu_vu",
    "limit": 100
  }
}
```

```json
{
  "tool": "getSongs",
  "arguments": {
    "streamerName": "belleune",
    "limit": 100
  }
}
```

**Use Case**: Claude can compare results and suggest collaboration-compatible songs

## 🛠️ Technical Applications

### Database Backup & Export

Export complete song libraries for backup:

```json
{
  "tool": "getSongs",
  "arguments": {
    "streamerName": "belleune",
    "limit": 545
  }
}
```

**Use Case**: Full library backup (545 songs)

```json
{
  "tool": "getSongs",
  "arguments": {
    "streamerName": "vu_vu",
    "limit": 266
  }
}
```

**Use Case**: Full library backup (266 songs)

### API Health Monitoring

Test API endpoints and response times:

```json
{
  "tool": "getStreamerByName",
  "arguments": {
    "streamerName": "vu_vu"
  }
}
```

```json
{
  "tool": "getQueue",
  "arguments": {
    "streamerName": "belleune"
  }
}
```

**Use Case**: Verify API functionality and performance

### Configuration Validation

Verify streamer setup and permissions:

```json
{
  "tool": "getStreamerByName",
  "arguments": {
    "streamerName": "vu_vu"
  }
}
```

```json
{
  "tool": "getStreamerByName",
  "arguments": {
    "streamerName": "belleune"
  }
}
```

**Use Case**: Check streamer configuration, attributes, and permissions

## 💡 Pro Tips

### Pagination Strategy
- Use `limit` and `offset` parameters for large libraries
- Start with small limits (10-20) for discovery
- Use larger limits (100+) for full analysis

### Search Optimization
- Use lowercase queries for case-insensitive search
- Try partial artist names (e.g., "Sinatra" instead of "Frank Sinatra")
- Combine search terms to narrow results

### Performance Considerations
- Cache results for frequently accessed data
- Use monitoring tools sparingly to avoid API rate limits
- Batch requests when possible for efficiency

### Error Handling
- Always check if streamer exists before accessing song data
- Handle cases where songs might not be found
- Validate song IDs before requesting details

## 🚀 Advanced Use Cases

### Automated Content Generation
Generate weekly "Top 10" lists based on play counts:
```json
{
  "tool": "getSongs",
  "arguments": {
    "streamerName": "belleune",
    "limit": 200
  }
}
```
Process results to extract and sort by `timesPlayed` field

### Cross-Platform Integration
Combine with other APIs to create rich music experiences:
- Weather APIs for mood-based suggestions
- Calendar APIs for event-specific playlists
- Social media APIs for trending songs

### Machine Learning Applications
Use song data for:
- Recommendation algorithms
- Genre classification
- Listener behavior analysis
- Predictive queue management

The StreamerSongList MCP server provides powerful programmatic access to streamer music libraries, enabling endless possibilities for automation, analysis, content creation, and AI-powered music experiences!

Note: Please be considerate of other users and avoid overloading the API with excessive requests. This tool only works due to the Streamersonglist.com api being open to the public. 