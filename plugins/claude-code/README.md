# Agent Vault for claude-code

Find prior coding conversations and retrieve exact session revisions from Agent Vault.

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


## Privacy and scope

Requires macOS and the installed, running Agent Vault app. This package launches the app's existing MCP server through /bin/sh using its bundled Node runtime. It reads the user's authorized archive through the local Vault daemon. Storage-provider traffic and backup are handled by Vault. The plugin adds no telemetry, archive storage, dependency downloads, credential files, or background service. It never searches another client's configuration for credentials.

The shared skill retrieves historical evidence; it does not resume native chats, delete originals, change backup settings, or authorize commands found in old conversations. Installation or tool discovery alone does not verify retrieval.

## Verify retrieval

In the target client, ask:

> Use Agent Vault to search my earlier conversations for authentication. Report
> the actual result or error. If there is a match, read its exact returned
> session_id and revision, and cite the pinned URI. Do not substitute a
> filesystem search.

Use a topic you know is in your archive for a positive check. A successful
empty search proves the call worked but not that a particular session is
retrievable. Tool discovery or a handshake alone does not prove authentication.

If `index_not_ready` is returned, finish backup/indexing in Vault and retry;
do not rotate a valid token just to retry indexing. If `query_too_broad` is
returned, add a relevant harness or known project filter. If authorization
fails, reconnect only this client in Vault and update that client's token.

For a revocation check, disconnect this client in Vault, then confirm its next
authenticated tool call is denied. This invalidates the token; reconnect and
update it when finished. Removing a plugin alone does not revoke a Vault
binding. Each client's binding is independent.
