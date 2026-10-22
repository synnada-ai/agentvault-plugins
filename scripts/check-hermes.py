"""Check against a caller-selected Hermes source checkout without updating Hermes."""
import os
from pathlib import Path
import sys
import tempfile

source = os.environ.get("HERMES_SOURCE_ROOT", "")
if not source or not Path(source).is_absolute():
    raise SystemExit("Set HERMES_SOURCE_ROOT to an absolute Hermes 0.22.4+ checkout path.")
sys.path.insert(0, source)

from hermes_cli.agent_plugins import load_agent_plugin
from hermes_cli.plugins_discovery import scan_directory

root = Path(__file__).resolve().parent.parent
directory = root / "plugins" / "hermes"
with tempfile.TemporaryDirectory(prefix="av-hermes-check-") as temporary:
    package = load_agent_plugin(directory, Path(temporary))
    assert not package.diagnostics, package.diagnostics
    assert len(package.skills) == 1
    assert package.skills[0].name == "vault-retrieval"
    assert list(package.mcp_servers) == ["vault"]
    assert Path(package.mcp_servers["vault"]["cwd"]) == directory
    # Checking JSON in isolation misses YAML taking precedence at discovery.
    matches = [m for m in scan_directory(root / "plugins", "user") if Path(m.path) == directory]
    assert len(matches) == 1 and matches[0].portable, "Hermes did not discover a portable package"
print("Hermes discovery, skill, MCP, working directory, and optional environment checks passed.")
