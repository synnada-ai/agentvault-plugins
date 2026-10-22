# Release notes

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
requires 0.22.4+; its public catalog currently has a documented-layout/runtime
conflict detailed in PUBLISHING.md. Local OpenAI MCP submissions require partner
approval. No native conversation restoration is provided.
