## Install and connect

1. Install and open Agent Vault, finish setup and backup/indexing, and connect
   **Claude Code** in Vault's MCP connections. Keep its token and absolute
   `VAULT_HOME`. Reconnecting rotates the previous Claude Code binding.
2. In Claude Code, add the marketplace and install the plugin:

   ```text
   /plugin marketplace add synnada-ai/agentvault-plugins
   /plugin install agentvault@synnada-agentvault
   ```

   While the repository is private, Git access must be authenticated. For
   development, use `claude --plugin-dir /absolute/path/to/plugins/claude-code`.
3. Fill in the plugin's configuration prompt: `VAULT_MCP_TOKEN` is the private
   Claude Code binding token; `VAULT_HOME` is the absolute path from Vault's
   instructions (empty uses `~/.vault`); `VAULT_APP_PATH` defaults to
   `/Applications/Agent Vault.app`. The token is a sensitive `userConfig`
   field, stored through Claude Code's secure configuration mechanism.
4. Enable the plugin's Vault tools, then restart the session if required.
   Disable a previously configured manual `vault` MCP source only after the
   plugin passes verification, to avoid duplicate tools.

This package targets Claude Code. Claude web/Cowork installations and remote
environments cannot execute the local macOS Vault server through this package.
Use a current Claude Code release with `userConfig` support; the manifest is
validated with Claude Code 2.1.283.
