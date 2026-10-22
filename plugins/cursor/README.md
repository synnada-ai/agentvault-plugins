# Agent Vault for cursor

Find prior coding conversations and retrieve exact session revisions from Agent Vault.

## Install and connect

1. Install Agent Vault in `/Applications/Agent Vault.app`, open it, and finish
   account/storage setup and the first backup/index.
2. In Agent Vault's MCP connections, connect **Cursor**. Keep its private
   `VAULT_MCP_TOKEN` and the `VAULT_HOME` from the connection instructions.
   Reconnecting rotates that client's token and invalidates its old connection.
3. In Cursor, import this package from disk (`plugins/cursor` in the repository)
   using **Customize**, or copy its contents to
   `~/.cursor/plugins/local/agentvault` and reload Cursor.
4. In **Plugins → Configure**, set `VAULT_MCP_TOKEN` to the Cursor binding token.
   Set `VAULT_HOME` to the absolute path from Vault's instructions; leave it
   empty only when the archive uses `~/.vault`. Change `VAULT_APP_PATH` if the
   app is installed elsewhere. These are per-user plugin variables, not values
   to commit to the repository. Do not assume Cursor masks a string variable.
5. Enable the Vault MCP source and its two read-only tools in **Customize**.
   If a manual `vault` MCP entry was previously installed, disable that entry
   after configuring the plugin to avoid duplicate tools. Keep its setup until
   the plugin passes verification. Restart/reload if necessary.

Enterprise administrators may need to allow local plugin imports. A private
team can import the repository's `.cursor-plugin/marketplace.json` through its
team marketplace. Public marketplace publication is a separate review step.


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
