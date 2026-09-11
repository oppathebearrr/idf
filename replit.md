# Inspect CSS

Inspect CSS is a hosted download page for the Inspect CSS browser extension. The page explains the extension and serves a patched Chrome package for local installation. The current package also includes selected-element quick actions, reusable text presets, reusable blocks, local preset management, and a starter `Demo text` preset containing `Sample text preset`.

## Run & Operate

### Preview

The managed web workflow runs the hosted page:

```bash
pnpm --filter @workspace/inspect-css run dev
```

The workflow supplies `PORT` and `BASE_PATH`. Do not start the Vite server from the workspace root or hardcode a port in application code.

### Validate changes

Run the artifact typecheck:

```bash
pnpm --filter @workspace/inspect-css run typecheck
```

Run a production-style build manually by providing the same values used by the artifact workflow:

```bash
PORT=25857 BASE_PATH=/ pnpm --filter @workspace/inspect-css run build
```

The build should produce:

- `artifacts/inspect-css/dist/public/` — the static site output
- `artifacts/inspect-css/public/downloads/SecurityInspectv1.zip` — the downloadable Chrome extension package

The preview page and ZIP can be checked through the shared preview proxy:

```bash
curl -I http://localhost:80/
curl -I http://localhost:80/downloads/SecurityInspectv1.zip
```

### Publish

1. Confirm the preview is running and the typecheck/build commands pass.
2. Open the **Publish** tool in Replit.
3. Publish the `Inspect CSS` web artifact using its configured static deployment.
4. After publishing, open the public URL and verify both the landing page and the Chrome ZIP download.

The deployment configuration lives in `artifacts/inspect-css/.replit-artifact/artifact.toml`. It uses static hosting and serves `artifacts/inspect-css/dist/public`. The production build automatically downloads the official upstream release package, patches the background service worker, hardens stylesheet inspection against cross-origin `DOMException` failures, injects the reusable-preset content runtime, and copies the result into the public downloads directory.

## Stack

- pnpm workspace monorepo
- React + Vite landing page
- TypeScript
- Tailwind CSS
- Static deployment
- Original Inspect CSS extension source: Vue 3 + Vite + Manifest V3

## Where things live

- `artifacts/inspect-css/src/App.tsx` — landing page content and download behavior
- `artifacts/inspect-css/src/index.css` — landing page theme, layout, responsive styles, and motion
- `artifacts/inspect-css/scripts/build-extension.mjs` — fetches and patches the upstream Chrome package during builds
- `artifacts/inspect-css/scripts/preset-runtime.mjs` — dependency-free runtime for the shipped quick-action and preset workflow
- `artifacts/inspect-css/extension-source/` — extension source used for package alignment
- `artifacts/inspect-css/extension-source/src/pages/content/ui/app/AppElementQuickActions.vue` — typed quick-action menu and preset management UI
- `artifacts/inspect-css/extension-source/src/utils/content-presets.ts` — versioned local preset model, sanitization, block capture, and safe duplication
- `artifacts/inspect-css/extension-source/src/utils/content-history.ts` — page-session undo/reset history for preset and duplicate actions
- `artifacts/inspect-css/public/downloads/` — generated local download output
- `artifacts/inspect-css/.replit-artifact/artifact.toml` — preview and production artifact configuration

## Architecture decisions

- The deployed artifact is a static companion site because Inspect CSS is a browser extension, not a conventional web app.
- The original extension source is kept under `extension-source` rather than merged into the React landing-page package.
- The Chrome package is based on the official upstream release, then patched during the build so the Manifest V3 background service worker does not import a shared hashed module and the shipped content entry includes the preset workflow.
- The typed source implementation remains in `extension-source`; the current hosted build uses `scripts/preset-runtime.mjs` as a dependency-free package patch because the legacy extension dependency tree is blocked by an old transitive `form-data` package in the workspace firewall.
- Presets use browser-local storage, are shared across websites and browser restarts, and support text replacement plus sanitized block capture/application without cloud sync.
- The extension uses `activeTab` and `scripting` permissions, so it can inspect the page the user explicitly activates it on without requiring broad host permissions.
- Browser-owned pages such as `chrome://` pages and the Chrome Web Store cannot be inspected by Chrome extensions; the background script exits cleanly on those URLs.

## Product

The landing page introduces Inspect CSS and provides:

- CSS inspection and computed-style exploration
- Live CSS and attribute editing
- DOM navigation
- Website color palette inspection
- Asset downloading
- Chromium color-picker support
- Selected-element quick actions for Edit, Duplicate, Apply preset, and Save as preset
- Local text presets with a starter `Demo text` preset
- Sanitized reusable blocks that can replace or insert DOM content
- Preset management with rename/edit, duplicate, delete, import/export, undo, and page reset
- A downloadable Chrome package

## Extension installation

1. Download the Chrome package from the hosted landing page.
2. Extract the ZIP.
3. Open `chrome://extensions`.
4. Enable **Developer mode**.
5. Click **Load unpacked** and select the extracted folder containing `manifest.json`.
6. Open a normal `http://`, `https://`, or permitted `file://` page and click the Inspect CSS extension icon.

Do not try to inspect `chrome://` pages, the Chrome Web Store, or other browser-owned pages; Chrome blocks script injection there.

## Gotchas

- The artifact build requires `PORT` and `BASE_PATH` when run outside its managed workflow.
- Do not load the ZIP itself or the repository root as an unpacked extension; load the extracted directory containing `manifest.json`.
- Re-download the package after a packaging change so an older cached ZIP is not reused.
- The hosted package build does not compile `extension-source` directly; it patches the upstream release and injects the dependency-free preset runtime. Keep the source implementation and runtime patch behavior aligned.
- A fresh install starts with the `Demo text` preset. Presets are stored locally in the browser, so existing installations may need the updated package and a page reload before the starter preset appears.
- The extension source's legacy dependency tree cannot currently be fully installed in this workspace because an old transitive `form-data` package is blocked by the package firewall. The hosted artifact build remains the validation path for the downloadable package.
- The API server, database libraries, and mockup sandbox are workspace scaffolding and are not required by the Inspect CSS landing page.

## Pointers

- `artifacts/inspect-css/.replit-artifact/artifact.toml` — artifact routing and production settings
## Card Security Integration

The site now includes the Card Security module hosted under the `/card-security` path. It is a local-only card authorization document generator.
- **Workflow**: 4-step authorization form (Contact -> Temporary Card -> Agreement -> Signature -> Confirmation).
- **Features**: Generates a PDF in the browser with card details masked (brand & last four digits only).
- **Architecture**: No backend API, database, or storage. Card data is kept in-memory and discarded upon completion/exit.
- **Where it lives**: `artifacts/inspect-css/src/card-security/` with its own Wouter nested router `CardSecurityApp.tsx`.
- **Config**: Edit `artifacts/inspect-css/src/card-security/config.ts` to update the business name, logo, or policies.
- **Theme**: Re-styled to match the Security Inspection (navy/gold/ivory) aesthetic rather than its original blue/slate theme.