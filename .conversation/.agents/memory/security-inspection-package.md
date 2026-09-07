---
name: Security Inspection package build
description: Durable build and runtime constraints for the hosted browser-extension package.
---

The hosted Security Inspection artifact builds with explicit `PORT` and `BASE_PATH` environment values. The injected runtime cannot assume the content-script shadow root already exists; it must observe the document and attach after the extension mounts. Its page-level selection handler must also exclude the injected preset menu.

**Why:** The Vite config intentionally fails fast without routing/build configuration, and the content entry mounts asynchronously. Initializing the runtime only once can leave the upstream hover panel visible and prevent patched interactions from attaching. Without excluding the menu, clicking its input selects the input as a page element and re-renders it while typing.

**How to apply:** Preserve the artifact’s configured port/base path when running production builds, use a mount-aware initialization path for injected runtime UI, and keep `#inspect-css-preset-menu` out of page-element selection.