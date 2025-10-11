#!/usr/bin/env node

// Add fetch polyfill for Node.js environments
const { fetch } = require('undici');
globalThis.fetch = fetch;

// Import required modules
const path = require('path');
const fs = require('fs');

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
  console.error("Please install the MCP SDK with: npm install @modelcontextprotocol/sdk@1.13.3");
  console.error("If the error persists, try installing the package globally: npm install -g @modelcontextprotocol/sdk@1.13.3");
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
    version: "1.1.0",
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
    name: "getQueueStats",
    description: "Get comprehensive stats about song queues including total songs, duration, and popular tracks",
    inputSchema: {
      type: "object",
      properties: {
        streamerName: {
          type: "string",
          description: "The name of the streamer whose queue stats to fetch",
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
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

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
          const response = await fetch(`https://api.streamersonglist.com/v1/streamers/${encodeURIComponent(streamerName)}`);
          
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
          const response = await fetch(`https://api.streamersonglist.com/v1/streamers/${encodeURIComponent(streamerName)}/queue?limit=${limit}&offset=${offset}`);
          
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

      case "getQueueStats": {
        const { streamerName = defaultStreamer } = args;

        if (!streamerName) {
          throw new Error(
            "streamerName is required. Provide a streamerName or set the DEFAULT_STREAMER environment variable."
          );
        }
        
        try {
          const response = await fetch(`https://api.streamersonglist.com/v1/streamers/${encodeURIComponent(streamerName)}/queue/stats`);
          
          if (!response.ok) {
            return {
              content: [{
                type: "text",
                text: `Error fetching queue stats: ${response.status} ${response.statusText}`
              }]
            };
          }
          
          const statsData = await response.json();
          
          const summary = {
            totalSongs: statsData.totalSongs || 0,
            totalDuration: statsData.totalDuration || 0,
            averageWaitTime: statsData.averageWaitTime || 0,
            mostRequestedArtist: statsData.mostRequestedArtist || 'N/A',
            mostRequestedSong: statsData.mostRequestedSong || 'N/A',
            queueStatus: statsData.queueStatus || 'unknown'
          };
          
          return {
            content: [{
              type: "text",
              text: `Queue Statistics for ${streamerName}:\n${JSON.stringify(summary, null, 2)}`
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