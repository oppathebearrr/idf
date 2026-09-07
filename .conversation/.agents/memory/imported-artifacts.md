---
name: Imported artifact registration
description: How to make an imported PNPM artifact visible to the project preview and publishing surfaces.
---

When importing a repository that already contains an artifact configuration, register the artifact with the workspace before relying on managed preview or publishing controls, then restore the repository's application files without replacing the registered artifact metadata.

**Why:** An imported artifact directory can run through a manually configured workflow but remain absent from the artifact registry, which prevents the preview surface from resolving it and omits the managed environment configuration.

**How to apply:** Preserve the imported source, register the same artifact slug, restore the source while keeping the registered `.replit-artifact/artifact.toml`, and use the exact managed workflow name for restarts.