import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { clients, root } from '../scripts/build.mjs';

const source = process.env.VAULT_CLIENT_ROOT;
if (!source || !path.isAbsolute(source)) throw new Error('Set VAULT_CLIENT_ROOT to an absolute Vault client checkout path. This test never uses your real archive.');
const { startFixture } = await import(pathToFileURL(path.join(source, 'scripts/mcp-fixture.mjs')));
const { createMcpClient } = await import(pathToFileURL(path.join(source, 'src/mcp/client.js')));

test('each package runs the existing Vault server: search, pinned reads, paging, revocation', async t => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'av-plugin-ipc-'));
  const fixture = await startFixture({ home: path.join(temp, 'vault') });
  t.after(async () => { await fixture.close(); fs.rmSync(temp, { recursive: true, force: true }); });
  const app = path.join(temp, 'Agent Vault integration.app');
  const resources = path.join(app, 'Contents/Resources');
  fs.mkdirSync(path.join(resources, 'runtime'), { recursive: true });
  fs.mkdirSync(path.join(resources, 'app'), { recursive: true });
  // The test app points to the existing server and runtime; packages themselves
  // contain no symlinks or private client source.
  fs.symlinkSync(process.execPath, path.join(resources, 'runtime/node'));
  fs.symlinkSync(path.join(source, 'src'), path.join(resources, 'app/src'));
  for (const harness of clients) {
    await t.test(harness, async t => {
      const directory = path.join(root, 'plugins', harness);
      const configFile = harness === 'claude-code' ? '.mcp.json' : 'mcp.json';
      const config = JSON.parse(fs.readFileSync(path.join(directory, configFile), 'utf8')).mcpServers.vault;
      const args = config.args.map(arg => arg.replaceAll('${CURSOR_PLUGIN_ROOT}', directory).replaceAll('${CLAUDE_PLUGIN_ROOT}', directory));
      const client = createMcpClient({ command: config.command, args, cwd: directory,
        env: { ...process.env, VAULT_APP_PATH: app }, home: fixture.home,
        token: fixture.tokenFor(harness), protocolVersion: '2025-06-18' });
      t.after(() => client.close());
      await client.initialize();
      const tools = await client.listTools();
      assert.deepEqual(tools.map(tool => tool.name).sort(), ['get_session', 'search_sessions']);
      const search = await client.callTool('search_sessions', { query: 'token', limit: 5 });
      const data = search.structuredContent ?? JSON.parse(search.content[0].text);
      assert.ok(data.results.length > 0);
      const hit = data.results[0];
      // The archived harness differs from several callers: no implicit filter.
      assert.equal(hit.harness, 'codex');
      const read = await client.callTool('get_session', { session_id: hit.session_id, revision: hit.revision });
      const session = read.structuredContent ?? JSON.parse(read.content[0].text);
      assert.equal(session.revision, hit.revision);
      assert.equal(session.session_id, hit.session_id);
      assert.equal(session.pinned_uri, hit.pinned_uri);
      const history = await client.callTool('search_sessions', { query: 'token', history: true, limit: 1 });
      const page = history.structuredContent ?? JSON.parse(history.content[0].text);
      assert.ok(page.next_cursor);
      const next = await client.callTool('search_sessions', { query: 'token', history: true, limit: 1, cursor: page.next_cursor });
      const nextPage = next.structuredContent ?? JSON.parse(next.content[0].text);
      assert.notEqual(nextPage.results[0].revision, page.results[0].revision);
      const older = nextPage.results[0];
      const oldRead = await client.callToolJson('get_session', { session_id: older.session_id, revision: older.revision });
      assert.ok(oldRead.continuation.next_cursor);
      const continued = await client.callToolJson('get_session', { session_id: older.session_id, revision: older.revision, cursor: oldRead.continuation.next_cursor });
      assert.equal(continued.revision, older.revision);
      assert.notDeepEqual(continued.messages, oldRead.messages);
      await assert.rejects(client.callTool('get_session', { session_id: hit.session_id }), /revision/i);
      fixture.revoke(harness);
      await assert.rejects(client.callTool('get_session', { session_id: hit.session_id, revision: hit.revision }), /revoked/i);
    });
  }
});
