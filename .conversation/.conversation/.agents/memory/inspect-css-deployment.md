---
name: Browser-extension hosting
description: Deployment approach for browser-extension repositories in this workspace.
---

Browser-extension repositories do not render as ordinary websites and may not be directly deployable through the web preview. Keep the extension source in the project, add a small hosted download/explanation page, and expose a tested package download path. If the extension's dependency tree cannot install because an old transitive package is blocked by the workspace package firewall, use the project's official GitHub release asset rather than silently shipping an unbuilt source archive.

**Why:** The original Inspect CSS repository is a browser extension, and its legacy dependency tree could not install cleanly in the hosted workspace because the package firewall rejected an old `form-data` tarball.

**How to apply:** Preserve the original source for provenance, make the hosted page explicit about what is downloadable, and verify both the page response and the package response before publishing.