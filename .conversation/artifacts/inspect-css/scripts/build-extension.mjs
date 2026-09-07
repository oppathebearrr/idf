import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { presetRuntime } from "./preset-runtime.mjs";
import { persistentRulesRuntime } from "./persistent-rules-runtime.mjs";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const artifactDir = path.resolve(currentDir, "..");
const extensionDir = path.join(artifactDir, "extension-source");
const publicDownloadsDir = path.join(artifactDir, "public", "downloads");
const tempDir = path.join(artifactDir, ".extension-package");
const unpackedDir = path.join(tempDir, "unpacked");
const packageJson = JSON.parse(
  await readFile(path.join(extensionDir, "package.json"), "utf8"),
);
const version = packageJson.version;
const upstreamZipName = `inspect-css-chrome-v${version}.zip`;
const zipName = "SecurityInspectv1.zip";
const destination = path.join(
  publicDownloadsDir,
  zipName,
);
const staleDestinations = [
  path.join(publicDownloadsDir, "security-inspection-chrome.zip"),
  path.join(publicDownloadsDir, "inspect-css-chrome.zip"),
];
const releaseHost = "https://github.com";
const releaseOwner = "Kholid060";
const releaseProject = "inspect-css";
const releaseUrl = `${releaseHost}/${releaseOwner}/${releaseProject}/releases/download/v${version}/${upstreamZipName}`;

await mkdir(publicDownloadsDir, { recursive: true });
await rm(destination, { force: true });
await Promise.all(
  staleDestinations.map((staleDestination) =>
    rm(staleDestination, { force: true }),
  ),
);
await rm(tempDir, { recursive: true, force: true });
await mkdir(unpackedDir, { recursive: true });

const upstreamArchive = path.join(tempDir, "upstream.zip");

const download = spawnSync(
  "curl",
  [
    "-L",
    "--fail",
    "--silent",
    "--show-error",
    releaseUrl,
    "-o",
    upstreamArchive,
  ],
  { stdio: "inherit" },
);

if (download.status !== 0) {
  throw new Error(
    `Unable to download the upstream Chrome package from ${releaseUrl}`,
  );
}

const unpack = spawnSync("unzip", ["-q", upstreamArchive, "-d", unpackedDir], {
  stdio: "inherit",
});

if (unpack.status !== 0) {
  throw new Error("Unable to unpack the upstream Chrome package.");
}

async function patchContentEntry() {
  const contentEntryPath = path.join(
    unpackedDir,
    "src",
    "pages",
    "content",
    "index.js",
  );
  const contentEntry = await readFile(contentEntryPath, "utf8");
  if (!contentEntry.includes("assets/js/index.")) {
    throw new Error("Unsupported Inspect CSS content entry format.");
  }

  await writeFile(contentEntryPath, `${contentEntry}\n${presetRuntime}`);
}

async function patchPersistentRulesEntry() {
  await writeFile(
    path.join(
      unpackedDir,
      "src",
      "pages",
      "content",
      "persistent-rules.js",
    ),
    persistentRulesRuntime,
  );
}

async function patchManifest() {
  const manifestPath = path.join(unpackedDir, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const contentScripts = Array.isArray(manifest.content_scripts)
    ? manifest.content_scripts
    : [];
  const alreadyRegistered = contentScripts.some((entry) =>
    Array.isArray(entry?.js) &&
    entry.js.includes("src/pages/content/persistent-rules.js"),
  );

  if (!alreadyRegistered) {
    contentScripts.push({
      matches: ["<all_urls>"],
      js: ["src/pages/content/persistent-rules.js"],
      run_at: "document_start",
    });
  }

  manifest.content_scripts = contentScripts;
  manifest.action = {
    ...(manifest.action && typeof manifest.action === "object"
      ? manifest.action
      : {}),
    default_popup: "popup.html",
  };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function patchContentBundle() {
  const assetFiles = await readdir(path.join(unpackedDir, "assets", "js"));
  const bundleName = assetFiles.find((file) => /^index\..+\.js$/.test(file));
  if (!bundleName) {
    throw new Error("Unable to find the Inspect CSS content bundle.");
  }

  const bundlePath = path.join(unpackedDir, "assets", "js", bundleName);
  const bundle = await readFile(bundlePath, "utf8");
  const originalParser =
    'function Tz(n,e){const t={rules:[]},r=(s,o=null)=>{let a;const l=s.selectorText.split(/,(?![^(]*\\))/).find(f=>{const p=f.trim().replace(Az,d=>(a=d,""));try{return n.matches(p)}catch{return!1}});if(!l||o&&!window.matchMedia(o))return;const c=Mw(s.cssText).trim(),u=Qz(l),h=+(u.A.toString()+u.B.toString()+u.C.toString());t.rules.push({pseudo:a,specificity:h,selector:l.trim(),cssText:c,properties:Iw(c)})};return e instanceof CSSStyleRule?r(e):([...e.cssRules].forEach(s=>{s instanceof CSSStyleRule&&r(s,e.conditionText)}),t.mediaCondition=e.conditionText),t}';
  const patchedParser =
    'function Tz(n,e){const t={rules:[]},r=(s,o=null)=>{try{let a;const l=s.selectorText.split(/,(?![^(]*\\))/).find(f=>{a=void 0;const p=f.trim().replace(Az,d=>(a=d,""));try{return n.matches(p)}catch{return!1}});if(!l)return;let i=!0;if(o)try{i=window.matchMedia(o).matches}catch{return}if(!i)return;const c=Mw(s.cssText).trim(),u=Qz(l),h=+(u.A.toString()+u.B.toString()+u.C.toString());t.rules.push({pseudo:a,specificity:h,selector:l.trim(),cssText:c,properties:Iw(c)})}catch(i){console.warn("[Inspect CSS] Could not parse a selector; skipping the CSS rule.",i)}};if(e instanceof CSSStyleRule)r(e);else{let s;try{s=e.cssRules}catch(o){return t}for(const o of s)o instanceof CSSStyleRule&&r(o,e.conditionText);t.mediaCondition=e.conditionText}return t}';
  const originalClass =
    'const Rz=6e4;class Ez{constructor(){Zo(this,"lastRetrievedRules",null);Zo(this,"_rules",[]);Zo(this,"_keyframeRules",{})}get rules(){if(!this.lastRetrievedRules||Date.now()-this.lastRetrievedRules<Rz){this._rules=[],this._keyframeRules={};const e=t=>t instanceof HTMLElement?t.id==="inspect-css-style"||t.hasAttribute(Ve.customStyle):!1;for(const t of document.styleSheets)try{if(t.disabled||e(t.ownerNode))continue;for(const r of t.cssRules)r instanceof CSSKeyframesRule?this._keyframeRules[r.name]={name:r.name,cssText:Mw(r.cssText)}:(r instanceof CSSStyleRule||r instanceof CSSMediaRule)&&this._rules.push(r)}catch(r){console.error(r)}this.lastRetrievedRules=Date.now()}return this._rules}getAppliedRules(e){const t=[],r=[],s=[],o=new Map;for(const h of this.rules){const f=Tz(e,h);if(f.mediaCondition){if(f.rules.length<=0)continue;const p=o.get(f.mediaCondition);typeof p=="number"?r[p].rules.push(...f.rules):r.push(f),o.set(f.mediaCondition,r.length-1)}else t.push(...f.rules)}const a=e.getAttribute("style");a&&t.push({selector:"",specificity:1e3,cssText:a,properties:Iw(a)});const l=t.sort((h,f)=>h.specificity>f.specificity?-1:1),c=T0(e,l,this._keyframeRules);s.push(...c.animation);const u=r.map(h=>{const f=h.rules.sort((p,d)=>p.specificity>d.specificity?-1:1);return T0(e,f,this._keyframeRules,h.mediaCondition)});return{...c,animation:s,media:u.reverse()}}destroy(){this._rules=[]}}';
  const patchedClass =
    'const Rz=6e4;class Ez{constructor(){Zo(this,"lastRetrievedRules",null);Zo(this,"_rules",[]);Zo(this,"_keyframeRules",{})}get rules(){if(!this.lastRetrievedRules||Date.now()-this.lastRetrievedRules>=Rz){this._rules=[],this._keyframeRules={};const e=t=>t instanceof HTMLElement?t.id==="inspect-css-style"||t.hasAttribute(Ve.customStyle):!1;for(const t of document.styleSheets){if(t.disabled||e(t.ownerNode))continue;let r;try{r=t.cssRules}catch(s){continue}for(const o of r)try{o instanceof CSSKeyframesRule?this._keyframeRules[o.name]={name:o.name,cssText:Mw(o.cssText)}:(o instanceof CSSStyleRule||o instanceof CSSMediaRule)&&this._rules.push(o)}catch(s){console.warn("[Inspect CSS] Could not read a CSS rule; skipping it.",s)}}this.lastRetrievedRules=Date.now()}return this._rules}getAppliedRules(e){const t=[],r=[],s=[],o=new Map;for(const h of this.rules){try{const f=Tz(e,h);if(f.mediaCondition){if(f.rules.length<=0)continue;const p=o.get(f.mediaCondition);typeof p=="number"?r[p].rules.push(...f.rules):r.push(f),o.set(f.mediaCondition,r.length-1)}else t.push(...f.rules)}catch(f){console.warn("[Inspect CSS] Could not parse a CSS rule for the selected element; skipping it.",f)}}const a=e.getAttribute("style");a&&t.push({selector:"",specificity:1e3,cssText:a,properties:Iw(a)});const l=t.sort((h,f)=>h.specificity>f.specificity?-1:1),c=T0(e,l,this._keyframeRules);s.push(...c.animation);const u=r.map(h=>{const f=h.rules.sort((p,d)=>p.specificity>d.specificity?-1:1);return T0(e,f,this._keyframeRules,h.mediaCondition)});return{...c,animation:s,media:u.reverse()}}destroy(){this._rules=[],this._keyframeRules={},this.lastRetrievedRules=null}}';

  if (!bundle.includes(originalParser) || !bundle.includes(originalClass)) {
    throw new Error(
      `Unsupported Inspect CSS content bundle format in ${bundleName}; refusing to create an unpatched download.`,
    );
  }

  const patchedBundle = bundle
    .replace(originalParser, patchedParser)
    .replace(originalClass, patchedClass);

  const originalSelectionLogic =
    'function f(O){u==null||u.removeAttribute(Ve.selected),u=O,u.setAttribute(Ve.selected,"true"),Qi.emit("content:el-selected",{el:O,properties:a.value})}function p(O,b=!1){var v;O!==h&&(O.setAttribute(Ve.hover,""),h==null||h.removeAttribute(Ve.hover),b&&((v=t.value)==null||v.updateNavigation(O)),a.value=yh(O).getAll(),h=O)}function d({clientX:O,clientY:b,target:v}){if(r.state.paused||r.state.tempHide||document.body.hasAttribute(Ve.dragging))return;l.value={getBoundingClientRect:I2(O,b)};let x;if(r.state.interactive?x=v:x=document.elementsFromPoint(O,b)[1],!x||s.value===x||r.shadowRoot.host===x){h==null||h.removeAttribute(Ve.hover),h=null,a.value=null;return}x!==h&&p(x,!0)}function m(O){var b;if(!(r!=null&&r.state.paused||document.activeElement===r.shadowRoot.host))switch(O.code){case"Space":{h&&(O.preventDefault(),O.stopPropagation(),f(h));break}case"ArrowUp":case"ArrowDown":case"ArrowLeft":case"ArrowRight":O.preventDefault(),O.stopPropagation(),(b=t.value)==null||b.navigate(e[O.code]);break}}function g(){h&&f(h)}';
  const patchedSelectionLogic =
    'function L(O){return!!O&&O!==s.value&&O!==r.shadowRoot.host&&!r.shadowRoot.contains(O)&&O.id!=="inspect-css-root"&&!O.hasAttribute("data-security-inspection-rule-id")&&!(O instanceof Element&&O.closest("#inspect-css-preset-menu"))}function q(O,b,v){if(r.state.interactive)return v instanceof Element&&L(v)?v:null;return document.elementsFromPoint(O,b).find(L)||null}function f(O){if(!L(O))return;u==null||u.removeAttribute(Ve.selected),h==null||h.removeAttribute(Ve.hover),u=O,h=O,O.setAttribute(Ve.selected,"true"),a.value=yh(O).getAll(),t.value==null||t.value.updateNavigation(O),Qi.emit("content:el-selected",{el:O,properties:a.value})}function p(O,b=!1){var v;if(!L(O)||O===h)return;O.setAttribute(Ve.hover,""),h==null||h.removeAttribute(Ve.hover),b&&((v=t.value)==null||v.updateNavigation(O)),a.value=yh(O).getAll(),h=O}function d({clientX:O,clientY:b,target:v}){if(r.state.paused||r.state.tempHide||document.body.hasAttribute(Ve.dragging))return;l.value={getBoundingClientRect:I2(O,b)};const x=q(O,b,v);if(!x){h==null||h.removeAttribute(Ve.hover),h=null,a.value=null;return}x!==h&&p(x,!0)}function m(O){var b;if(!(r!=null&&r.state.paused||document.activeElement===r.shadowRoot.host))switch(O.code){case"Space":{h&&(O.preventDefault(),O.stopPropagation(),f(h));break}case"ArrowUp":case"ArrowDown":case"ArrowLeft":case"ArrowRight":O.preventDefault(),O.stopPropagation(),(b=t.value)==null||b.navigate(e[O.code]);break}}function g(O){if(r.state.paused||r.state.tempHide)return;const b=q(O.clientX,O.clientY,O.target);b&&f(b)}';

  if (!patchedBundle.includes(originalSelectionLogic)) {
    throw new Error(
      "Unsupported Inspect CSS selection bundle format; refusing to create an unpatched download.",
    );
  }

  const originalInspectorRender =
    'Y(e).paused?kt("",!0):(ee(),Ce(lj,{key:0})),ce(KW),ce(HL)';
  if (!patchedBundle.includes(originalInspectorRender)) {
    throw new Error(
      "Unsupported Inspect CSS app shell format; refusing to create an unpatched download.",
    );
  }

  const originalUiInitListener =
    'Ys.runtime.onMessage.addListener(n=>{(n==null?void 0:n.type)==="init"&&z1()});';
  const patchedUiInitListener =
    'Ys.runtime.onMessage.addListener(n=>{if((n==null?void 0:n.type)!=="init")return;z1();return{uiReady:!0}});';
  if (!patchedBundle.includes(originalUiInitListener)) {
    throw new Error(
      "Unsupported Inspect CSS UI listener format; refusing to create an unpatched download.",
    );
  }

  const interactionPatchedBundle = patchedBundle
    .replace(
      originalSelectionLogic,
      `${patchedSelectionLogic}window.addEventListener("security-inspection-open-detail",()=>Qi.emit("content:open-detail"));`,
    )
    .replace(
      originalInspectorRender,
      'Y(e).paused?kt("",!0):(ee(),Ce(lj,{key:0})),ce(HL)',
    )
    .replace(originalUiInitListener, patchedUiInitListener);
  await writeFile(bundlePath, interactionPatchedBundle);
}

await patchContentEntry();
await patchPersistentRulesEntry();
await patchContentBundle();
await patchManifest();

const backgroundScript = `async function injectContentScript(tabId, panel = "") {
  try {
    const enabled = await new Promise((resolve) => {
      chrome.storage.local.get(["content-rules"], (value) => {
        const rules = value["content-rules"];
        resolve(!(rules && typeof rules === "object" && rules.enabled === false));
      });
    });
    if (!enabled) return;

    await new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, { type: "replay-persistent-rules" }, () => {
        void chrome.runtime.lastError;
        resolve();
      });
    });
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["src/pages/content/index.js"],
    });
    if (panel) {
      await new Promise((resolve) => {
        chrome.tabs.sendMessage(
          tabId,
          { type: "open-persistent-rules" },
          () => {
            void chrome.runtime.lastError;
            resolve();
          },
        );
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(\`Inspect CSS could not attach to tab \${tabId}: \${message}\`);
  }
}

chrome.action.onClicked.addListener((tab) => {
  if (typeof tab.id !== "number") return;
  const isBrowserOwnedPage =
    !tab.url ||
    !/^(https?|file):/i.test(tab.url) ||
    /^(https?:\\/\\/)?(chromewebstore\\.google\\.com|chrome\\.google\\.com\\/webstore)/i.test(
      tab.url,
    );
  if (isBrowserOwnedPage) {
    console.warn(
      "Inspect CSS cannot run on browser-controlled pages. Open a normal website first.",
    );
    return;
  }
  injectContentScript(tab.id);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "open-inspector") {
    const tabId =
      typeof message.tabId === "number" ? message.tabId : sender.tab?.id;
    if (typeof tabId !== "number") {
      sendResponse({ opened: false });
      return;
    }
    injectContentScript(tabId, message.panel === "rules" ? "rules" : "")
      .then(() => sendResponse({ opened: true }))
      .catch(() => sendResponse({ opened: false }));
    return true;
  }

  if (message?.name !== "background:screenshot-tab") return;
  if (!sender.tab?.windowId) {
    sendResponse("");
    return;
  }
  chrome.tabs
    .captureVisibleTab(sender.tab.windowId, { quality: 70 })
    .then(sendResponse);
  return true;
});

console.log("background loaded");
`;

await writeFile(
  path.join(unpackedDir, "src", "pages", "background", "index.js"),
  backgroundScript,
);

await copyFile(
  path.join(artifactDir, "public", "security-inspection-seal.png"),
  path.join(unpackedDir, "icon-128.png"),
);
await copyFile(
  path.join(artifactDir, "public", "security-inspection-seal.png"),
  path.join(unpackedDir, "icon-34.png"),
);
await copyFile(
  path.join(extensionDir, "public", "popup.html"),
  path.join(unpackedDir, "popup.html"),
);
await copyFile(
  path.join(extensionDir, "public", "popup.js"),
  path.join(unpackedDir, "popup.js"),
);
await copyFile(
  path.join(extensionDir, "public", "_locales", "en", "messages.json"),
  path.join(unpackedDir, "_locales", "en", "messages.json"),
);

const archive = spawnSync("zip", ["-q", "-r", destination, "."], {
  cwd: unpackedDir,
  stdio: "inherit",
});

if (archive.status !== 0) {
  throw new Error("Unable to create the patched Chrome package.");
}

await rm(tempDir, { recursive: true, force: true });
console.log(`Prepared ${zipName} from the upstream Security Inspection release.`);
