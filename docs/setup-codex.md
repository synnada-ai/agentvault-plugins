## Install and connect

1. Install and open Agent Vault, complete its setup/backup/index, then connect
   **Codex** in Vault's MCP connections. Use the token and absolute `VAULT_HOME`
   from those instructions. Reconnecting rotates the existing Codex binding.
2. From a checkout of this repository, run:

   ```sh
   codex plugin marketplace add .
   codex plugin add agentvault@synnada-agentvault
   ```

   Once the repository is accessible to you on GitHub, the first command can
   instead be `codex plugin marketplace add synnada-ai/agentvault-plugins`.
3. Start the Codex CLI with its Vault binding token in the process environment.
   For example, this zsh/bash snippet prompts without echoing the token or
   putting it in shell history:

   ```sh
   printf 'Codex Vault binding token: ' >&2
   IFS= read -r -s VAULT_MCP_TOKEN
   printf '\n' >&2
   export VAULT_MCP_TOKEN
   export VAULT_HOME='/absolute/path/from/vault/instructions'
   export VAULT_APP_PATH='/Applications/Agent Vault.app'
   codex
   unset VAULT_MCP_TOKEN
   ```

   Substitute your real absolute home path. The compatibility overlay forwards
   these three environment variables to the portable MCP server. No token is
   saved by this package. An unrelated desktop-app process does not inherit
   the token from this shell. **For the desktop app, keep the existing `vault`
   MCP connection installed through Vault's connection instructions.** Codex
   gives an existing `[mcp_servers.vault]` entry precedence over this plugin's
   server, so the shared skill uses that authorized connection without a new
   shell token. This precedence was verified with Codex 0.151.0. The package
   does not install a machine-wide secret or modify launchctl.
4. Keep one intended `vault` connection. The existing configuration can remain
   in place; remove it only if deliberately switching to the plugin-managed
   server and its process environment. Start a new Codex session after changes.

The package uses portable `plugin.json` and `mcp.json`, with a Codex
compatibility manifest and environment-forwarding overlay. Public OpenAI
directory submission of a local MCP server requires partner approval;
installing from this Git marketplace is separate from directory approval.
