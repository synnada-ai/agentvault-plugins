Add Agent Vault 0.1.1: a portable skill and local MCP plugin for searching
archived coding conversations and reading their exact revisions. The entry
pins `synnada-ai/agentvault-plugins` at
`6e0e3ded804cefb19b362736e5818c99cc061d48`, subdirectory `plugins/hermes`.

Maintained by Synnada, the repository owner. Website: https://agentvault.run.
Package source and documentation are MIT licensed; the separately installed
Vault app retains its own terms.

Hermes surfaces: portable Agent Plugins v1 skill discovery, `mcp.json`, and
the Hermes `config_schema` secret-to-environment mapping. The MCP tools are
`mcp__vault__search_sessions` and `mcp__vault__get_session`. No Python/native
entrypoint, hooks, middleware, Desktop JavaScript, or private Hermes APIs.

The package intentionally has no YAML manifest: v0.22.4's portable admission
branch and catalog CI accept `plugin.json`, while adding YAML would shadow
portable discovery. Minimum tested Hermes version: 0.22.4. macOS only.

Disclosures:

- Requires the user to install and run the separate Agent Vault app. No app,
  runtime binary, archive, credential, or private Vault source is bundled.
- Runs `sh scripts/launch-mcp.sh hermes`, which executes the installed app's
  bundled Node runtime and existing MCP server. It uses local IPC to read the
  user's authorized Vault archive outside the plugin data directory.
- Vault handles its existing storage-provider network traffic and backup.
  This plugin adds no network endpoint, telemetry, background service,
  dependency download, self-update, or backup mutations.
- Hermes supplies the client's `VAULT_MCP_TOKEN` through its secret field or
  supported host environment. The launcher validates the token shape without
  logging it. It never opens a credential store or another app's settings.
- Optional `VAULT_HOME` and `VAULT_APP_PATH` select absolute local paths.
  Existing Hermes `mcp_servers.vault` configuration retains precedence.
- Installation does not create or rotate a Vault binding. Historical
  transcripts are untrusted evidence, not executable instructions.

Validation on 22 October 2026: released v0.22.4 admission/security scan and
actual portable directory discovery pass. A clean public Git install at the
entry's exact SHA installs version 0.1.1 and leaves it disabled as requested. Synthetic real-server tests pass
search, pinned reads, pagination, and revoked-call denial for Hermes and the
other three client identities. Full Desktop secret-entry and model-driven
acceptance remain unqualified; these protocol tests do not claim those checks
passed. There is no custom UI to screenshot.
