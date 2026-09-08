import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import Browser from 'webextension-polyfill';

reloadOnUpdate('pages/background');

async function injectContentScript(tabId: number, panel = '') {
  try {
    const stored = await Browser.storage.local.get('content-rules');
    const rules = stored['content-rules'];
    if (
      rules &&
      typeof rules === 'object' &&
      'enabled' in rules &&
      rules.enabled === false
    ) {
      return;
    }

    await new Promise<void>((resolve) => {
      Browser.tabs
        .sendMessage(tabId, { type: 'replay-persistent-rules' })
        .then(() => resolve())
        .catch(() => resolve());
    });

    await Browser.scripting.executeScript({
      target: { tabId },
      files: ['src/pages/content/index.js'],
    });
    if (panel) {
      await Browser.tabs.sendMessage(tabId, {
        type: 'open-persistent-rules',
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Security Inspection could not attach to tab ${tabId}: ${message}`);
  }
}

Browser.action.onClicked.addListener((tab) => {
  if (typeof tab.id !== 'number') return;

  const isBrowserOwnedPage =
    !tab.url ||
    !/^(https?|file):/i.test(tab.url) ||
    /^(https?:\/\/)?(chromewebstore\.google\.com|chrome\.google\.com\/webstore)/i.test(
      tab.url,
    );

  if (isBrowserOwnedPage) {
    console.warn(
      'Security Inspection cannot run on browser-controlled pages. Open a normal website first.',
    );
    return;
  }

  injectContentScript(tab.id);
});

// DEV ONLY
if (import.meta.env.MODE === 'development') {
  Browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (!changeInfo.status || changeInfo.status !== 'complete') return;

    Browser.tabs.get(tabId).then((tab) => {
      if (!tab.url || !tab.url.includes('localhost')) return;

      injectContentScript(tabId);
    });
  });
}

Browser.runtime.onMessage.addListener((message, sender) => {
  if (message?.type === 'open-inspector') {
    const tabId =
      typeof message.tabId === 'number' ? message.tabId : sender.tab?.id;
    if (typeof tabId !== 'number') return Promise.resolve(false);
    return injectContentScript(tabId, message.panel === 'rules' ? 'rules' : '').then(
      () => true,
    );
  }

  if (
    typeof message !== 'object' ||
    message === null ||
    !('name' in message) ||
    message.name !== 'background:screenshot-tab'
  ) {
    return undefined;
  }

  if (!sender.tab?.windowId) return Promise.resolve('');

  return Browser.tabs.captureVisibleTab(sender.tab.windowId, { quality: 70 });
});

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */

console.log('background loaded');
