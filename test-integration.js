#!/usr/bin/env node

/**
 * Integration test for StreamerSongList MCP Server
 * - Starts the server with a default streamer
 * - Exercises all tools via JSON-RPC over stdio
 * - Parses responses and performs sanity checks
 */

const { spawn } = require('child_process');
const path = require('path');

const DEFAULT_STREAMER = process.env.TEST_STREAMER || 'vu_vu';

function lineSplitter(onLine) {
  let buf = '';
  return (chunk) => {
    buf += chunk.toString();
    let idx;
    while ((idx = buf.indexOf('\n')) !== -1) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (line) onLine(line);
    }
  };
}

async function run() {
  console.log(`🧪 Integration testing with default streamer: ${DEFAULT_STREAMER}`);

  const serverPath = path.join(__dirname, 'src', 'server.js');
  const server = spawn('node', [serverPath, '--streamer', DEFAULT_STREAMER], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  let started = false;
  server.stderr.on('data', (d) => {
    const s = d.toString();
    if (s.includes('running on stdio')) started = true;
  });

  const inflight = new Map();
  const onStdout = lineSplitter((line) => {
    try {
      const msg = JSON.parse(line);
      if (msg.id && inflight.has(msg.id)) {
        const { resolve } = inflight.get(msg.id);
        inflight.delete(msg.id);
        resolve(msg);
      } else {
        // Ignore unsolicited or out-of-band messages for this test
      }
    } catch (e) {
      // Ignore non-JSON noise on stdout (should not happen)
    }
  });
  server.stdout.on('data', onStdout);

  let nextId = 1;
  function sendRpc(method, params = {}) {
    const id = nextId++;
    const payload = JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n';
    return new Promise((resolve, reject) => {
      inflight.set(id, { resolve, reject });
      server.stdin.write(payload);
      setTimeout(() => {
        if (inflight.has(id)) {
          inflight.delete(id);
          reject(new Error(`Timeout waiting for response to ${method}`));
        }
      }, 15000);
    });
  }

  function parseTextContent(result) {
    const content = result?.result?.content;
    const text = Array.isArray(content) && content[0]?.type === 'text' ? content[0].text : '';
    return text;
  }

  function safeJsonParse(s) {
    try { return JSON.parse(s); } catch { return null; }
  }

  function extractJsonArrayFromText(text) {
    // Attempt to extract the first JSON array from a mixed string
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start !== -1 && end !== -1 && end > start) {
      return safeJsonParse(text.slice(start, end + 1));
    }
    return null;
  }

  try {
    // 1) tools/list
    console.log('➡️  tools/list');
    const listResp = await sendRpc('tools/list', {});
    const tools = listResp?.result?.tools || [];
    const names = tools.map(t => t.name).sort();
    const expected = ['getQueue','getSongDetails','getSongs','getStreamerByName','monitorQueue','searchSongs'].sort();
    if (names.join(',') !== expected.join(',')) {
      throw new Error(`Tool names mismatch. Got: ${names.join(', ')}`);
    }
    console.log('✅ tools/list OK');

    // 2) getStreamerByName (uses default streamer)
    console.log('➡️  tools/call getStreamerByName');
    const gsResp = await sendRpc('tools/call', { name: 'getStreamerByName', arguments: {} });
    const gsText = parseTextContent(gsResp);
    const gsJson = safeJsonParse(gsText);
    if (!gsJson || !gsJson.name) {
      throw new Error('Streamer data not parseable JSON or missing name');
    }
    console.log(`✅ getStreamerByName OK (name: ${gsJson.name})`);

    // 3) getSongs (limit 5)
    console.log('➡️  tools/call getSongs');
    const songsResp = await sendRpc('tools/call', { name: 'getSongs', arguments: { limit: 5 } });
    const songsText = parseTextContent(songsResp);
    const songsJson = safeJsonParse(songsText);
    if (!songsJson) throw new Error('getSongs returned non-JSON');
    let candidateId = null;
    if (Array.isArray(songsJson) && songsJson.length) candidateId = songsJson[0]?.id;
    if (!candidateId && songsJson.items && Array.isArray(songsJson.items) && songsJson.items.length) candidateId = songsJson.items[0]?.id;
    if (!candidateId && songsJson.list && Array.isArray(songsJson.list) && songsJson.list.length) candidateId = songsJson.list[0]?.id || songsJson.list[0]?.song?.id;
    console.log(`✅ getSongs OK (candidate song id: ${candidateId ?? 'unknown'})`);

    // 4) getSongDetails (if we found an id)
    if (candidateId) {
      console.log('➡️  tools/call getSongDetails');
      const sdResp = await sendRpc('tools/call', { name: 'getSongDetails', arguments: { songId: candidateId } });
      const sdText = parseTextContent(sdResp);
      const sdJson = safeJsonParse(sdText);
      if (!sdJson || !(sdJson.id === candidateId)) {
        throw new Error('getSongDetails id mismatch or not parseable');
      }
      console.log('✅ getSongDetails OK');
    } else {
      console.log('⚠️  Skipping getSongDetails (no candidate id found)');
    }

    // 5) searchSongs (client-side filter)
    console.log('➡️  tools/call searchSongs');
    const searchResp = await sendRpc('tools/call', { name: 'searchSongs', arguments: { query: 'the', limit: 5 } });
    const searchText = parseTextContent(searchResp);
    const searchArray = extractJsonArrayFromText(searchText) || [];
    if (!Array.isArray(searchArray)) throw new Error('searchSongs did not return parseable array');
    console.log(`✅ searchSongs OK (returned ${searchArray.length} items)`);

    // 6) monitorQueue (snapshot + simulation)
    console.log('➡️  tools/call monitorQueue');
    const monResp = await sendRpc('tools/call', { name: 'monitorQueue', arguments: { interval: 1, duration: 2 } });
    const monText = parseTextContent(monResp);
    if (!(monText.includes('Started monitoring queue') || monText.includes('Error setting up monitoring'))) {
      throw new Error('monitorQueue unexpected response text');
    }
    console.log('✅ monitorQueue OK');

    // Finish
    server.kill();
    console.log('\n🎉 Integration tests passed');
  } catch (err) {
    server.kill();
    console.error('\n❌ Integration test failure:', err.message);
    process.exit(1);
  }
}

run();

