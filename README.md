# Agent Vault plugins

One shared retrieval skill, packaged for Cursor, Codex, Claude Code, and Hermes.
The packages launch the **existing MCP server in the installed Agent Vault
macOS app**. They do not copy the server, implement another archive, or host a
remote endpoint. Agent Vault must remain running and authorized.

| Client | Package and setup | Format |
| --- | --- | --- |
| Cursor | [plugins/cursor](plugins/cursor/README.md) | Native Cursor manifest, user variables, MCP |
| Codex | [plugins/codex](plugins/codex/README.md) | Portable manifest/MCP plus Codex env overlay |
| Claude Code | [plugins/claude-code](plugins/claude-code/README.md) | Native manifest, sensitive userConfig, MCP |
| Hermes | [plugins/hermes](plugins/hermes/README.md) | Portable manifest/MCP; Hermes 0.22.4+ |

Each package contains the same `vault-retrieval` skill and shell launcher,
generated from `shared/`. Only its host metadata, environment routing, and fixed
client identity differ. Credentials are supplied by each host. The launcher
uses the installed app's bundled Node runtime, so users do not need a second
Node installation. Development needs Node 22.5+, `zip`, and `unzip`.

## Develop

```sh
npm run build
npm run check
npm test
npm run package
```

Edit `shared/skills/vault-retrieval/SKILL.md`, `shared/launch-mcp.sh`, or the
generator and setup docs, then regenerate. Commit the generated `plugins/` and
marketplace manifests: Git installations must work without a build step.
Packages are self-contained, without symlinks to the monorepo. `dist/` contains
one ZIP per client and `SHA256SUMS`; archives are inspected after creation.

For the integration check against a local Vault client checkout:

```sh
VAULT_CLIENT_ROOT=/absolute/path/to/agentvault-client npm run test:vault
```

That check uses the real Vault MCP server and IPC fixture with synthetic
sessions in a disposable directory. It does not read a user's archive, mint
real bindings, contact a provider, or change host configuration. Package checks
and a synthetic protocol test do not certify every host's agent behavior.

`npm run test:codex` with the same `VAULT_CLIENT_ROOT` checks the installed
Codex CLI's real plugin and MCP interfaces in a disposable `CODEX_HOME`, with
no inference turns. `scripts/check-hermes.py` checks a caller-selected Hermes
source checkout's actual package parser and directory discovery; see the
publishing guide for its environment and remaining interactive checks.

## Publish

See [PUBLISHING.md](PUBLISHING.md) for repository distribution, platform review,
versioning, current limits, and remaining public-submission materials.
[docs/sources.md](docs/sources.md) records the primary sources checked on
**22 October 2026**, and distinguishes current docs from the installed versions.
No public marketplace submission or publication is performed by the build.

Tokens are not part of this repository. Reconnecting a client in Vault rotates
its binding; installation and plugin updates never rotate one automatically.
If there is an existing manually installed Vault server, follow the relevant
setup guide to avoid duplicate tools or unexpected precedence.
