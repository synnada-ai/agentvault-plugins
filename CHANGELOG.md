# Release notes

## 0.1.1 — 22 October 2026

- Public repository with the MIT license included in every package.
- Website and license metadata for all four hosts.
- Cursor and Claude Code publishing copy and a pinned Hermes catalog candidate.
- Corrected Hermes catalog guidance after running the released portable-only
  admission validator and checking the catalog CI gate.


## 0.1.0 — 22 October 2026

- Shared retrieval skill for finding prior coding discussions, reading exact
  revisions, and recovering context with source citations.
- Cursor, Codex, Claude Code, and Hermes packages in one repository, using
  the installed Agent Vault application's existing local MCP server.
- Host-specific token configuration; no credentials or private Vault source
  bundled in the packages.
- Reproducible package generation, integrity-checked ZIPs, CI, synthetic
  real-server tests, and native Codex integration checks.

Initial development release. Public directory approval and interactive
clean-install checks for Cursor, Claude Code, and Hermes are pending. Hermes
requires 0.22.4+; its released admission validator accepts portable-only packages. Local OpenAI MCP submissions require partner
approval. No native conversation restoration is provided.
