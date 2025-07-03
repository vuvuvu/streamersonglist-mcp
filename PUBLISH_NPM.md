# Publishing to npm

This guide explains how to publish the StreamerSongList MCP Server to npm, enabling users to run it with `npx streamersonglist-mcp`.

## Prerequisites

1. **npm account** - Sign up at https://www.npmjs.com
2. **npm CLI** - Should be installed with Node.js
3. **Package ready** - All files configured for npm publishing

## Step 1: Login to npm

```bash
npm login
```

Enter your npm username, password, and email when prompted.

## Step 2: Verify Package Configuration

Check that your package.json is properly configured:

```bash
npm pack --dry-run
```

This shows what files will be included in the package.

## Step 3: Test Locally

Test the package locally before publishing:

```bash
# Create a test package
npm pack

# Install it globally for testing
npm install -g streamersonglist-mcp-1.0.1.tgz

# Test npx command
npx streamersonglist-mcp

# Clean up
npm uninstall -g streamersonglist-mcp
rm streamersonglist-mcp-1.0.1.tgz
```

## Step 4: Publish to npm

```bash
npm publish
```

## Step 5: Verify Publication

After publishing, verify it works:

```bash
# Test npx command (should download from npm)
npx streamersonglist-mcp@latest
```

## Step 6: Update Documentation

Once published, users can install with:

```bash
# No installation needed - just use npx
npx streamersonglist-mcp

# Or install globally
npm install -g streamersonglist-mcp
streamersonglist-mcp
```

## Claude Desktop Configuration

After publishing, users can configure Claude Desktop with:

```json
{
  "mcpServers": {
    "streamersonglist": {
      "command": "npx",
      "args": ["streamersonglist-mcp"]
    }
  }
}
```

## Version Updates

To publish updates:

1. **Update version in package.json**:
   ```bash
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```

2. **Publish the update**:
   ```bash
   npm publish
   ```

3. **Create GitHub release**:
   ```bash
   git push --tags
   gh release create v1.0.2 --title "Version 1.0.2" --notes "Bug fixes and improvements"
   ```

## Benefits of npm Publishing

### For Users:
- ✅ **No cloning required** - Just use `npx streamersonglist-mcp`
- ✅ **Always latest version** - npx downloads the newest version
- ✅ **Simpler Claude config** - No need to specify file paths
- ✅ **Cross-platform** - Works the same on all operating systems

### For Developers:
- ✅ **Easy distribution** - Users can install with one command
- ✅ **Version management** - npm handles versioning automatically
- ✅ **Usage analytics** - See download statistics
- ✅ **Dependency management** - npm installs dependencies automatically

## Package Information

- **Package name**: `streamersonglist-mcp`
- **Current version**: `1.0.1`
- **License**: MIT
- **Files included**: `src/`, `README.md`, `LICENSE`, `INSTALL.md`
- **Dependencies**: `@modelcontextprotocol/sdk`, `undici`

## Troubleshooting

### Package name already exists
If the package name is taken, you can:
1. Choose a different name (e.g., `@yourusername/streamersonglist-mcp`)
2. Use a scoped package name

### Permission errors
Make sure you're logged in to npm:
```bash
npm whoami  # Should show your username
```

### Version conflicts
If the version already exists:
```bash
npm version patch  # Increment version
npm publish
```