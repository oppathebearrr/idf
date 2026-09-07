---
name: Project handoff imports
description: Where imported repository files may appear after a conversation transitions into a persistent project.
---

After a conversation moves into a persistent project, the imported repository may be preserved in a transition copy rather than the active root. Check the preserved files and compare the repository metadata before restoring source files into the active project.

**Why:** The project bootstrap can create a fresh workspace scaffold while preserving the prior conversation workspace separately, so blindly editing the scaffold can target the wrong codebase.

**How to apply:** For clone/import tasks immediately after handoff, inspect the preserved transition directory and its repository metadata before running installs, workflows, or deployment checks.