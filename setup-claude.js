#!/usr/bin/env node

/**
 * Setup script for Claude Desktop integration
 * Automatically adds the StreamerSongList MCP server to Claude Desktop configuration
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

function setupClaudeDesktop() {
  console.log('🔧 Setting up StreamerSongList MCP Server for Claude Desktop...\n');

  // Determine config path based on OS
  let configPath;
  const platform = os.platform();
  
  if (platform === 'darwin') {
    // macOS
    configPath = path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  } else if (platform === 'win32') {
    // Windows
    configPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
  } else {
    console.log('❌ Unsupported operating system. Please manually configure Claude Desktop.');
    console.log('📋 Add this to your Claude Desktop config:');
    console.log(JSON.stringify({
      mcpServers: {
        streamersonglist: {
          command: "node",
          args: ["src/server.js"],
          cwd: process.cwd()
        }
      }
    }, null, 2));
    return;
  }

  console.log('📍 Claude Desktop config path:', configPath);

  // Check if Claude Desktop is installed
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    console.log('❌ Claude Desktop not found. Please install Claude Desktop first:');
    console.log('   https://claude.ai/download');
    return;
  }

  // Read or create config
  let config = {};
  if (fs.existsSync(configPath)) {
    try {
      const configContent = fs.readFileSync(configPath, 'utf8');
      config = JSON.parse(configContent);
      console.log('✅ Found existing Claude Desktop config');
      
      // Create backup
      const backupPath = configPath + '.backup.' + Date.now();
      fs.writeFileSync(backupPath, configContent);
      console.log('💾 Created backup:', backupPath);
    } catch (error) {
      console.log('⚠️  Error reading existing config:', error.message);
      console.log('📝 Creating new config...');
    }
  } else {
    console.log('📝 Creating new Claude Desktop config...');
  }

  // Ensure mcpServers exists
  if (!config.mcpServers) {
    config.mcpServers = {};
  }

  // Add StreamerSongList server
  config.mcpServers.streamersonglist = {
    command: "npx",
    args: ["streamersonglist-mcp"]
  };

  // Write updated config
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✅ Successfully added StreamerSongList MCP server to Claude Desktop!');
    console.log('\n📋 Configuration added:');
    console.log('   Server name: streamersonglist');
    console.log('   Command: npx streamersonglist-mcp');
    console.log('   Note: This will automatically download and run the latest version');
    
    console.log('\n🔄 Next steps:');
    console.log('1. Restart Claude Desktop completely');
    console.log('2. Test with: "Use the getStreamerByName tool to get info about a streamer"');
    console.log('3. Available tools: getStreamerByName, getQueue, getQueueStats, manageSongRequest, monitorQueue');
    
  } catch (error) {
    console.log('❌ Error writing config:', error.message);
    console.log('\n📋 Manual setup required. Add this to your Claude Desktop config:');
    console.log(JSON.stringify({
      mcpServers: {
        streamersonglist: {
          command: "node",
          args: ["src/server.js"],
          cwd: currentDir
        }
      }
    }, null, 2));
  }
}

// Run setup
setupClaudeDesktop();