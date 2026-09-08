export const persistentRulesRuntime = String.raw`
(() => {
  if (globalThis.__securityInspectionPersistentRules) return;
  globalThis.__securityInspectionPersistentRules = true;

  const STORAGE_KEY = 'content-rules';
  const RULE_ATTR = 'data-security-inspection-rule-id';
  const TEXT_RULE_ATTR = 'data-security-inspection-text-rule-id';
   const RULES_VERSION = 3;

  const pageKey = () => window.location.origin + window.location.pathname;
  const siteKey = () => window.location.origin;

  const sanitizeElement = (element) => {
    const clone = element.cloneNode(true);
    clone
      .querySelectorAll('script,iframe,object,embed,portal,base')
      .forEach((node) => node.remove());
    [clone, ...clone.querySelectorAll('*')].forEach((node) => {
      [...node.attributes].forEach((attribute) => {
        const name = attribute.name.toLowerCase();
        const value = attribute.value.trim();
        if (
          name.startsWith('on') ||
          name === 'srcdoc' ||
          name.startsWith('inspect-css-') ||
           name === RULE_ATTR ||
           name === TEXT_RULE_ATTR
        ) {
          node.removeAttribute(attribute.name);
        } else if (
          ['href', 'src', 'action', 'formaction', 'poster'].includes(name) &&
          /^javascript:/i.test(value)
        ) {
          node.removeAttribute(attribute.name);
        }
      });
    });
    return clone;
  };

  const safeHTML = (html) => {
    const template = document.createElement('template');
    template.innerHTML = html;
    const first = template.content.firstElementChild;
    return first ? sanitizeElement(first).outerHTML : '';
  };

  const uniqueClone = (element) => {
    const clone = sanitizeElement(element);
    const ids = new Map();
    const nodes = [
      ...(clone.matches('[id]') ? [clone] : []),
      ...clone.querySelectorAll('[id]'),
    ];
    nodes.forEach((node) => {
      const original = node.getAttribute('id');
      if (!original) return;
      let next = original + '-copy';
      let index = 2;
      while (document.getElementById(next) || ids.has(next)) {
        next = original + '-copy-' + index;
        index += 1;
      }
      ids.set(original, next);
      node.setAttribute('id', next);
    });

    const tokenReferenceAttributes = new Set([
      'aria-controls',
      'aria-describedby',
      'aria-details',
      'aria-flowto',
      'aria-labelledby',
      'aria-owns',
      'headers',
      'itemref',
    ]);
    const selectorReferenceAttributes = new Set([
      'data-accordion-target',
      'data-content-target',
      'data-controls',
      'data-target',
      'data-toggle-target',
      'data-bs-target',
    ]);
    const rewriteReference = (name, value) => {
      const normalizedName = name.toLowerCase();
      if (normalizedName === 'for' || tokenReferenceAttributes.has(normalizedName)) {
        return value
          .split(/\s+/)
          .map((token) => ids.get(token) || token)
          .join(' ');
      }
      if (
        normalizedName === 'href' ||
        normalizedName === 'xlink:href' ||
        selectorReferenceAttributes.has(normalizedName)
      ) {
        let nextValue = value;
        ids.forEach((replacement, original) => {
          nextValue = nextValue.replaceAll('#' + original, '#' + replacement);
          if (nextValue === original) nextValue = replacement;
        });
        return nextValue;
      }
      return value;
    };

    [clone, ...clone.querySelectorAll('*')].forEach((node) => {
      [...node.attributes].forEach((attribute) => {
        const nextValue = rewriteReference(attribute.name, attribute.value);
        if (nextValue !== attribute.value) {
          node.setAttribute(attribute.name, nextValue);
        }
      });
    });
    return clone;
  };

  const getElementAtPath = (root, path) =>
    path.reduce(
      (current, index) => (current ? current.children[index] : null),
      root,
    );
   const getElementTextSignature = (element) => {
     const text = (element.textContent || '').replace(/\s+/g, ' ').trim();
     let hash = 2166136261;
     for (let index = 0; index < text.length; index += 1) {
       hash ^= text.charCodeAt(index);
       hash = Math.imul(hash, 16777619);
     }
     return text.length + ':' + (hash >>> 0);
   };
  const getTextNodeAtPath = (root, path) => {
    const target = path.reduce(
      (current, index) => (current ? current.childNodes[index] : null),
      root,
    );
    return target && target.nodeType === Node.TEXT_NODE ? target : null;
  };
  const applyTextContentPreservingStructure = (element, content, textPath) => {
    const preferredTextNode = Array.isArray(textPath)
      ? getTextNodeAtPath(element, textPath)
      : null;
    const directTextNodes = Array.from(element.childNodes).filter(
      (node) => node.nodeType === Node.TEXT_NODE && Boolean(node.textContent && node.textContent.trim()),
    );
    const textNode = preferredTextNode || directTextNodes[0];
    if (textNode) {
      textNode.textContent = content;
      return;
    }
    const textTarget =
      Array.from(element.querySelectorAll('*')).find(
        (child) =>
          child.children.length === 0 &&
          Boolean(child.textContent && child.textContent.trim()),
      ) || element;
    textTarget.textContent = content;
  };

  const extensionOwned = (element) =>
    element.id === 'inspect-css-root' ||
    element.hasAttribute(RULE_ATTR) ||
    Boolean(element.closest('#inspect-css-root'));
  const normalizeDuplicatePlacement = (clone, original) => {
    const cloneRect = clone.getBoundingClientRect();
    const originalRect = original.getBoundingClientRect();
    const cloneArea = cloneRect.width * cloneRect.height;
    const originalArea = originalRect.width * originalRect.height;
    if (!cloneArea || !originalArea) return;
    const overlapWidth = Math.max(
      0,
      Math.min(cloneRect.right, originalRect.right) -
        Math.max(cloneRect.left, originalRect.left),
    );
    const overlapHeight = Math.max(
      0,
      Math.min(cloneRect.bottom, originalRect.bottom) -
        Math.max(cloneRect.top, originalRect.top),
    );
    if (
      overlapWidth * overlapHeight <
      Math.min(cloneArea, originalArea) * 0.8
    ) {
      return;
    }
    clone.style.setProperty('position', 'relative', 'important');
    clone.style.setProperty('inset', 'auto', 'important');
    clone.style.setProperty('top', 'auto', 'important');
    clone.style.setProperty('right', 'auto', 'important');
    clone.style.setProperty('bottom', 'auto', 'important');
    clone.style.setProperty('left', 'auto', 'important');
    clone.style.setProperty('transform', 'none', 'important');
    clone.style.setProperty('grid-area', 'auto', 'important');
    clone.style.setProperty('grid-column', 'auto', 'important');
    clone.style.setProperty('grid-row', 'auto', 'important');
  };

  const findAnchor = (rule) => {
    let candidates = [];
    try {
      candidates = Array.from(document.querySelectorAll(rule.selector));
    } catch (_error) {
      return null;
    }
     const matchingCandidates = candidates.filter(
       (element) =>
         (rule.mode === 'text' || !extensionOwned(element)) &&
         element.tagName.toLowerCase() === rule.anchorTagName,
     );
     if (rule.mode === 'duplicate' && rule.anchorTextSignature) {
       return (
         matchingCandidates.find(
           (element) =>
             getElementTextSignature(element) === rule.anchorTextSignature,
         ) || null
       );
     }
     return matchingCandidates[0] || null;
  };

  const applyRule = (rule) => {
    const ruleAttr = rule.mode === 'text' ? TEXT_RULE_ATTR : RULE_ATTR;
    const alreadyInjected = Array.from(
      document.querySelectorAll('[' + ruleAttr + ']'),
    ).some((element) => element.getAttribute(ruleAttr) === rule.id);
    if (alreadyInjected) return false;

    const anchor = findAnchor(rule);
    if (!anchor) return false;
    if (rule.mode === 'text') {
      const target = getElementAtPath(anchor, rule.targetPath || []);
      if (!target) return false;
      applyTextContentPreservingStructure(target, rule.content, rule.textPath);
      anchor.setAttribute(TEXT_RULE_ATTR, rule.id);
      return true;
    }
    if (!anchor.parentElement) return false;

    const clone = uniqueClone(anchor);
    clone.setAttribute(RULE_ATTR, rule.id);
    anchor.parentElement.insertBefore(clone, anchor);
    normalizeDuplicatePlacement(clone, anchor);
    if (rule.mode === 'duplicate') return true;
    const target = getElementAtPath(clone, rule.targetPath || []);
    if (!target) {
      clone.remove();
      return false;
    }

    const template = document.createElement('template');
    template.innerHTML = safeHTML(rule.content);
    const replacement = template.content.firstElementChild;
    if (!replacement) {
      clone.remove();
      return false;
    }

    replacement.setAttribute(RULE_ATTR, rule.id);
    if (rule.blockMode === 'replace') {
      target.replaceWith(replacement);
    } else {
      target.insertAdjacentElement('afterend', replacement);
    }
    return true;
  };

  const normalize = (value) => {
    const input = value && typeof value === 'object' ? value : {};
    const storedVersion =
      typeof input.version === 'number' ? input.version : 0;
    const rules = Array.isArray(input.rules)
      ? input.rules.filter(
          (rule) =>
            rule &&
            typeof rule.id === 'string' &&
            typeof rule.pageKey === 'string' &&
            typeof rule.siteKey === 'string' &&
            typeof rule.selector === 'string' &&
            typeof rule.anchorTagName === 'string' &&
            (rule.mode === 'text' ||
              rule.mode === 'block' ||
              rule.mode === 'duplicate') &&
            (rule.blockMode === 'replace' || rule.blockMode === 'insert') &&
            typeof rule.content === 'string' &&
             (storedVersion >= 2 || rule.mode !== 'text') &&
             (storedVersion >= RULES_VERSION ||
               rule.mode !== 'duplicate' ||
               typeof rule.anchorTextSignature === 'string'),
        )
      : [];
    const siteSettings =
      input.siteSettings && typeof input.siteSettings === 'object'
        ? Object.fromEntries(
            Object.entries(input.siteSettings).filter(
              ([key, enabled]) =>
                typeof key === 'string' && typeof enabled === 'boolean',
            ),
          )
        : {};
    return {
      version: RULES_VERSION,
      enabled: input.enabled !== false,
      siteSettings,
      rules,
    };
  };

  let ruleObserver = null;
  let ruleObserverTimeout = null;
  let library = normalize({});

  const replay = () => {
    if (!library.enabled || library.siteSettings[siteKey()] === false) return;
    library.rules
      .filter(
        (rule) =>
          rule.enabled &&
          rule.pageKey === pageKey() &&
          rule.siteKey === siteKey(),
      )
      .forEach(applyRule);
  };

  const initialize = () => {
    chrome.storage.local.get([STORAGE_KEY], (value) => {
      library = normalize(value[STORAGE_KEY]);
      ruleObserver?.disconnect();
      if (ruleObserverTimeout) window.clearTimeout(ruleObserverTimeout);
      replay();

      ruleObserver = new MutationObserver(replay);
      ruleObserver.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
      ruleObserverTimeout = window.setTimeout(() => {
        ruleObserver?.disconnect();
        ruleObserver = null;
        ruleObserverTimeout = null;
      }, 30000);
    });
  };

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !changes[STORAGE_KEY]) return;
    library = normalize(changes[STORAGE_KEY].newValue);
    replay();
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'replay-persistent-rules') {
      initialize();
      sendResponse({ persistentReplayed: true });
      return;
    }
    if (message?.type !== 'init') return;
    sendResponse({ persistentOnly: true });
  });

  if (document.documentElement) initialize();
  else document.addEventListener('DOMContentLoaded', initialize, { once: true });
})();
`;