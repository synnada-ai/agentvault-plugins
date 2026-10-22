import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { build, clients, generatedFiles, root } from '../scripts/build.mjs';

const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const json = name => JSON.parse(read(name));

test('all four committed packages are current and self-contained', () => {
  build({ check: true });
  for (const client of clients) {
    assert.equal(read(`plugins/${client}/skills/vault-retrieval/SKILL.md`), read('shared/skills/vault-retrieval/SKILL.md'));
    assert.equal(read(`plugins/${client}/scripts/launch-mcp.sh`), read('shared/launch-mcp.sh'));
    for (const entry of fs.readdirSync(path.join(root, 'plugins', client), { recursive: true, withFileTypes: true })) {
      assert.equal(entry.isSymbolicLink(), false, `${client}/${entry.name} must not link outside the package`);
    }
  }
});

test('native host configuration routes credentials through the intended host', () => {
  const cursor = json('plugins/cursor/.cursor-plugin/plugin.json');
  assert.deepEqual(cursor.variables.required, ['VAULT_MCP_TOKEN']);
  const cmcp = json('plugins/cursor/mcp.json').mcpServers.vault;
  assert.deepEqual(cmcp.args, ['${CURSOR_PLUGIN_ROOT}/scripts/launch-mcp.sh', 'cursor']);
  const claude = json('plugins/claude-code/.claude-plugin/plugin.json');
  assert.equal(claude.userConfig.VAULT_MCP_TOKEN.sensitive, true);
  const amcp = json('plugins/claude-code/.mcp.json').mcpServers.vault;
  assert.equal(amcp.env.VAULT_MCP_TOKEN, '${user_config.VAULT_MCP_TOKEN}');
  assert.equal(amcp.args.at(-1), 'claude-code');
  const codex = json('plugins/codex/.mcp.json').mcpServers.vault;
  assert.deepEqual(codex.env_vars, ['VAULT_MCP_TOKEN', 'VAULT_HOME', 'VAULT_APP_PATH']);
  assert.equal(Object.hasOwn(codex, 'env'), false);
  const hermes = json('plugins/hermes/plugin.json').extensions['com.nousresearch.hermes'];
  assert.equal(hermes.config_schema.vault_token.type, 'secret');
  assert.equal(hermes.config_schema.vault_token.env, 'VAULT_MCP_TOKEN');
  // Hermes 0.22.4 selects YAML before portable JSON; a YAML catalog shim
  // incorrectly turns a loadable portable package into an unloadable native one.
  assert.equal(fs.existsSync(path.join(root, 'plugins/hermes/plugin.yaml')), false);
});

test('portable package fields match the fixed discovery contract', () => {
  for (const client of ['codex', 'hermes']) {
    const manifest = json(`plugins/${client}/plugin.json`);
    assert.equal(manifest.$schema, 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
    assert.equal(manifest.name, 'agentvault');
    assert.equal(Object.hasOwn(manifest, 'mcpServers'), false);
    const mcp = json(`plugins/${client}/mcp.json`);
    assert.equal(mcp.$schema, 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json');
    assert.deepEqual(Object.keys(mcp.mcpServers), ['vault']);
    assert.equal(mcp.mcpServers.vault.type, 'stdio');
    assert.equal(mcp.mcpServers.vault.command, 'sh');
    assert.deepEqual(mcp.mcpServers.vault.args, ['scripts/launch-mcp.sh', client]);
    assert.equal(mcp.mcpServers.vault.cwd, './');
  }
});

test('marketplaces point to each host package, and generated files contain no tokens', () => {
  const expected = {
    '.cursor-plugin/marketplace.json': './plugins/cursor',
    '.claude-plugin/marketplace.json': './plugins/claude-code',
    '.agents/plugins/marketplace.json': './plugins/codex',
  };
  for (const [name, target] of Object.entries(expected)) {
    const manifest = json(name);
    assert.equal(manifest.name, 'synnada-agentvault');
    const source = manifest.plugins[0].source;
    assert.equal(typeof source === 'string' ? source : source.path, target);
  }
  for (const [name, content] of generatedFiles()) {
    assert.doesNotMatch(content, /\b[0-9a-f]{64}\b/i, `unexpected token-shaped value in ${name}`);
  }
});

function launch(t, { token = 'a'.repeat(64), harness = 'cursor', home, appMissing = false } = {}) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'av-plugin-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const app = path.join(temp, "Application with spaces ' $ and ;.app");
  const resources = path.join(app, 'Contents/Resources');
  fs.mkdirSync(path.join(resources, 'runtime'), { recursive: true });
  fs.mkdirSync(path.join(resources, 'app/src/mcp'), { recursive: true });
  // A readable script, rather than a copied runtime, verifies the exec argv.
  fs.writeFileSync(path.join(resources, 'runtime/node'), '#!/bin/sh\n[ "$#" -eq 1 ] || exit 9\n[ "$VAULT_MCP_HARNESS" = "cursor" ] || exit 10\nprintf "runtime-called\\n"\n', { mode: 0o700 });
  fs.writeFileSync(path.join(resources, 'app/src/mcp/server.js'), 'fixture');
  const env = { ...process.env, VAULT_APP_PATH: appMissing ? path.join(temp, 'missing.app') : app,
    VAULT_MCP_TOKEN: token, VAULT_MCP_HARNESS: 'codex', VAULT_HOME: home ?? '' };
  return spawnSync('/bin/sh', [path.join(root, 'shared/launch-mcp.sh'), harness], { env, encoding: 'utf8' });
}

test('launcher preserves paths with shell metacharacters and fixes caller identity', t => {
  const result = launch(t);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'runtime-called\n');
});

test('launcher rejects missing/invalid credentials without stdout or token disclosure', t => {
  for (const token of ['', 'secret-do-not-print', '${VAULT_MCP_TOKEN}', 'a'.repeat(63), 'a'.repeat(65)]) {
    const result = launch(t, { token });
    assert.notEqual(result.status, 0);
    assert.equal(result.stdout, '');
    if (token) assert.equal(result.stderr.includes(token), false);
  }
});

test('launcher rejects invalid identity, relative vault home, and missing app', t => {
  for (const opts of [{ harness: 'other' }, { home: '~/.vault' }, { appMissing: true }]) {
    const result = launch(t, opts);
    assert.notEqual(result.status, 0);
    assert.equal(result.stdout, '');
  }
});

test('all JavaScript and shell entrypoints pass syntax checks', () => {
  for (const directory of ['scripts', 'test']) {
    for (const name of fs.readdirSync(path.join(root, directory)).filter(name => name.endsWith('.mjs'))) {
      const result = spawnSync(process.execPath, ['--check', path.join(root, directory, name)], { encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
    }
  }
  const result = spawnSync('/bin/sh', ['-n', path.join(root, 'shared/launch-mcp.sh')], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});
