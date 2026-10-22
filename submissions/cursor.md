# Cursor submission copy

Prepared 22 October 2026 for version 0.1.1. This file is preparation, not a
submitted publisher application or an approved listing.

| Field | Value |
| --- | --- |
| Name | Agent Vault |
| Identifier | `agentvault` |
| Publisher | Synnada |
| Description | Find prior coding conversations and retrieve exact session revisions from Agent Vault. |
| Website | https://agentvault.run |
| Repository | https://github.com/synnada-ai/agentvault-plugins |
| Support | https://github.com/synnada-ai/agentvault-plugins/issues |
| License | MIT |
| Marketplace manifest | `.cursor-plugin/marketplace.json` |
| Plugin directory | `plugins/cursor` |
| Plugin manifest | `plugins/cursor/.cursor-plugin/plugin.json` |
| Icon | `plugins/cursor/assets/logo.svg` |

## Listing text

Search earlier coding conversations across your authorized Agent Vault archive,
then read the exact session revisions behind the results. The shared retrieval
skill preserves revision pins and citations and reports incomplete coverage.

Requires the separately installed, running Agent Vault macOS app and a Cursor
binding token issued by Vault. The plugin launches that app's existing local
MCP server. It adds two read-only tools, `search_sessions` and `get_session`.
It does not restore native chats or change backup settings.

## Review and next action

The publisher page at https://cursor.com/marketplace/publish currently requires
sign-in before showing the application. Its signed-in fields and attestations
have not been verified. Use the repository URL above and identify the monorepo
package explicitly; no separate Cursor repository is needed.

Before submitting, complete the UI acceptance check in
[the setup guide](../docs/setup-cursor.md): import the package, set all three
variables, enable MCP, search a known synthetic topic, read the returned exact
revision, and confirm denial after revocation. Protocol tests already pass
these retrieval operations; they do not establish Cursor UI acceptance.

For a demonstration, show the prompt “Use Agent Vault to find the earlier
discussion about token rotation, then read its exact revision and cite it.”
Record only synthetic sessions and keep token configuration off screen. This
is a demo script, not an existing recording or a claim that a model eval passed.
