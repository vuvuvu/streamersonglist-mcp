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

// Create the server
const server = new global.Server(
  {
    name: "streamersonglist-mcp",
    version: "1.0.5",
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
      required: ["streamerName"],
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
      required: ["streamerName"],
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
      required: ["streamerName"],
    },
  },
  {
    name: "manageSongRequest",
    description: "Create, update, and delete song requests",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["create", "update", "delete"],
          description: "The action to perform on the song request",
        },
        streamerName: {
          type: "string",
          description: "The name of the streamer",
        },
        requestId: {
          type: "string",
          description: "The ID of the request (required for update/delete)",
        },
        songTitle: {
          type: "string",
          description: "The title of the song (required for create/update)",
        },
        artist: {
          type: "string",
          description: "The artist name (optional for create/update)",
        },
        requesterName: {
          type: "string",
          description: "The name of the person making the request (optional for create)",
        },
        message: {
          type: "string",
          description: "Optional message with the request",
        },
      },
      required: ["action", "streamerName"],
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
      required: ["streamerName"],
    },
  },
  {
    name: "getPlayHistory",
    description: "Get performance history for a streamer with pagination and filtering options",
    inputSchema: {
      type: "object",
      properties: {
        streamerName: {
          type: "string",
          description: "The name of the streamer whose play history to fetch",
        },
        limit: {
          type: "number",
          description: "Maximum number of history entries to return (default: 50)",
          default: 50,
        },
        offset: {
          type: "number",
          description: "Number of entries to skip for pagination (default: 0)",
          default: 0,
        },
        startDate: {
          type: "string",
          description: "Start date for filtering (ISO 8601 format, optional)",
        },
        endDate: {
          type: "string",
          description: "End date for filtering (ISO 8601 format, optional)",
        },
      },
      required: ["streamerName"],
    },
  },
  {
    name: "searchSongs",
    description: "Search the song database with various filters and criteria",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query for song title or artist",
        },
        artist: {
          type: "string",
          description: "Filter by specific artist name",
        },
        genre: {
          type: "string",
          description: "Filter by music genre",
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
    name: "getSongDetails",
    description: "Get detailed information about a specific song including metadata and attributes",
    inputSchema: {
      type: "object",
      properties: {
        songId: {
          type: "string",
          description: "The unique identifier of the song",
        },
      },
      required: ["songId"],
    },
  },
  {
    name: "getOverlayData",
    description: "Get overlay configuration and display data for a streamer",
    inputSchema: {
      type: "object",
      properties: {
        streamerName: {
          type: "string",
          description: "The name of the streamer whose overlay data to fetch",
        },
        overlayType: {
          type: "string",
          enum: ["queue", "nowplaying", "history", "stats"],
          description: "Type of overlay data to retrieve (default: queue)",
          default: "queue",
        },
      },
      required: ["streamerName"],
    },
  },
  {
    name: "getStreamStats",
    description: "Get comprehensive streaming statistics and analytics for a streamer",
    inputSchema: {
      type: "object",
      properties: {
        streamerName: {
          type: "string",
          description: "The name of the streamer whose stats to fetch",
        },
        period: {
          type: "string",
          enum: ["day", "week", "month", "year", "all"],
          description: "Time period for statistics (default: week)",
          default: "week",
        },
      },
      required: ["streamerName"],
    },
  },
  {
    name: "manageSongAttributes",
    description: "Get, add, or remove attributes/tags for songs to help with filtering and organization",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["get", "add", "remove", "list"],
          description: "Action to perform on song attributes",
        },
        songId: {
          type: "string",
          description: "The song ID (required for get/add/remove actions)",
        },
        attributeName: {
          type: "string",
          description: "Name of the attribute (required for add/remove actions)",
        },
        attributeValue: {
          type: "string",
          description: "Value of the attribute (optional for add action)",
        },
      },
      required: ["action"],
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
        const { streamerName } = args;
        
        if (!streamerName) {
          throw new Error("streamerName is required");
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
        const { streamerName, limit = 50, offset = 0 } = args;
        
        if (!streamerName) {
          throw new Error("streamerName is required");
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
        const { streamerName } = args;
        
        if (!streamerName) {
          throw new Error("streamerName is required");
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

      case "manageSongRequest": {
        const { action, streamerName, requestId, songTitle, artist, requesterName, message } = args;
        
        if (!action || !streamerName) {
          throw new Error("action and streamerName are required");
        }
        
        try {
          let url;
          let method;
          let body = null;
          
          switch (action) {
            case "create":
              if (!songTitle) {
                return {
                  content: [{
                    type: "text",
                    text: "Error: songTitle is required for creating a request"
                  }]
                };
              }
              url = `https://api.streamersonglist.com/v1/streamers/${encodeURIComponent(streamerName)}/requests`;
              method = "POST";
              body = {
                songTitle,
                artist,
                requesterName,
                message
              };
              break;
            case "update":
              if (!requestId) {
                return {
                  content: [{
                    type: "text",
                    text: "Error: requestId is required for updating a request"
                  }]
                };
              }
              url = `https://api.streamersonglist.com/v1/streamers/${encodeURIComponent(streamerName)}/requests/${requestId}`;
              method = "PUT";
              body = {
                songTitle,
                artist,
                requesterName,
                message
              };
              break;
            case "delete":
              if (!requestId) {
                return {
                  content: [{
                    type: "text",
                    text: "Error: requestId is required for deleting a request"
                  }]
                };
              }
              url = `https://api.streamersonglist.com/v1/streamers/${encodeURIComponent(streamerName)}/requests/${requestId}`;
              method = "DELETE";
              break;
            default:
              throw new Error(`Unknown action: ${action}`);
          }
          
          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : undefined
          });
          
          if (!response.ok) {
            return {
              content: [{
                type: "text",
                text: `Error ${action}ing request: ${response.status} ${response.statusText}`
              }]
            };
          }
          
          const result = action === "delete" ? { success: true } : await response.json();
          return {
            content: [{
              type: "text",
              text: `Successfully ${action}d request:\n${JSON.stringify(result, null, 2)}`
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
        const { streamerName, interval = 30, duration = 300 } = args;
        
        if (!streamerName) {
          throw new Error("streamerName is required");
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

      case "getPlayHistory": {
        const { streamerName, limit = 50, offset = 0, startDate, endDate } = args;
        
        if (!streamerName) {
          throw new Error("streamerName is required");
        }
        
        try {
          let url = `https://api.streamersonglist.com/v1/streamers/${encodeURIComponent(streamerName)}/history?limit=${limit}&offset=${offset}`;
          
          if (startDate) {
            url += `&startDate=${encodeURIComponent(startDate)}`;
          }
          if (endDate) {
            url += `&endDate=${encodeURIComponent(endDate)}`;
          }
          
          const response = await fetch(url);
          
          if (!response.ok) {
            return {
              content: [{
                type: "text",
                text: `Error fetching play history: ${response.status} ${response.statusText}`
              }]
            };
          }
          
          const historyData = await response.json();
          
          return {
            content: [{
              type: "text",
              text: `Play History for ${streamerName}:\n${JSON.stringify(historyData, null, 2)}`
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
        const { query, artist, genre, limit = 50, offset = 0 } = args;
        
        try {
          let url = `https://api.streamersonglist.com/v1/songs?limit=${limit}&offset=${offset}`;
          
          if (query) {
            url += `&q=${encodeURIComponent(query)}`;
          }
          if (artist) {
            url += `&artist=${encodeURIComponent(artist)}`;
          }
          if (genre) {
            url += `&genre=${encodeURIComponent(genre)}`;
          }
          
          const response = await fetch(url);
          
          if (!response.ok) {
            return {
              content: [{
                type: "text",
                text: `Error searching songs: ${response.status} ${response.statusText}`
              }]
            };
          }
          
          const songsData = await response.json();
          
          return {
            content: [{
              type: "text",
              text: `Song Search Results:\n${JSON.stringify(songsData, null, 2)}`
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
        const { songId } = args;
        
        if (!songId) {
          throw new Error("songId is required");
        }
        
        try {
          const response = await fetch(`https://api.streamersonglist.com/v1/songs/${encodeURIComponent(songId)}`);
          
          if (!response.ok) {
            return {
              content: [{
                type: "text",
                text: `Error fetching song details: ${response.status} ${response.statusText}`
              }]
            };
          }
          
          const songData = await response.json();
          
          return {
            content: [{
              type: "text",
              text: `Song Details:\n${JSON.stringify(songData, null, 2)}`
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

      case "getOverlayData": {
        const { streamerName, overlayType = "queue" } = args;
        
        if (!streamerName) {
          throw new Error("streamerName is required");
        }
        
        try {
          const response = await fetch(`https://api.streamersonglist.com/v1/streamers/${encodeURIComponent(streamerName)}/overlay/${overlayType}`);
          
          if (!response.ok) {
            return {
              content: [{
                type: "text",
                text: `Error fetching overlay data: ${response.status} ${response.statusText}`
              }]
            };
          }
          
          const overlayData = await response.json();
          
          return {
            content: [{
              type: "text",
              text: `Overlay Data (${overlayType}) for ${streamerName}:\n${JSON.stringify(overlayData, null, 2)}`
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

      case "getStreamStats": {
        const { streamerName, period = "week" } = args;
        
        if (!streamerName) {
          throw new Error("streamerName is required");
        }
        
        try {
          const response = await fetch(`https://api.streamersonglist.com/v1/streamers/${encodeURIComponent(streamerName)}/stats?period=${period}`);
          
          if (!response.ok) {
            return {
              content: [{
                type: "text",
                text: `Error fetching stream stats: ${response.status} ${response.statusText}`
              }]
            };
          }
          
          const statsData = await response.json();
          
          return {
            content: [{
              type: "text",
              text: `Stream Statistics (${period}) for ${streamerName}:\n${JSON.stringify(statsData, null, 2)}`
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

      case "manageSongAttributes": {
        const { action, songId, attributeName, attributeValue } = args;
        
        if (!action) {
          throw new Error("action is required");
        }
        
        try {
          let url;
          let method;
          let body = null;
          
          switch (action) {
            case "get":
              if (!songId) {
                return {
                  content: [{
                    type: "text",
                    text: "Error: songId is required for getting attributes"
                  }]
                };
              }
              url = `https://api.streamersonglist.com/v1/songs/${encodeURIComponent(songId)}/attributes`;
              method = "GET";
              break;
            case "add":
              if (!songId || !attributeName) {
                return {
                  content: [{
                    type: "text",
                    text: "Error: songId and attributeName are required for adding attributes"
                  }]
                };
              }
              url = `https://api.streamersonglist.com/v1/songs/${encodeURIComponent(songId)}/attributes`;
              method = "POST";
              body = {
                name: attributeName,
                value: attributeValue
              };
              break;
            case "remove":
              if (!songId || !attributeName) {
                return {
                  content: [{
                    type: "text",
                    text: "Error: songId and attributeName are required for removing attributes"
                  }]
                };
              }
              url = `https://api.streamersonglist.com/v1/songs/${encodeURIComponent(songId)}/attributes/${encodeURIComponent(attributeName)}`;
              method = "DELETE";
              break;
            case "list":
              url = `https://api.streamersonglist.com/v1/attributes`;
              method = "GET";
              break;
            default:
              throw new Error(`Unknown action: ${action}`);
          }
          
          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : undefined
          });
          
          if (!response.ok) {
            return {
              content: [{
                type: "text",
                text: `Error ${action}ing song attributes: ${response.status} ${response.statusText}`
              }]
            };
          }
          
          const result = method === "DELETE" ? { success: true } : await response.json();
          return {
            content: [{
              type: "text",
              text: `Successfully ${action}d song attributes:\n${JSON.stringify(result, null, 2)}`
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