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
