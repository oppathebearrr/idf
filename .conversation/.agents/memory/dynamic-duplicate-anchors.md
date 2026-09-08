---
name: Dynamic duplicate anchors
description: Persistent duplicate rules on dynamic pages need identity validation beyond generated CSS selectors.
---

Generated CSS selectors are not sufficient to identify a persistent duplicate when a page rebuilds sections with repeated classes and tags. A duplicate rule should store a lightweight identity derived from the original anchor and refuse replay when the matched candidate does not have that identity.

**Why:** A selector that originally matched a pending transaction can later resolve to a structurally similar section heading after the host page repopulates its DOM, creating a persistent duplicate in the wrong section.

**How to apply:** Use identity matching for duplicate replay, keep text-rule replay separate, and invalidate older duplicate rules that lack the identity metadata instead of guessing at a new anchor.