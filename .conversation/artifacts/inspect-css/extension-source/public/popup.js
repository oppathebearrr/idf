const STORAGE_KEY = "content-rules";

const globalToggle = document.querySelector("#global-toggle");
const openInspectorButton = document.querySelector("#open-inspector");

let activeTab = null;

function normalizeLibrary(value) {
  const input = value && typeof value === "object" ? value : {};
  const rules = Array.isArray(input.rules) ? input.rules : [];
  const siteSettings =
    input.siteSettings && typeof input.siteSettings === "object"
      ? input.siteSettings
      : {};
  return {
    enabled: input.enabled !== false,
    rules,
    siteSettings,
  };
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  return tabs[0] || null;
}

async function loadState() {
  activeTab = await getActiveTab();

  const stored = await chrome.storage.local.get([STORAGE_KEY]);
  const library = normalizeLibrary(stored[STORAGE_KEY]);

  globalToggle.checked = library.enabled;
  openInspectorButton.disabled = !library.enabled;
}

async function updateStorage(mutator) {
  const stored = await chrome.storage.local.get([STORAGE_KEY]);
  const library = normalizeLibrary(stored[STORAGE_KEY]);
  mutator(library);
  await chrome.storage.local.set({ [STORAGE_KEY]: library });
  await loadState();
}

globalToggle.addEventListener("change", () => {
  updateStorage(
    (library) => {
      library.enabled = globalToggle.checked;
    },
  ).catch(() => {
    globalToggle.checked = !globalToggle.checked;
    openInspectorButton.disabled = !globalToggle.checked;
  });
});

async function openInspector() {
  if (!globalToggle.checked || !activeTab?.id) {
    return;
  }
  try {
    await chrome.runtime.sendMessage({
      type: "open-inspector",
      tabId: activeTab.id,
    });
    window.close();
  } catch (_error) {
    openInspectorButton.disabled = true;
  }
}

document
  .querySelector("#open-inspector")
  .addEventListener("click", () => openInspector());

loadState().catch(() => {
  globalToggle.checked = false;
  openInspectorButton.disabled = true;
});