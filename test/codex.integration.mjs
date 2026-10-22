import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import { spawn, spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { root } from '../scripts/build.mjs';

const source = process.env.VAULT_CLIENT_ROOT;
if (!source || !path.isAbsolute(source)) throw new Error('Set VAULT_CLIENT_ROOT to an absolute Vault client checkout path.');
const { startFixture } = await import(pathToFileURL(path.join(source, 'scripts/mcp-fixture.mjs')));

// app-server invokes MCP directly; this test sends no inference turns and needs
// no model login, live user history, or change to the user's Codex configuration.
for (const existingConnection of [false, true]) {
  test(`Codex native plugin ${existingConnection ? 'preserves existing Vault config' : 'forwards environment and launches MCP'}`, async t => {
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'av-native-codex-'));
    const fixture = await startFixture({ home: path.join(temporary, 'vault') });
    const codexHome = path.join(temporary, 'codex');
    fs.mkdirSync(codexHome);
    const app = path.join(temporary, 'Agent Vault.app');
    const resources = path.join(app, 'Contents/Resources');
    fs.mkdirSync(path.join(resources, 'runtime'), { recursive: true });
    fs.mkdirSync(path.join(resources, 'app'), { recursive: true });
    fs.symlinkSync(process.execPath, path.join(resources, 'runtime/node'));
    fs.symlinkSync(path.join(source, 'src'), path.join(resources, 'app/src'));
    const env = { ...process.env, CODEX_HOME: codexHome,
      VAULT_APP_PATH: app, VAULT_HOME: fixture.home,
      VAULT_MCP_TOKEN: existingConnection ? '' : fixture.tokenFor('codex') };
    for (const args of [['plugin', 'marketplace', 'add', root], ['plugin', 'add', 'agentvault@synnada-agentvault']]) {
      const result = spawnSync('codex', args, { env, encoding: 'utf8', timeout: 30_000 });
      assert.equal(result.status, 0, result.stderr);
    }
    if (existingConnection) {
      fs.appendFileSync(path.join(codexHome, 'config.toml'), [
        '', '[mcp_servers.vault]', `command = ${JSON.stringify(process.execPath)}`,
        `args = [${JSON.stringify(path.join(source, 'src/mcp/server.js'))}]`,
        `env = { VAULT_HOME = ${JSON.stringify(fixture.home)}, VAULT_MCP_TOKEN = ${JSON.stringify(fixture.tokenFor('codex'))}, VAULT_MCP_HARNESS = "codex" }`, '',
      ].join('\n'), { mode: 0o600 });
    }
    const child = spawn('codex', ['app-server'], { cwd: root, env, stdio: ['pipe', 'pipe', 'pipe'] });
    const pending = new Map();
    let id = 0;
    // Deliberately don't print child logs: a future host may include launch env.
    child.stderr.resume();
    const lines = readline.createInterface({ input: child.stdout });
    lines.on('line', line => {
      let response;
      try { response = JSON.parse(line); } catch { return; }
      const request = pending.get(response.id);
      if (!request) return;
      clearTimeout(request.timer);
      pending.delete(response.id);
      if (response.error) request.reject(new Error(response.error.message));
      else request.resolve(response.result);
    });
    t.after(async () => {
      for (const request of pending.values()) clearTimeout(request.timer);
      child.stdin.end();
      if (child.exitCode === null && child.signalCode === null) {
        const exit = new Promise(resolve => child.once('exit', resolve));
        child.kill('SIGTERM');
        await exit;
      }
      lines.close();
      await fixture.close();
      fs.rmSync(temporary, { recursive: true, force: true });
    });
    function call(method, params) {
      const next = ++id;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => { pending.delete(next); reject(new Error(`${method} timed out`)); }, 20_000);
        pending.set(next, { resolve, reject, timer });
        child.stdin.write(JSON.stringify({ id: next, method, params }) + '\n');
      });
    }
    await call('initialize', { clientInfo: { name: 'agentvault_plugin_test', version: '0.1.0' }, capabilities: { experimentalApi: true } });
    child.stdin.write(JSON.stringify({ method: 'initialized' }) + '\n');
    const details = await call('plugin/read', { marketplacePath: path.join(root, '.agents/plugins/marketplace.json'), pluginName: 'agentvault' });
    assert.equal(details.plugin.skills.length, 1);
    const thread = await call('thread/start', { cwd: temporary, ephemeral: true });
    const threadId = thread.thread.id;
    const status = await call('mcpServerStatus/list', { threadId });
    const vault = status.data.find(server => server.name === 'vault');
    assert.equal(vault?.runtimeStatus, 'connected');
    assert.equal(vault.pluginId, existingConnection ? null : 'agentvault@synnada-agentvault');
    const invoke = (tool, args) => call('mcpServer/tool/call', { threadId, server: 'vault', tool, arguments: args });
    const search = await invoke('search_sessions', { query: 'token', limit: 5 });
    const hit = search.structuredContent.results[0];
    assert.ok(hit);
    const session = await invoke('get_session', { session_id: hit.session_id, revision: hit.revision });
    assert.equal(session.structuredContent.revision, hit.revision);
    assert.equal(fixture.state.last.harness, 'codex');
    fixture.revoke('codex');
    const denied = await invoke('get_session', { session_id: hit.session_id, revision: hit.revision }).catch(error => error);
    assert.match(JSON.stringify(denied instanceof Error ? denied.message : denied), /revoked/i);
  });
}
