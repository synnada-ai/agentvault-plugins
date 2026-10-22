# Claude Code distribution

Prepared 22 October 2026 for version 0.1.1. The public repository marketplace
is the distribution route for this Claude Code package:

```text
/plugin marketplace add synnada-ai/agentvault-plugins
/plugin install agentvault@synnada-agentvault
```

No Anthropic directory approval is required for repository marketplace
distribution. Both the native plugin and marketplace pass strict validation.
Clean local and public Git installations in disposable `CLAUDE_CONFIG_DIR`
profiles install version 0.1.1, enable the plugin, expose the expected local
MCP declaration, and
correctly report the required unset token configuration.

Users need the separately installed, running Agent Vault macOS app. Configure
the Claude Code binding token and paths through the plugin's `userConfig`;
the token field is sensitive. Follow [setup](../docs/setup-claude-code.md),
including authenticated search/read and revocation before announcing a fully
qualified interactive release. That configuration/session acceptance check
remains separate from manifest validation and installation.

Use “Agent Vault” by “Synnada”, the description in the package, website
https://agentvault.run, plugin support at
https://github.com/synnada-ai/agentvault-plugins/issues, and the MIT license.
The license covers this package, not the separately installed Vault app.

Anthropic's broader account-synced directory is a separate route. The
[current publishing guide](https://code.claude.com/docs/en/plugins/publish)
directs paid claude.ai accounts to https://claude.ai/directory/manage. Do not
claim web or Cowork compatibility for this local Claude Code package, or send
an obsolete directory-submission PR to `claude-plugins-official`. Qualify the
execution environment and applicable directory requirements first.
