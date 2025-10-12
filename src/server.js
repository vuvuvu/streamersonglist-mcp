#!/usr/bin/env node

// Add fetch polyfill for Node.js environments
const { fetch } = require('undici');
globalThis.fetch = fetch;

// Import required modules
const path = require('path');
const fs = require('fs');
const pkg = require('../package.json');

// Derive runtime metadata and configuration from package.json / env
const PACKAGE_VERSION = pkg.version || '0.0.0';
const SDK_DEP_RANGE = (pkg.dependencies && pkg.dependencies['@modelcontextprotocol/sdk']) || '';
const API_BASE = process.env.SSL_API_BASE || 'https://api.streamersonglist.com/v1';

// Function to find the MCP SDK
function findMcpSdk() {
  try {
    // First try direct import
    return require('@modelcontextprotocol/sdk');
  } catch (e) {
    // Look for the SDK in various locations
    const possiblePaths = [
      // Local node_modules
      path.join(process.cwd(), 'node_modules/@modelcontextprotocol/sdk'),
      // Parent node_modules (when installed as dependency)
      path.join(process.cwd(), '../node_modules/@modelcontextprotocol/sdk'),
      // Global node_modules
      path.join(process.execPath, '../lib/node_modules/@modelcontextprotocol/sdk')
    ];
    
    for (const basePath of possiblePaths) {
      try {
        if (fs.existsSync(path.join(basePath, 'package.json'))) {
          // Found the SDK, now try to load the components
          const serverPath = path.join(basePath, 'dist/cjs/server/index.js');
          const stdioPath = path.join(basePath, 'dist/cjs/server/stdio.js');
          const typesPath = path.join(basePath, 'dist/cjs/types.js');
          
          if (fs.existsSync(serverPath) && fs.existsSync(stdioPath) && fs.existsSync(typesPath)) {
            return {
              Server: require(serverPath).Server,
              StdioServerTransport: require(stdioPath).StdioServerTransport,
              CallToolRequestSchema: require(typesPath).CallToolRequestSchema,
              ListToolsRequestSchema: require(typesPath).ListToolsRequestSchema
            };
          }
        }
      } catch (err) {
        // Continue to next path
      }
    }
    
    // If we get here, we couldn't find the SDK
    throw new Error('Could not locate @modelcontextprotocol/sdk in any node_modules directory');
  }
}

// Try to load the MCP SDK
try {
  const sdk = findMcpSdk();
  
  // Make components available globally
  global.Server = sdk.Server;
  global.StdioServerTransport = sdk.StdioServerTransport;
  global.CallToolRequestSchema = sdk.CallToolRequestSchema;
  global.ListToolsRequestSchema = sdk.ListToolsRequestSchema;
} catch (error) {
  console.error("Error loading MCP SDK:", error.message);
  const sdkHint = SDK_DEP_RANGE || 'latest';
  console.error(`Please install the MCP SDK with: npm install @modelcontextprotocol/sdk@${sdkHint}`);
  console.error(`If the error persists, try installing the package globally: npm install -g @modelcontextprotocol/sdk@${sdkHint}`);
  process.exit(1);
}

// Parse CLI arguments for default streamer preference
function resolveDefaultStreamer(argv) {
  let streamer = null;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--streamer' || arg === '-s') {
      const next = argv[i + 1];
      if (next && !next.startsWith('-')) {
        streamer = next;
        break;
      }
    } else if (arg.startsWith('--streamer=')) {
      streamer = arg.split('=')[1];
      break;
    } else if (arg.startsWith('-') && !arg.startsWith('--') && arg.length > 2) {
      streamer = arg.slice(1);
      break;
    }
  }

  return streamer;
}

const cliArgs = process.argv.slice(2);
const cliDefaultStreamer = resolveDefaultStreamer(cliArgs);

if (cliDefaultStreamer) {
  process.env.DEFAULT_STREAMER = cliDefaultStreamer;
}

// Create the server
let defaultStreamer = process.env.DEFAULT_STREAMER || null;

const server = new global.Server(
  {
    name: "streamersonglist-mcp",
    version: PACKAGE_VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const tools = [
  {
    name: "getStreamerByName",
    description: "Fetch detailed information about a specific streamer",
    inputSchema: {
      type: "object",
      properties: {
        streamerName: {
          type: "string",
          description: "The name of the streamer",
        },
      },
      required: [],
    },
  },
  {
    name: "getQueue",
    description: "View current song queues with pagination support",
    inputSchema: {
      type: "object",
      properties: {
        streamerName: {
          type: "string",
          description: "The name of the streamer whose queue to fetch",
        },
        limit: {
          type: "number",
          description: "Maximum number of songs to return (default: 50)",
          default: 50,
        },
        offset: {
          type: "number",
          description: "Number of songs to skip for pagination (default: 0)",
          default: 0,
        },
      },
      required: [],
    },
  },
    {
    name: "monitorQueue",
    description: "Monitor queue changes with configurable polling intervals",
    inputSchema: {
      type: "object",
      properties: {
        streamerName: {
          type: "string",
          description: "The name of the streamer whose queue to monitor",
        },
        interval: {
          type: "number",
          description: "Polling interval in seconds (default: 30)",
          default: 30,
        },
        duration: {
          type: "number",
          description: "How long to monitor in seconds (default: 300)",
          default: 300,
        },
      },
      required: [],
    },
  },
  {
    name: "getSongs",
    description: "Fetch the complete song list for a streamer with pagination support",
    inputSchema: {
      type: "object",
      properties: {
        streamerName: {
          type: "string",
          description: "The name of the streamer whose song list to fetch",
        },
        limit: {
          type: "number",
          description: "Maximum number of songs to return (default: 100)",
          default: 100,
        },
        offset: {
          type: "number",
          description: "Number of songs to skip for pagination (default: 0)",
          default: 0,
        },
      },
      required: [],
    },
  },
  {
    name: "searchSongs",
    description: "Search within a streamer's song list by title or artist",
    inputSchema: {
      type: "object",
      properties: {
        streamerName: {
          type: "string",
          description: "The name of the streamer whose songs to search",
        },
        query: {
          type: "string",
          description: "Search query to match against song titles and artists",
        },
        limit: {
          type: "number",
          description: "Maximum number of results to return (default: 20)",
          default: 20,
        },
      },
      required: ["query"],
    },
  },
  {
    name: "getSongDetails",
    description: "Get detailed information about a specific song by ID",
    inputSchema: {
      type: "object",
      properties: {
        streamerName: {
          type: "string",
          description: "The name of the streamer who owns the song",
        },
        songId: {
          type: "number",
          description: "The ID of the song to fetch details for",
        },
      },
      required: ["songId"],
    },
  },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: rawArgs } = request.params;
  const args = rawArgs ?? {};

  try {
    switch (name) {
      case "getStreamerByName": {
        const { streamerName = defaultStreamer } = args;

        if (!streamerName) {
          throw new Error(
            "streamerName is required. Provide a streamerName or set the DEFAULT_STREAMER environment variable."
          );
        }
        
        try {
          const response = await fetch(`${API_BASE}/streamers/${encodeURIComponent(streamerName)}`);
          
          if (!response.ok) {
            return {
              content: [{
                type: "text",
                text: `Error fetching streamer data: ${response.status} ${response.statusText}`
              }]
            };
          }
          
          const streamerData = await response.json();
          return {
            content: [{
              type: "text",
              text: JSON.stringify(streamerData, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          };
        }
      }

      case "getQueue": {
        const { streamerName = defaultStreamer, limit = 50, offset = 0 } = args;

        if (!streamerName) {
          throw new Error(
            "streamerName is required. Provide a streamerName or set the DEFAULT_STREAMER environment variable."
          );
        }
        
        try {
          const response = await fetch(`${API_BASE}/streamers/${encodeURIComponent(streamerName)}/queue?limit=${limit}&offset=${offset}`);
          
          if (!response.ok) {
            return {
              content: [{
                type: "text",
                text: `Error fetching queue: ${response.status} ${response.statusText}`
              }]
            };
          }
          
          const queueData = await response.json();
          return {
            content: [{
              type: "text",
              text: JSON.stringify(queueData, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          };
        }
      }

      case "monitorQueue": {

        const { streamerName = defaultStreamer, interval = 30, duration = 300 } = args;

        if (!streamerName) {
          throw new Error(
            "streamerName is required. Provide a streamerName or set the DEFAULT_STREAMER environment variable."
          );
        }
        
        try {
          const updates = [];
          
          // Initial queue fetch
          const initialResponse = await fetch(`https://api.streamersonglist.com/v1/streamers/${encodeURIComponent(streamerName)}/queue`);
          if (initialResponse.ok) {
            const initialQueue = await initialResponse.json();
            updates.push({
              timestamp: new Date().toISOString(),
              type: 'initial',
              data: initialQueue
            });
          }
          
          const monitoringId = `monitor_${streamerName}_${Date.now()}`;
          
          return {
            content: [{
              type: "text",
              text: `Started monitoring queue for ${streamerName}\n` +
                    `Monitoring ID: ${monitoringId}\n` +
                    `Interval: ${interval} seconds\n` +
                    `Duration: ${duration} seconds\n` +
                    `\nNote: This is a simulation. In a real implementation, this would:\n` +
                    `- Establish WebSocket or SSE connection\n` +
                    `- Subscribe to queue updates for the streamer\n` +
                    `- Send real-time notifications of queue changes\n` +
                    `\nInitial queue data:\n${JSON.stringify(updates, null, 2)}`
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error setting up monitoring: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          };
        }
      }

      case "getSongs": {
        const { streamerName = defaultStreamer, limit = 100, offset = 0 } = args;

        if (!streamerName) {
          throw new Error(
            "streamerName is required. Provide a streamerName or set the DEFAULT_STREAMER environment variable."
          );
        }

        try {
          const response = await fetch(`${API_BASE}/streamers/${encodeURIComponent(streamerName)}/songs?limit=${limit}&offset=${offset}`);

          if (!response.ok) {
            return {
              content: [{
                type: "text",
                text: `Error fetching song list: ${response.status} ${response.statusText}`
              }]
            };
          }

          const songsData = await response.json();
          return {
            content: [{
              type: "text",
              text: JSON.stringify(songsData, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          };
        }
      }

      case "searchSongs": {
        const { streamerName = defaultStreamer, query, limit = 20 } = args;

        if (!streamerName) {
          throw new Error(
            "streamerName is required. Provide a streamerName or set the DEFAULT_STREAMER environment variable."
          );
        }

        if (!query) {
          throw new Error("query is required for song search");
        }

        try {
          // First get all songs, then filter locally
          const response = await fetch(`${API_BASE}/streamers/${encodeURIComponent(streamerName)}/songs?limit=1000`);

          if (!response.ok) {
            return {
              content: [{
                type: "text",
                text: `Error fetching songs for search: ${response.status} ${response.statusText}`
              }]
            };
          }

          const songsData = await response.json();
          const allSongs = songsData.items || songsData; // Handle different response formats
          const searchQuery = query.toLowerCase();

          // Filter songs by title or artist
          const filteredSongs = allSongs.filter(song => {
            const title = (song.title || '').toLowerCase();
            const artist = (song.artist || '').toLowerCase();
            return title.includes(searchQuery) || artist.includes(searchQuery);
          }).slice(0, limit);

          return {
            content: [{
              type: "text",
              text: `Found ${filteredSongs.length} songs matching "${query}":\n${JSON.stringify(filteredSongs, null, 2)}`
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          };
        }
      }

      case "getSongDetails": {
        const { streamerName = defaultStreamer, songId } = args;

        if (!streamerName) {
          throw new Error(
            "streamerName is required. Provide a streamerName or set the DEFAULT_STREAMER environment variable."
          );
        }

        if (!songId) {
          throw new Error("songId is required");
        }

        try {
          // Get all songs and find the specific one
          const response = await fetch(`${API_BASE}/streamers/${encodeURIComponent(streamerName)}/songs`);

          if (!response.ok) {
            return {
              content: [{
                type: "text",
                text: `Error fetching songs: ${response.status} ${response.statusText}`
              }]
            };
          }

          const songsData = await response.json();
          const allSongs = songsData.items || songsData; // Handle different response formats
          const song = allSongs.find(s => s.id === songId);

          if (!song) {
            return {
              content: [{
                type: "text",
                text: `Song with ID ${songId} not found for streamer ${streamerName}`
              }]
            };
          }

          return {
            content: [{
              type: "text",
              text: JSON.stringify(song, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          };
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      }],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new global.StdioServerTransport();
  await server.connect(transport);
  console.error("StreamerSongList MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
