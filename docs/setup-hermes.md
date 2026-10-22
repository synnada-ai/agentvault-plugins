## Install and connect

This package targets **Hermes 0.22.4 or later**, using its portable Agent
Plugins support. The development machine's older Hermes 0.18.2 cannot load
this format. Updating Hermes is a separate user action; the plugin does not
update the host or install Python dependencies.

1. Install/open Agent Vault, finish setup and backup/indexing, and connect
   **Hermes** in Vault's MCP connections. Keep that client's private token and
   absolute `VAULT_HOME`. Reconnecting rotates an existing Hermes binding.
2. Install the plugin from the monorepo subdirectory:

   ```sh
   hermes plugins install synnada-ai/agentvault-plugins/plugins/hermes --no-enable
   hermes plugins list
   hermes plugins enable agentvault
   ```

   Use the exact identifier shown by `plugins list` if your profile prefixes
   it. For a reproducible install, add `--ref` with the full release commit SHA
   on a Hermes version that supports it. Private installs require Git access.
3. In the Hermes Desktop plugin settings, set **Vault binding token**. Its
   `secret` configuration field routes `VAULT_MCP_TOKEN` through Hermes.
   Alternatively, supply that variable through Hermes's supported shell or
   active-profile environment configuration. The plugin forwards it to MCP;
   it never opens a credential store or reads a `.env` file itself.
4. Supply `VAULT_HOME` through that same host environment if the vault is not
   `~/.vault`. Set `VAULT_APP_PATH` if the app is not at
   `/Applications/Agent Vault.app`. Both paths must be absolute.
5. If `config.yaml` already defines a `vault` MCP server, Hermes gives that
   entry precedence. You can keep using that authorized existing server with
   the shared skill; do not remove it merely to make a tool listing look new.
   To switch to the plugin's server, disable/remove only that old entry after
   setting the plugin token, restart, and verify the authenticated tools.

Skills are namespaced by Hermes: discover `vault-retrieval` using `skills_list`
and load the returned qualified name with `skill_view`. The plugin is disabled
until explicitly enabled. `plugin.json` and `mcp.json` provide the portable
skill and MCP entrypoint. Do not add `plugin.yaml` beside them on Hermes 0.22.4:
that release prioritizes YAML and stops discovering the portable entrypoint.
See the publishing guide for the resulting catalog-submission limitation.
