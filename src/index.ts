import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  CallToolResult
} from '@modelcontextprotocol/sdk/types.js';
import { z } from "zod";

// Configuration schema for user settings
export const configSchema = z.object({
  defaultStreamer: z.string().optional().describe("Default streamer name to use when not specified"),
  apiBase: z.string().default("https://api.streamersonglist.com/v1").describe("StreamerSongList API base URL"),
});

// Zod schemas for tool arguments
const GetStreamerByNameArgsSchema = z.object({
  streamerName: z.string().optional(),
});

const GetQueueArgsSchema = z.object({
  streamerName: z.string().optional(),
  limit: z.number().optional().default(50),
  offset: z.number().optional().default(0),
});

const MonitorQueueArgsSchema = z.object({
  streamerName: z.string().optional(),
  interval: z.number().optional().default(30),
  duration: z.number().optional().default(300),
});

const GetSongsArgsSchema = z.object({
  streamerName: z.string().optional(),
  limit: z.number().optional().default(100),
  offset: z.number().optional().default(0),
});

const SearchSongsArgsSchema = z.object({
  streamerName: z.string().optional(),
  query: z.string(),
  limit: z.number().optional().default(20),
});

const GetSongDetailsArgsSchema = z.object({
  streamerName: z.string().optional(),
  songId: z.number(),
});

// Required: Export default createServer function
export default function createServer({ config }: { config?: z.infer<typeof configSchema> }) {
  const server = new Server({
    name: "streamersonglist-mcp",
    version: "1.3.1",
  }, {
    capabilities: {
      tools: {},
    },
  });

  // Set configuration defaults
  const apiBase = config?.apiBase || "https://api.streamersonglist.com/v1";
  const defaultStreamer = config?.defaultStreamer || null;

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

  // Register tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools,
  }));

  // Helper function to get effective streamer name
  function getEffectiveStreamer(requestedStreamer?: string): string {
    if (requestedStreamer) return requestedStreamer;
    if (defaultStreamer) return defaultStreamer;
    throw new Error("No streamer specified and no default streamer configured");
  }

  // Helper function to make API requests
  async function makeApiRequest(endpoint: string) {
    const url = `${apiBase}${endpoint}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  // Tool handlers
  server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "getStreamerByName": {
          const { streamerName } = GetStreamerByNameArgsSchema.parse(args ?? {});
          const effectiveStreamer = getEffectiveStreamer(streamerName);
          const data = await makeApiRequest(`/streamers/${encodeURIComponent(effectiveStreamer)}`);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }

        case "getQueue": {
          const { streamerName, limit, offset } = GetQueueArgsSchema.parse(args ?? {});
          const effectiveStreamer = getEffectiveStreamer(streamerName);
          const data = await makeApiRequest(`/streamers/${encodeURIComponent(effectiveStreamer)}/queue?limit=${limit}&offset=${offset}`);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }

        case "monitorQueue": {
          const { streamerName, interval, duration } = MonitorQueueArgsSchema.parse(args ?? {});
          const effectiveStreamer = getEffectiveStreamer(streamerName);
          const intervalMs = interval * 1000; // Convert to milliseconds
          const durationMs = duration * 1000; // Convert to milliseconds
          
          const startTime = Date.now();
          const results: Array<{
            timestamp: string;
            queueLength?: number;
            data?: any;
            error?: string;
          }> = [];
          
          while (Date.now() - startTime < durationMs) {
            try {
              const data = await makeApiRequest(`/streamers/${encodeURIComponent(effectiveStreamer)}/queue`);
              results.push({
                timestamp: new Date().toISOString(),
                queueLength: data.list?.length || 0,
                data: data,
              });
              
              if (Date.now() - startTime + intervalMs < durationMs) {
                await new Promise(resolve => setTimeout(resolve, intervalMs));
              }
            } catch (error: any) {
              results.push({
                timestamp: new Date().toISOString(),
                error: error.message,
              });
              break;
            }
          }
          
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(results, null, 2),
              },
            ],
          };
        }

        case "getSongs": {
          const { streamerName, limit, offset } = GetSongsArgsSchema.parse(args ?? {});
          const effectiveStreamer = getEffectiveStreamer(streamerName);
          const data = await makeApiRequest(`/streamers/${encodeURIComponent(effectiveStreamer)}/songs?limit=${limit}&offset=${offset}`);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }

        case "searchSongs": {
          const { streamerName, query, limit } = SearchSongsArgsSchema.parse(args ?? {});
          const effectiveStreamer = getEffectiveStreamer(streamerName);
          const data = await makeApiRequest(`/streamers/${encodeURIComponent(effectiveStreamer)}/songs?search=${encodeURIComponent(query)}&limit=${limit}`);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }

        case "getSongDetails": {
          const { streamerName, songId } = GetSongDetailsArgsSchema.parse(args ?? {});
          const effectiveStreamer = getEffectiveStreamer(streamerName);
          const data = await makeApiRequest(`/streamers/${encodeURIComponent(effectiveStreamer)}/songs/${songId}`);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server; // Return the Server instance directly
}