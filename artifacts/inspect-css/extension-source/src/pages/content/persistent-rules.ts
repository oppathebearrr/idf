import {
  loadContentRuleLibrary,
  startContentRuleReplay,
} from '@root/src/utils/content-rules';

let stopReplay: (() => void) | undefined;

async function initializePersistentRules() {
  stopReplay?.();
  const library = await loadContentRuleLibrary();
  stopReplay = await startContentRuleReplay(library);
}

if (document.documentElement) {
  void initializePersistentRules();
} else {
  document.addEventListener(
    'DOMContentLoaded',
    () => void initializePersistentRules(),
    { once: true },
  );
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local' || !changes['content-rules']) return;
  void initializePersistentRules();
});

chrome.runtime.onMessage.addListener(
  (
    message: { type?: string },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void,
  ) => {
    if (message?.type === 'replay-persistent-rules') {
      void initializePersistentRules().then(() =>
        sendResponse({ persistentReplayed: true }),
      );
      return true;
    }

    if (message?.type !== 'init') return;
    sendResponse({ persistentOnly: true });
  },
);