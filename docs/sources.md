# Compatibility sources

Checked **22 October 2026**. Official docs are live pages; the release/source
pins below record what was actually inspected or executed. Host availability
and public review approval remain separate from package-format support.

| Area | Primary source | Result used here |
| --- | --- | --- |
| Portable layout | [Agent Plugins 1.0 specification](https://agent-plugins.org/specification) | Fixed `skills/`, `plugin.json`, `mcp.json`; executable/cwd containment rules |
| Cursor | [Plugin reference](https://cursor.com/docs/reference/plugins), [local install](https://cursor.com/docs/plugins) | Native `.cursor-plugin`, variables schema, `${CURSOR_PLUGIN_ROOT}`; portable root variables are not expanded by Cursor |
| Codex | [Package guide](https://developers.openai.com/plugins/build/plugins), [submission](https://developers.openai.com/plugins/deploy/submission) | Portable and Codex formats, `.agents/plugins` marketplace, metadata |
| OpenAI local publishing | [Desktop-only submissions](https://developers.openai.com/plugins/deploy/desktop-only) | Partner allowlisting for local MCP; no claim of directory eligibility |
| Claude Code | [Manifest reference](https://code.claude.com/docs/en/plugins-reference), [publishing](https://code.claude.com/docs/en/plugins/publish) | `.claude-plugin`, `.mcp.json`, sensitive `userConfig`, repository marketplaces |
| Hermes | [Plugin developer guide](https://hermes-agent.nousresearch.com/docs/developer-guide/plugins), [catalog guide](https://hermes-agent.nousresearch.com/docs/developer-guide/plugins/catalog-submission) | Portable package support, host-managed secret configuration, monorepo installs, public catalog SHA pins |

## Released source checks

- Codex CLI **0.151.0**, official `rust-v0.151.0` source:
  [portable environment overlay](https://github.com/openai/codex/blob/rust-v0.151.0/codex-rs/core-plugins/src/agent_plugin_mcp_overlay.rs).
  The native overlay's `env_vars` removes matching portable environment
  references and forwards the parent environment. Native app-server tests
  confirm authenticated calls with this package and confirm that an existing
  `mcp_servers.vault` configuration takes precedence.
- Hermes **v0.22.4**, released 21 October 2026, commit
  `4d04303818b61bf3aa09278af48356315515965b`:
  [portable parser](https://github.com/NousResearch/hermes-agent/blob/4d04303818b61bf3aa09278af48356315515965b/hermes_cli/agent_plugins.py),
  [discovery precedence](https://github.com/NousResearch/hermes-agent/blob/4d04303818b61bf3aa09278af48356315515965b/hermes_cli/plugins_discovery.py),
  [native manifest parsing](https://github.com/NousResearch/hermes-agent/blob/4d04303818b61bf3aa09278af48356315515965b/hermes_cli/plugins_manifest.py).
  The package uses a bare `sh` command and a plugin-relative cwd. Its real
  directory-discovery test intentionally forbids a YAML shim that would shadow
  the portable entrypoint in this release. This conflicts with the live catalog
  admission documentation; see the publishing guide.

## Local evidence and limits

- Agent Vault **0.1.11**, build **13**, is installed under
  `/Applications/Agent Vault.app`. The launcher targets its existing
  `Contents/Resources/runtime/node` and `Contents/Resources/app/src/mcp/server.js`.
  Integration tests use the same source layout with synthetic IPC data.
- Codex CLI **0.151.0**: disposable marketplace installation and native
  app-server search, pinned read, and revoked-call checks pass. No inference
  turn or user account archive is used.
- Claude Code **2.1.283**: native plugin and marketplace validators pass.
  Its interactive configuration prompt and agent-driven skill invocation
  still need a clean-install acceptance run before public publication.
- Cursor IDE **3.26.13** is installed. Its documented native package layout is
  generated and the server is exercised by protocol tests; visible UI import,
  variable entry, and agent-driven skill invocation have not been certified.
- Installed Hermes **0.18.2** predates this portable format and was not changed.
  The official **0.22.4** checkout's portable parser and actual directory
  discovery validate the package using an isolated check. A full agent session
  and Desktop secret-configuration acceptance run remain release checks.
- Eight repository tests cover generation, host configuration, credential-free
  archives, launcher error redaction, quoting, identity, and syntax. Synthetic
  real-server tests cover all four caller identities, cross-client search,
  exact reads, paging, missing revisions, and revocation. ZIP member contents
  are compared byte-for-byte after packaging.

No passing check here implies a public marketplace submission, approved
listing, successful desktop setup for every host version, or complete archive
coverage for a user account.
