# Hermes catalog candidate

Copy [agentvault.yaml](agentvault.yaml) to `plugin-catalog/agentvault.yaml` in
`NousResearch/hermes-agent`, then open a PR using [pr-body.md](pr-body.md).
The entry pins the public 0.1.1 package commit, not this file's later commit.
Verify the pinned package before sending the PR; update both the SHA and
version if any package content changes.

The package uses `plugin.json` without `plugin.yaml`. Hermes v0.22.4's actual
admission validator and catalog CI explicitly support portable-only packages,
although the live catalog prose still mentions YAML. A YAML shim would take
precedence in discovery and suppress this package's portable entrypoint.

Validate with a Python environment for the selected Hermes release:

```sh
python /absolute/path/to/hermes-agent/scripts/validate_plugin_catalog.py \
  submissions/hermes/agentvault.yaml
hermes plugins validate plugins/hermes
HERMES_SOURCE_ROOT=/absolute/path/to/hermes-agent python scripts/check-hermes.py
```

Use a fresh checkout at the entry's exact SHA for the package checks. This
package has no Python dependencies; catalog CI's `--install-deps` runs in its
own environment. Do not upgrade or synchronize a user's Hermes environment
just to validate the entry. No upstream PR has been opened.
