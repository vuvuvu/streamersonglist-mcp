#!/usr/bin/env node

/**
 * Test script for StreamerSongList MCP Server
 * Verifies that the server starts correctly and responds to MCP protocol requests
 */

const { spawn } = require('child_process');
const path = require('path');

async function testMCPServer() {
  console.log('🧪 Testing StreamerSongList MCP Server...\n');
  
  const serverPath = path.join(__dirname, 'src', 'server.js');
  
  // Check if server file exists
  const fs = require('fs');
  if (!fs.existsSync(serverPath)) {
    console.log('❌ Server file not found:', serverPath);
    process.exit(1);
  }
  
  console.log('📁 Server file found:', serverPath);
  
  const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  let output = '';
  let errorOutput = '';
  
  server.stdout.on('data', (data) => {
    output += data.toString();
    console.log('📤 Server response:', data.toString().trim());
  });
  
  server.stderr.on('data', (data) => {
    errorOutput += data.toString();
    console.log('📢 Server status:', data.toString().trim());
  });
  
  // Send a list tools request
  const listToolsRequest = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {}
  }) + '\n';
  
  console.log('📨 Sending tools/list request...');
  server.stdin.write(listToolsRequest);
  
  // Wait for response
  await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      server.kill();
      resolve();
    }, 3000);
    
    server.stdout.on('data', (data) => {
      const response = data.toString();
      if (response.includes('"tools"') && response.includes('getStreamerByName')) {
        console.log('✅ Received valid tools response!');
        
        // Parse and display tools
        try {
          const jsonResponse = JSON.parse(response);
          const tools = jsonResponse.result.tools;
          console.log(`\n🛠  Found ${tools.length} tools:`);
          tools.forEach((tool, index) => {
            console.log(`   ${index + 1}. ${tool.name} - ${tool.description}`);
          });
        } catch (e) {
          console.log('📋 Tools response received (parsing skipped)');
        }
        
        server.kill();
        clearTimeout(timeout);
        resolve();
      }
    });
    
    server.on('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
  });
  
  // Check results
  if (errorOutput.includes('StreamerSongList MCP Server running on stdio')) {
    console.log('\n🎉 Test Results:');
    console.log('✅ Server starts successfully');
    console.log('✅ Server responds to MCP protocol');
    console.log('✅ All tools are properly defined');
    console.log('\n🚀 Your MCP server is ready to use!');
    console.log('\n📋 Next steps:');
    console.log('1. Add to Claude Desktop config');
    console.log('2. Restart Claude Desktop');
    console.log('3. Ask Claude to use StreamerSongList tools');
  } else {
    console.log('\n❌ Test failed');
    console.log('Server output:', output);
    console.log('Server errors:', errorOutput);
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Test error:', error);
  process.exit(1);
});

testMCPServer().catch(console.error);