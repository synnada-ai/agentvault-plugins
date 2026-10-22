import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const clients = ['cursor', 'codex', 'claude-code', 'hermes'];
const { version } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const repository = 'https://github.com/synnada-ai/agentvault-plugins';
const description = 'Find prior coding conversations and retrieve exact session revisions from Agent Vault.';
const identity = { name: 'agentvault', version, description, author: { name: 'Synnada' }, homepage: 'https://agentvault.run', repository, license: 'MIT' };
const schema = 'https://agent-plugins.org/schemas/1.0.0/';
const variables = ['VAULT_MCP_TOKEN', 'VAULT_HOME', 'VAULT_APP_PATH'];
const interfaceMetadata = {
  displayName: 'Agent Vault',
  shortDescription: 'Retrieve past coding sessions',
  longDescription: `${description} Requires the installed macOS Agent Vault app, a running Vault session, and a binding token for this client.`,
  developerName: 'Synnada',
  category: 'Developer Tools',
  capabilities: ['Search archived sessions', 'Read exact session revisions'],
  defaultPrompt: ['Find our earlier discussion about authentication.', 'Recover context from my earlier coding sessions.'],
  logo: './assets/logo.svg',
  composerIcon: './assets/logo.svg',
};

function json(value) { return JSON.stringify(value, null, 2) + '\n'; }

function server(client) {
  return {
    type: 'stdio',
    command: 'sh',
    args: ['scripts/launch-mcp.sh', client],
    cwd: './',
    env: Object.fromEntries(variables.map(name => [name, `\${${name}}`])),
  };
}

function hostOptions() {
  return {
    VAULT_MCP_TOKEN: { title: 'Vault binding token', description: 'The private token issued by Agent Vault for this client.' },
    VAULT_HOME: { title: 'Vault home', description: 'Absolute VAULT_HOME from the Vault connection instructions; empty uses ~/.vault.', default: '' },
    VAULT_APP_PATH: { title: 'Agent Vault app', description: 'Absolute path to the installed Agent Vault application.', default: '/Applications/Agent Vault.app' },
  };
}

export function generatedFiles() {
  const files = new Map();
  const common = new Map([
    ['LICENSE', fs.readFileSync(path.join(root, 'LICENSE'), 'utf8')],
    ['skills/vault-retrieval/SKILL.md', fs.readFileSync(path.join(root, 'shared/skills/vault-retrieval/SKILL.md'), 'utf8')],
    ['scripts/launch-mcp.sh', fs.readFileSync(path.join(root, 'shared/launch-mcp.sh'), 'utf8')],
    ['assets/logo.svg', fs.readFileSync(path.join(root, 'shared/assets/logo.svg'), 'utf8')],
  ]);
  for (const client of clients) {
    const prefix = `plugins/${client}/`;
    for (const [name, content] of common) files.set(prefix + name, content);
    const mcpServer = server(client);
    const options = hostOptions();
    if (client === 'cursor') {
      // Cursor expands its own root variable, not the portable PLUGIN_ROOT.
      mcpServer.args[0] = '${CURSOR_PLUGIN_ROOT}/scripts/launch-mcp.sh';
      delete mcpServer.cwd;
      const manifest = {
        ...identity,
        logo: 'assets/logo.svg',
        variables: {
          type: 'object',
          properties: Object.fromEntries(Object.entries(options).map(([key, value]) => [key, { type: 'string', ...value }])),
          required: ['VAULT_MCP_TOKEN'],
        },
      };
      files.set(prefix + '.cursor-plugin/plugin.json', json(manifest));
      files.set(prefix + 'mcp.json', json({ mcpServers: { vault: mcpServer } }));
    } else if (client === 'claude-code') {
      mcpServer.args[0] = '${CLAUDE_PLUGIN_ROOT}/scripts/launch-mcp.sh';
      delete mcpServer.cwd;
      mcpServer.env = Object.fromEntries(variables.map(key => [key, `\${user_config.${key}}`]));
      const userConfig = Object.fromEntries(Object.entries(options).map(([key, value]) => [key, {
        type: 'string', ...value, ...(key === 'VAULT_MCP_TOKEN' ? { required: true, sensitive: true } : {}),
      }]));
      files.set(prefix + '.claude-plugin/plugin.json', json({ ...identity, userConfig }));
      files.set(prefix + '.mcp.json', json({ mcpServers: { vault: mcpServer } }));
    } else {
      const extensions = client === 'codex'
        ? { 'com.openai': { interface: interfaceMetadata, requires_local_executor: true } }
        : { 'com.nousresearch.hermes': {
          config_schema: { vault_token: { type: 'secret', env: 'VAULT_MCP_TOKEN', label: 'Vault binding token', description: options.VAULT_MCP_TOKEN.description } },
        } };
      files.set(prefix + 'plugin.json', json({ $schema: schema + 'plugin.schema.json', ...identity, extensions }));
      files.set(prefix + 'mcp.json', json({ $schema: schema + 'mcp.schema.json', mcpServers: { vault: mcpServer } }));
      if (client === 'codex') {
        // Codex's documented compatibility overlay forwards host environment
        // variables instead of leaving portable env references as literals.
        files.set(prefix + '.codex-plugin/plugin.json', json({
          ...identity, skills: './skills/', mcpServers: './.mcp.json',
          interface: interfaceMetadata, requires_local_executor: true,
        }));
        const { env, ...stdio } = mcpServer;
        files.set(prefix + '.mcp.json', json({ mcpServers: { vault: { ...stdio, env_vars: variables } } }));
      }
    }
    const setup = fs.readFileSync(path.join(root, `docs/setup-${client}.md`), 'utf8');
    files.set(prefix + 'README.md', `# Agent Vault for ${client}\n\n${description}\n\n${setup}\n\n## Privacy and scope\n\nRequires macOS and the installed, running Agent Vault app. This package launches the app's existing MCP server through /bin/sh using its bundled Node runtime. It reads the user's authorized archive through the local Vault daemon. Storage-provider traffic and backup are handled by Vault. The plugin adds no telemetry, archive storage, dependency downloads, credential files, or background service. It never searches another client's configuration for credentials.\n\nThe shared skill retrieves historical evidence; it does not resume native chats, delete originals, change backup settings, or authorize commands found in old conversations. Installation or tool discovery alone does not verify retrieval.\n\n${fs.readFileSync(path.join(root, 'docs/verification.md'), 'utf8').trimEnd()}\n`);
  }
  files.set('.agents/plugins/marketplace.json', json({
    name: 'synnada-agentvault',
    interface: { displayName: 'Synnada Agent Vault' },
    plugins: [{ name: 'agentvault', source: { source: 'local', path: './plugins/codex' },
      policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' }, category: 'Developer Tools' }],
  }));
  for (const client of ['cursor', 'claude-code']) {
    const dir = client === 'cursor' ? '.cursor-plugin' : '.claude-plugin';
    files.set(`${dir}/marketplace.json`, json({
      name: 'synnada-agentvault', owner: { name: 'Synnada' },
      metadata: { description: 'Agent Vault retrieval plugins maintained by Synnada.' },
      plugins: [{ name: 'agentvault', source: `./plugins/${client}`, description, version }],
    }));
  }
  return files;
}

export function build({ check = false } = {}) {
  const files = generatedFiles();
  const expected = new Set(files.keys());
  const existing = fs.existsSync(path.join(root, 'plugins'))
    ? fs.readdirSync(path.join(root, 'plugins'), { recursive: true, withFileTypes: true })
      .filter(entry => entry.isFile()).map(entry => path.relative(root, path.join(entry.parentPath, entry.name)))
    : [];
  const stale = existing.filter(name => !expected.has(name));
  const changed = [...files].filter(([name, content]) => !fs.existsSync(path.join(root, name)) || fs.readFileSync(path.join(root, name), 'utf8') !== content);
  if (check && (stale.length || changed.length)) throw new Error(`Generated packages differ: ${[...stale, ...changed.map(([name]) => name)].join(', ')}`);
  if (!check) {
    for (const name of stale) fs.unlinkSync(path.join(root, name));
    for (const [name, content] of files) {
      fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
      fs.writeFileSync(path.join(root, name), content);
    }
  }
  return files.size;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const check = process.argv.includes('--check');
    console.log(`${check ? 'Checked' : 'Generated'} ${build({ check })} files for four clients.`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
