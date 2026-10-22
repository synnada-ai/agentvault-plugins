# Publishing Agent Vault plugins

Verified against the official documentation and released source available on
**22 October 2026**. [Primary sources and version evidence](docs/sources.md).

This repository distributes four installable packages from one source tree.
Git distribution, a GitHub release, and approval in a platform's public
directory are separate outcomes. A passing package test is not directory
approval. These ZIPs are development/distribution artifacts, **not completed
public OpenAI submission bundles**.

## Release from this one repository

1. Test a clean installation of each package with its own Vault binding. Use
   the [verification procedure](docs/verification.md), including a known
   matching session and a denied call after revocation. Then reconnect the
   test binding. Do not use personal session data in public demos or fixtures.
2. Update `version` in root `package.json`, run `npm run build`, and commit the
   generated `plugins/` and all three marketplace manifests. Every release
   needs a new version so caches and updates pick it up. No separate plugin
   repositories, npm publication, hosted MCP deployment, or runtime copying
   is required.
3. Run the checks:

   ```sh
   npm run check
   npm test
   VAULT_CLIENT_ROOT=/absolute/path/to/agentvault-client npm run test:vault
   VAULT_CLIENT_ROOT=/absolute/path/to/agentvault-client npm run test:codex
   claude plugin validate --strict ./plugins/claude-code
   claude plugin validate --strict ./.claude-plugin/marketplace.json
   npm run package
   ```

   The Codex test uses a disposable `CODEX_HOME` and the native app-server MCP
   interface. It performs no inference turns. For Hermes, use a Python
   environment with the selected Hermes release's dependencies:

   ```sh
   HERMES_SOURCE_ROOT=/absolute/path/to/hermes-agent python scripts/check-hermes.py
   ```

4. Inspect the changed files and ZIPs; confirm there are no tokens, user
   configurations, transcripts, runtime binaries, or private Vault source.
   The packager checks every archived member against the source, including
   hidden manifests. Root `dist/SHA256SUMS` covers the four release ZIPs.
5. Push the reviewed commit. To distribute publicly, first authorize changing
   this repository's visibility and choose the source license. A private
   repository works for collaborators with Git access; it cannot satisfy
   Cursor or Hermes public catalog requirements. Making it public does not
   itself approve a marketplace listing.
6. When ready to release, create a version tag and a GitHub release from that
   commit and attach the four ZIPs and `SHA256SUMS`. For the initial version:

   ```sh
   git tag v0.1.0
   git push origin v0.1.0
   gh release create v0.1.0 dist/agentvault-*-0.1.0.zip dist/SHA256SUMS \
     --title 'Agent Vault plugins 0.1.0' --notes-file CHANGELOG.md
   ```

   These are instructions, not actions performed by the build or CI. Keep the
   plugin packages in this repository; do not move them into the private
   client/server repositories. CI uploads checked ZIP artifacts but never
   publishes a release or submits to a directory.

## Cursor

The repository has `.cursor-plugin/marketplace.json` pointing to
`plugins/cursor`. A team with repository access can import that marketplace;
individual development installs can use **Customize → Import from Disk** or
the documented local-plugin directory. [Setup](docs/setup-cursor.md).

For the public Cursor Marketplace:

1. Make the reviewed repository public after authorization.
2. Verify the package from disk in the current Cursor IDE, including its
   configuration variables and a real authenticated search/read. Local imports
   can be restricted by Enterprise administrators.
3. Open [Publish a Cursor Marketplace Plugin](https://cursor.com/marketplace/publish)
   and submit `https://github.com/synnada-ai/agentvault-plugins`. Identify the
   marketplace manifest and `plugins/cursor` as the Cursor package.
4. Complete the form and respond to Cursor's review. Only call the listing
   published after it appears and a clean marketplace install passes.

The current docs explicitly support multi-plugin Git repositories. The website
requires sign-in; the actual submission form fields have not been inspected
under a publishing account. Do not assume a form submission is approval.

## Codex

The repository has `.agents/plugins/marketplace.json` pointing to
`plugins/codex`. Users with access can install directly:

```sh
codex plugin marketplace add synnada-ai/agentvault-plugins
codex plugin add agentvault@synnada-agentvault
```

For CLI use, supply the per-Codex Vault token through the process environment.
For desktop use, retain the existing `[mcp_servers.vault]` connection issued
by Vault; native configuration takes precedence and the plugin adds the shared
retrieval skill. See [Codex setup](docs/setup-codex.md).

**The public OpenAI directory has an additional eligibility gate.** This
package launches a local stdio MCP server. Current OpenAI documentation limits
those submissions to approved partners: the submitting organization must be
allowlisted by its OpenAI representative first. Repository installation does
not establish that eligibility.

When eligible, finish the public-submission materials below, provide the
organization ID to the representative, and follow the
[desktop-only submission flow](https://developers.openai.com/plugins/deploy/desktop-only).
The docs currently direct approved local MCP submissions through **Skills
only → Upload ZIP**, including the local MCP configuration. This is portal
routing; the package still contains MCP. Submit only after the portal accepts
the package and the required checks/materials are complete. Approval and
clicking **Publish plugin** are separate steps.

The shared launcher depends on the separately installed Vault app. Disclose
that prerequisite and provide a clean reviewer installation path; confirm
with the representative that this external-runtime arrangement is accepted.
Do not repackage private app source or its binary just to satisfy an example
server layout, and do not replace the local server with an invented HTTPS URL.

## Claude Code

`.claude-plugin/marketplace.json` already points to `plugins/claude-code`.
Once the repository is reachable, users can install from your marketplace:

```text
/plugin marketplace add synnada-ai/agentvault-plugins
/plugin install agentvault@synnada-agentvault
```

This repository marketplace is a complete distribution route: it does not
require acceptance into Anthropic's directory. Private repositories need
authenticated Git access. Configure the Claude Code binding token in the
plugin's sensitive `userConfig` field. [Setup](docs/setup-claude-code.md).

For additional directory discovery, follow
[Anthropic's current publishing guide](https://code.claude.com/docs/en/plugins/publish).
Its account-synced Claude web/Cowork route is broader than this package's
tested target. **This local macOS MCP package targets Claude Code**; don't
advertise web, Cowork, or remote-machine compatibility without separately
qualifying their execution and authentication support. Do not silently remove
the local MCP tools to make an account listing load.

## Hermes

Direct Git distribution works from the same repository's subdirectory:

```sh
hermes plugins install synnada-ai/agentvault-plugins/plugins/hermes --no-enable
hermes plugins enable agentvault
```

Use Hermes 0.22.4 or later and the actual ID from `plugins list`. Pin a public
release to a full commit SHA using a supported `--ref` flag when desired.
[Setup](docs/setup-hermes.md).

**Catalog admission is currently blocked by a verified docs/runtime conflict.**
The current [catalog guide](https://hermes-agent.nousresearch.com/docs/developer-guide/plugins/catalog-submission)
requires `plugin.yaml` beside a portable `plugin.json`. However, the released
0.22.4 directory discovery code gives YAML precedence and constructs a native
manifest with `portable = false`. Without a Python/native entrypoint, that
package then fails to load its skill and MCP server. The catalog validator
accepts the combination, which is why isolated manifest validation is
insufficient. This package intentionally omits YAML, and the check script
asserts actual portable discovery.

Before applying to the catalog, ask upstream to clarify or fix portable-only
admission/discovery, then validate the final candidate on the release that
supports the corrected layout. Do not add an empty Python entrypoint: that
would suppress the error while leaving portable MCP unregistered. Do not use
private Hermes internals to register the server.

Once that is resolved:

1. Make the reviewed repository public after authorization.
2. Run `hermes plugins validate ./plugins/hermes --install-deps` on the
   supported release and run `scripts/check-hermes.py` to confirm actual load
   discovery, not just the catalog check.
3. Prepare an entry PR in `NousResearch/hermes-agent`, under
   `plugin-catalog/agentvault.yaml`, with this repo, `subdir: plugins/hermes`,
   the full **40-character release commit SHA**, and quoted version. Follow
   the then-current entry schema; do not submit placeholder SHAs.
4. Disclose the macOS app/runtime prerequisite, shell execution, local daemon
   access, and Vault's provider traffic. Credentials are supplied through
   Hermes, not read from other apps or credential files.
5. Wait for catalog CI and human review. Updates require new SHA-bump PRs;
   this plugin has no self-updater.

No upstream issue, PR, or catalog submission has been sent by this repository.

## Public OpenAI submission materials still needed

The package already supplies an icon, description, version, starter prompts,
desktop requirement, and the actual local MCP configuration. These do not
complete public review. Before creating a submission copy, provide:

- The intended verified developer/business identity and local-MCP allowlisting.
- Published website, support, privacy-policy, and terms URLs covering this
  plugin. No policy or support URL has been invented in the manifests.
- Country availability and whether users purchase a Vault subscription or
  anything else through the product; confirm the real commerce flow.
- Dedicated reviewer access with synthetic sessions, clean Vault installation
  instructions, and an accessible recorded demo. Never put reviewer tokens in
  the repository, ZIP, demo, or public fields.
- Five positive and three negative scenarios exercised against the final
  reviewer setup, plus release notes. [Draft scenarios](docs/review-cases.md)
  are not claims that a model-based review has passed.

Add supported final values to a separate public submission copy under
`extensions.com.openai`; rebuild and inspect that ZIP. Complete developer
verification, scans, secure reviewer credentials, and legal attestations in
the portal. No archive in `dist/` is labeled submission-ready while these
items and eligibility are unresolved.
