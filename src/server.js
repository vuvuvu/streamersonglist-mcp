#!/usr/bin/env node

// Add fetch polyfill for Node.js environments
const { fetch } = require('undici');
globalThis.fetch = fetch;

// Import MCP SDK modules
const mcp = require('@modelcontextprotocol/sdk');
const { Server } = mcp;
const { StdioServerTransport } = mcp;
const { CallToolRequestSchema, ListToolsRequestSchema } = mcp;

// Create the server
const server = new Server(
  {
    name: "streamersonglist-mcp",
    version: "1.0.0",
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
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("StreamerSongList MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});