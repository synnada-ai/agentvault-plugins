# Cursor submission copy

Publisher application submitted 22 October 2026 for version 0.1.1. The page
confirmed receipt. Review is pending; this is not an approved listing.

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

The application at https://cursor.com/marketplace/publish uses Synnada,
handle `synnada-ai`, this public repository, and https://agentvault.run. It
discloses the prerelease status and pending model-driven Cursor retrieval
acceptance. No separate Cursor repository is needed.

Cursor 3.27.6 loads the local plugin, accepts masked token/path configuration,
connects MCP, and exposes both tools. Agent sessions load the shared skill,
but searches time out before reaching the test daemon and the IDE account
then hits its Agent usage limit. The maintainer authorized submission with
this limitation. Finish authenticated search/read and native revocation
acceptance before removing the experimental label. Protocol checks already
pass these operations; they do not establish Cursor agent acceptance.

For a demonstration, show the prompt “Use Agent Vault to find the earlier
discussion about token rotation, then read its exact revision and cite it.”
Record only synthetic sessions and keep token configuration off screen. This
is a demo script, not an existing recording or a claim that a model eval passed.
