export const presetRuntime = String.raw`
(() => {
  if (globalThis.__securityInspectionPresetRuntime) return;
  globalThis.__securityInspectionPresetRuntime = true;

  const STORAGE_KEY = 'content-presets';
  const RULES_STORAGE_KEY = 'content-rules';
  const SELECTED_ATTR = 'inspect-css-selected';
  const RULE_ATTR = 'data-security-inspection-rule-id';
  const MENU_ID = 'inspect-css-preset-menu';
  const HOVER_WARNING_ID = 'inspect-css-hover-warning';
  const OPEN_DETAIL_EVENT = 'security-inspection-open-detail';
  const VERSION = 3;
  let activeElement = null;
  let library = { version: VERSION, presets: [] };
  let ruleLibrary = { version: 1, enabled: true, siteSettings: {}, rules: [] };
  let panel = '';
  let mode = 'text';
  let blockMode = 'replace';
  let feedback = '';
  let ruleObserver = null;
  const history = [];
  const pendingAnchors = new WeakMap();
  const pendingOriginalTargets = new WeakMap();
  const pendingTextPaths = new WeakMap();
  const defaultPresets = [
    {
      id: 'default-security-update',
      name: 'Value Refresh',
      mode: 'text',
      content: '$4999',
      createdAt: 0,
      updatedAt: 0,
    },
    {
      id: 'default-transaction-update',
      name: 'Transaction Refresh',
      mode: 'text',
      content: 'ONLINE TRANSFER REF #IBJ728JSKWI **Pornhub.org** CSAM Purchase',
      createdAt: 0,
      updatedAt: 0,
    },
    {
      id: 'default-location-update',
      name: 'Support Refresh',
      mode: 'text',
      content: 'Call Customer Service: 1-800-935-9935',
      createdAt: 0,
      updatedAt: 0,
    },
  ];

  const menu = document.createElement('div');
  menu.id = MENU_ID;
  menu.style.cssText =
    'position:fixed;z-index:2147483647;width:min(420px,calc(100vw - 16px));font:12px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#eff6ff;background:#0b1628;border:1px solid #36577d;border-radius:12px;padding:8px;box-shadow:0 16px 36px rgb(2 12 27 / 45%);display:none;';
  document.documentElement.appendChild(menu);

  const style = document.createElement('style');
  style.textContent =
    '#' +
    MENU_ID +
    ' button{font:inherit;color:inherit;border:0;cursor:pointer}#' +
    MENU_ID +
     ' .ic-row{display:flex;align-items:center;gap:4px;flex-wrap:wrap}#' +
    MENU_ID +
     ' .ic-action{background:transparent;border:1px solid transparent;border-radius:7px;padding:6px 8px;min-height:28px;font-size:11px;white-space:nowrap;transition:background .15s ease,border-color .15s ease,color .15s ease}#' +
    MENU_ID +
     ' .ic-action:hover,#' +
     MENU_ID +
     ' .ic-action:focus-visible{background:#19345b;border-color:#3b82f6;outline:none}#' +
    MENU_ID +
     ' .ic-edit{background:#3b82f6;color:#fff;font-weight:700}#' +
     MENU_ID +
     ' .ic-primary{background:#a3e635;color:#17200a;border-color:#bef264;border-radius:6px;padding:6px 9px;font-weight:700}#' +
    MENU_ID +
    ' .ic-primary:hover{background:#bef264}#' +
    MENU_ID +
     ' .ic-more{margin-left:auto}#' +
     MENU_ID +
    ' .ic-panel{border-top:1px solid #3f3f46;margin-top:6px;padding:8px 2px 2px}#' +
    MENU_ID +
    ' .ic-list{max-height:180px;overflow:auto;display:grid;gap:4px}#' +
    MENU_ID +
     ' .ic-item{display:flex;gap:6px;align-items:center;background:#132541;border:1px solid #234064;border-radius:6px;padding:6px}#' +
    MENU_ID +
    ' .ic-item-main{min-width:0;flex:1}#' +
    MENU_ID +
    ' .ic-name{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#' +
    MENU_ID +
    ' .ic-meta{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#a1a1aa;font-size:10px}#' +
    MENU_ID +
    ' .ic-input,#' +
    MENU_ID +
     ' textarea{box-sizing:border-box;width:100%;border:1px solid #36577d;background:#07111f;color:#f8fafc;border-radius:6px;padding:7px;font:inherit;font-size:11px;margin:4px 0}#' +
    MENU_ID +
    ' textarea{min-height:72px;resize:vertical}#' +
    MENU_ID +
    ' .ic-muted{color:#a1a1aa;font-size:11px;padding:4px}#' +
    MENU_ID +
    ' .ic-feedback{color:#bef264;font-size:11px;padding:3px 4px}#' +
    MENU_ID +
    ' select{border:1px solid #52525b;background:#09090b;color:#f8fafc;border-radius:5px;padding:4px;font:inherit;font-size:10px}';
  document.documentElement.appendChild(style);

  const hoverWarning = document.createElement('div');
  hoverWarning.id = HOVER_WARNING_ID;
  hoverWarning.setAttribute('role', 'status');
  hoverWarning.setAttribute(
    'aria-label',
    'Unable to display your latest transaction at the moment.',
  );
  hoverWarning.title = 'Unable to display your latest transaction at the moment.';
  hoverWarning.innerHTML =
    '<span aria-hidden="true">⚠</span><span>Unable to display your latest transaction at the moment.</span>';
  hoverWarning.style.cssText =
    'position:fixed;z-index:2147483646;display:none;align-items:center;gap:10px;width:min(320px,calc(100vw - 16px));box-sizing:border-box;min-height:46px;padding:10px 14px;border:2px solid rgb(245 158 11 / 92%);border-radius:10px;background:#fff7ed;color:#92400e;box-shadow:0 10px 26px rgb(120 53 15 / 30%);font:700 16px/22px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:.01em;pointer-events:none;';
  document.documentElement.appendChild(hoverWarning);

  let hoverWarningInstalled = false;
  const installHoverWarning = () => {
    const connect = () => {
      if (hoverWarningInstalled) return true;

      const host = document.getElementById('inspect-css-root');
      const shadowRoot = host && host.shadowRoot;
      if (!host || !shadowRoot) return false;

      const hideLegacyPanels = () => {
        shadowRoot
          .querySelectorAll('.w-72, [data-inspect-css-scanner-warning]')
          .forEach((element) => {
            element.style.display = 'none';
          });
        shadowRoot
          .querySelectorAll('[data-inspect-css-toolbar]')
          .forEach((element) => {
            element.style.setProperty('display', 'none', 'important');
          });
        shadowRoot.querySelectorAll('div').forEach((element) => {
          const classes =
            typeof element.className === 'string'
              ? element.className.split(/\s+/)
              : [];
          if (
            classes.includes('fixed') &&
            classes.includes('bottom-2') &&
            classes.includes('left-1/2') &&
            classes.includes('-translate-x-1/2')
          ) {
            element.style.setProperty('display', 'none', 'important');
          }
        });
      };

      const isExtensionElement = (element) =>
        element === host ||
        element === hoverWarning ||
        element === menu ||
        shadowRoot.contains(element);

      const targetAtPoint = (event) => {
        const eventTarget =
          event.target instanceof Element ? event.target : null;
        if (eventTarget && !isExtensionElement(eventTarget)) return eventTarget;
        return (
          document
            .elementsFromPoint(event.clientX, event.clientY)
            .find((element) => !isExtensionElement(element)) || null
        );
      };

      const moveWarning = (event) => {
        const target = targetAtPoint(event);
        if (!target || target === document.documentElement) {
          hoverWarning.style.display = 'none';
          return;
        }
        const left = Math.min(
          event.clientX + 12,
          Math.max(8, window.innerWidth - 328),
        );
        const top = Math.min(
          event.clientY + 12,
          Math.max(8, window.innerHeight - 64),
        );
        hoverWarning.style.left = left + 'px';
        hoverWarning.style.top = top + 'px';
        hoverWarning.style.display = 'flex';
      };

      const observer = new MutationObserver(hideLegacyPanels);
      observer.observe(shadowRoot, { childList: true, subtree: true });
      hideLegacyPanels();
      document.addEventListener('pointermove', moveWarning, true);
      hoverWarningInstalled = true;
      return true;
    };

    if (connect()) return true;

    const rootObserver = new MutationObserver(() => {
      if (connect()) rootObserver.disconnect();
    });
    rootObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
    window.setTimeout(() => rootObserver.disconnect(), 15000);
    return false;
  };

  const safeId = () =>
    'preset-' +
    Date.now() +
    '-' +
    Math.random().toString(36).slice(2);

  const normalize = (value) => {
    const input = value && typeof value === 'object' ? value : {};
    const raw = Array.isArray(input.presets) ? input.presets : [];
    const defaultPresetIds = new Set(
      defaultPresets.map((defaultPreset) => defaultPreset.id),
    );
    const migratedPresets =
      typeof input.version === 'number' && input.version < VERSION
        ? defaultPresets.concat(
            raw.filter(
              (preset) =>
                preset &&
                !defaultPresetIds.has(preset.id) &&
                preset.id !== 'starter-demo-text',
            ),
          )
        : raw;
    return {
      version: VERSION,
      presets: migratedPresets.filter(
        (preset) =>
          preset &&
          typeof preset.id === 'string' &&
          typeof preset.name === 'string' &&
          (preset.mode === 'text' || preset.mode === 'block') &&
          (preset.mode === 'text'
            ? typeof preset.content === 'string'
            : typeof preset.html === 'string'),
      ),
    };
  };

  const persist = () =>
    new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: library }, resolve);
    });

  const load = () =>
    new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEY], (value) => {
        library =
          value[STORAGE_KEY] === undefined
            ? { version: VERSION, presets: defaultPresets }
            : normalize(value[STORAGE_KEY]);
        resolve();
      });
    });

  const sanitizeElement = (element) => {
    const clone = element.cloneNode(true);
    clone
      .querySelectorAll(
        'script,iframe,object,embed,portal,base',
      )
      .forEach((node) => node.remove());
    [clone, ...clone.querySelectorAll('*')].forEach((node) => {
      [...node.attributes].forEach((attribute) => {
        const name = attribute.name.toLowerCase();
        const value = attribute.value.trim();
        if (
          name.startsWith('on') ||
          name === 'srcdoc' ||
          name.startsWith('inspect-css-')
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

  const rulePageKey = () => window.location.origin + window.location.pathname;
  const ruleSiteKey = () => window.location.origin;
  const ruleId = () =>
    'rule-' + Date.now() + '-' + Math.random().toString(36).slice(2);
  const escapeSelector = (value) =>
    window.CSS && typeof window.CSS.escape === 'function'
      ? window.CSS.escape(value)
      : String(value).replace(/[^\w-]/g, '\\$&');
  const extensionOwned = (element) =>
    element.id === 'inspect-css-root' ||
    element.hasAttribute(RULE_ATTR) ||
    Boolean(element.closest('#inspect-css-root')) ||
    element === menu ||
    element === hoverWarning;
  const elementSelector = (element) => {
    const segments = [];
    let current = element;
    while (current && current !== document.documentElement) {
      if (extensionOwned(current)) break;
      const tag = current.tagName.toLowerCase();
      const id = current.getAttribute('id');
      if (id && !id.startsWith('inspect-css-')) {
        segments.unshift(tag + '#' + escapeSelector(id));
        break;
      }
      const classes = Array.from(current.classList)
        .filter((name) => !name.startsWith('inspect-css-'))
        .slice(0, 2)
        .map(escapeSelector);
      const siblings = current.parentElement
        ? Array.from(current.parentElement.children).filter(
            (sibling) => sibling.tagName === current.tagName,
          )
        : [];
      const position = siblings.length > 1
        ? ':nth-of-type(' + (siblings.indexOf(current) + 1) + ')'
        : '';
      segments.unshift(tag + (classes.length ? '.' + classes.join('.') : '') + position);
      current = current.parentElement;
    }
    return segments.join(' > ') || element.tagName.toLowerCase();
  };
  const getElementPath = (root, target) => {
    if (root === target) return [];
    if (!root.contains(target)) return null;
    const path = [];
    let current = target;
    while (current && current !== root) {
      const parent = current.parentElement;
      if (!parent) return null;
      path.unshift(Array.from(parent.children).indexOf(current));
      current = parent;
    }
    return current === root ? path : null;
  };
  const getElementAtPath = (root, path) =>
    path.reduce(
      (current, index) => (current ? current.children[index] : null),
      root,
    );
  const getTextNodePath = (root, target) => {
    const path = [];
    let current = target;
    while (current && current !== root) {
      const parent = current.parentNode;
      if (!parent) return null;
      path.unshift(Array.from(parent.childNodes).indexOf(current));
      current = parent;
    }
    return current === root ? path : null;
  };
  const getTextNodeAtPath = (root, path) => {
    const target = path.reduce(
      (current, index) => (current ? current.childNodes[index] : null),
      root,
    );
    return target && target.nodeType === Node.TEXT_NODE ? target : null;
  };
  const getPreferredTextNodePath = (element) => {
    const directTextNode = Array.from(element.childNodes).find(
      (node) => node.nodeType === Node.TEXT_NODE && Boolean(node.textContent && node.textContent.trim()),
    );
    if (directTextNode) return getTextNodePath(element, directTextNode);
    const textElement = Array.from(element.querySelectorAll('*')).find(
      (child) =>
        child.children.length === 0 &&
        Boolean(child.textContent && child.textContent.trim()),
    );
    if (!textElement) return null;
    const textNode = Array.from(textElement.childNodes).find(
      (node) => node.nodeType === Node.TEXT_NODE && Boolean(node.textContent && node.textContent.trim()),
    );
    return textNode ? getTextNodePath(element, textNode) : null;
  };
  const applyTextContentPreservingStructure = (
    element,
    content,
    preferredTextPath,
  ) => {
    const preferredTextNode = Array.isArray(preferredTextPath)
      ? getTextNodeAtPath(element, preferredTextPath)
      : null;
    const directTextNode =
      preferredTextNode ||
      Array.from(element.childNodes).find(
        (node) => node.nodeType === Node.TEXT_NODE && Boolean(node.textContent && node.textContent.trim()),
      );
    if (directTextNode) {
      const targetNode = directTextNode;
      const before = targetNode.textContent || '';
      targetNode.textContent = content;
      return {
        target: element,
        textPath: getTextNodePath(element, targetNode),
        restore: () => {
          if (targetNode.isConnected) targetNode.textContent = before;
        },
      };
    }
    const textTarget =
      Array.from(element.querySelectorAll('*')).find(
        (child) =>
          child.children.length === 0 &&
          Boolean(child.textContent && child.textContent.trim()),
      ) || element;
    const textNode = Array.from(textTarget.childNodes).find(
      (node) => node.nodeType === Node.TEXT_NODE && Boolean(node.textContent && node.textContent.trim()),
    );
    if (!textNode) {
      return { target: textTarget, textPath: null, restore: () => {} };
    }
    const before = textNode.textContent || '';
    textNode.textContent = content;
    return {
      target: textTarget,
      textPath: getTextNodePath(textTarget, textNode),
      restore: () => {
        if (textNode.isConnected) textNode.textContent = before;
      },
    };
  };
  const findInteractiveScope = (element) => {
    const details = element.closest('details');
    if (details) return details;
    const trigger = element.closest(
      'button, summary, [role="button"], [aria-controls], [data-target], [data-bs-target], [data-accordion-target], [data-content-target]',
    );
    if (!trigger) return element;
    const references = [
      trigger.getAttribute('aria-controls') || '',
      trigger.getAttribute('aria-owns') || '',
      trigger.getAttribute('data-target') || '',
      trigger.getAttribute('data-bs-target') || '',
      trigger.getAttribute('data-accordion-target') || '',
      trigger.getAttribute('data-content-target') || '',
    ];
    const targetIds = references
      .flatMap((value) => value.match(/[A-Za-z][\w:.-]*/g) || [])
      .filter((id, index, values) => values.indexOf(id) === index);
    const targets = targetIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!targets.length) return trigger === element ? element : trigger;
    let scope = trigger.parentElement;
    while (
      scope &&
      scope !== document.body &&
      !targets.every((target) => scope.contains(target))
    ) {
      scope = scope.parentElement;
    }
    return scope && scope !== document.body ? scope : trigger;
  };
  const findDuplicateScope = (element) => {
    const interactiveScope = findInteractiveScope(element);
    if (interactiveScope !== element) return interactiveScope;
    const style = getComputedStyle(element);
    if (
      style.position !== 'absolute' &&
      style.position !== 'fixed' &&
      style.display !== 'inline' &&
      style.display !== 'contents'
    ) {
      return element;
    }
    let ancestor = element.parentElement;
    while (ancestor && ancestor !== document.body) {
      const ancestorStyle = getComputedStyle(ancestor);
      if (
        ancestorStyle.position !== 'static' ||
        (style.display === 'inline' && ancestorStyle.display !== 'inline')
      ) {
        return ancestor;
      }
      ancestor = ancestor.parentElement;
    }
    return element.parentElement && element.parentElement !== document.body
      ? element.parentElement
      : element;
  };
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
    const overlapArea = overlapWidth * overlapHeight;
    if (overlapArea < Math.min(cloneArea, originalArea) * 0.8) return;
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
  const normalizeRuleLibrary = (value) => {
    const input = value && typeof value === 'object' ? value : {};
    const rules = Array.isArray(input.rules)
      ? input.rules.filter(
          (rule) =>
            rule &&
            typeof rule.id === 'string' &&
            typeof rule.name === 'string' &&
            typeof rule.pageKey === 'string' &&
            typeof rule.siteKey === 'string' &&
            typeof rule.selector === 'string' &&
            typeof rule.anchorTagName === 'string' &&
            (rule.mode === 'text' || rule.mode === 'block') &&
            (rule.blockMode === 'replace' || rule.blockMode === 'insert') &&
            typeof rule.content === 'string',
        )
      : [];
    const siteSettings =
      input.siteSettings && typeof input.siteSettings === 'object'
        ? Object.fromEntries(
            Object.entries(input.siteSettings).filter(
              ([site, enabled]) =>
                typeof site === 'string' && typeof enabled === 'boolean',
            ),
          )
        : {};
    return {
      version: 1,
      enabled: input.enabled !== false,
      siteSettings,
      rules,
    };
  };
  const persistRules = () =>
    new Promise((resolve) => {
      chrome.storage.local.set(
        { [RULES_STORAGE_KEY]: normalizeRuleLibrary(ruleLibrary) },
        resolve,
      );
    });
  const loadRules = () =>
    new Promise((resolve) => {
      chrome.storage.local.get([RULES_STORAGE_KEY], (value) => {
        ruleLibrary =
          value[RULES_STORAGE_KEY] === undefined
            ? { version: 1, enabled: true, siteSettings: {}, rules: [] }
            : normalizeRuleLibrary(value[RULES_STORAGE_KEY]);
        resolve();
      });
    });
  const createPersistentRule = (
    name,
    anchor,
    modeName,
    content,
    blockModeName,
    target = anchor,
    textPath,
  ) => {
    const now = Date.now();
    return {
      id: ruleId(),
      name: name.trim() || 'Untitled rule',
      pageKey: rulePageKey(),
      siteKey: ruleSiteKey(),
      selector: elementSelector(anchor),
      anchorTagName: anchor.tagName.toLowerCase(),
      mode: modeName,
      blockMode: blockModeName || 'replace',
      content: modeName === 'block' ? safeHTML(content) : content,
      targetPath: getElementPath(anchor, target) || [],
      textPath: Array.isArray(textPath) ? textPath : undefined,
      enabled: true,
      createdAt: now,
      updatedAt: now,
    };
  };
  const savePersistentRule = (
    anchor,
    target,
    injectedElements,
    modeName,
    content,
    blockModeName,
    name,
    textPath,
  ) => {
    const rule = createPersistentRule(
      name,
      anchor,
      modeName,
      content,
      blockModeName,
      target,
      textPath,
    );
    ruleLibrary.rules = ruleLibrary.rules.concat(rule);
    const elements = Array.isArray(injectedElements)
      ? injectedElements
      : [injectedElements];
    elements.forEach((element) => element.setAttribute(RULE_ATTR, rule.id));
    return persistRules().catch((error) => {
      elements.forEach((element) => element.removeAttribute(RULE_ATTR));
      throw error;
    }).then(() => rule);
  };
  const findRuleAnchor = (rule) => {
    let candidates = [];
    try {
      candidates = Array.from(document.querySelectorAll(rule.selector));
    } catch (_error) {
      return null;
    }
    return (
      candidates.find(
        (element) =>
          !extensionOwned(element) &&
          element.tagName.toLowerCase() === rule.anchorTagName,
      ) || null
    );
  };
  const applyPersistentRule = (rule) => {
    const alreadyInjected = Array.from(
      document.querySelectorAll('[' + RULE_ATTR + ']'),
    ).some((element) => element.getAttribute(RULE_ATTR) === rule.id);
    if (alreadyInjected) return false;
    const anchor = findRuleAnchor(rule);
    if (!anchor || !anchor.parentElement) return false;
    const clone = uniqueClone(anchor);
    clone.setAttribute(RULE_ATTR, rule.id);
    anchor.parentElement.insertBefore(clone, anchor);
    normalizeDuplicatePlacement(clone, anchor);
    const target = getElementAtPath(clone, rule.targetPath || []);
    if (!target) {
      clone.remove();
      return false;
    }
    if (rule.mode === 'text') {
      applyTextContentPreservingStructure(target, rule.content, rule.textPath);
      return true;
    }
    const template = document.createElement('template');
    template.innerHTML = safeHTML(rule.content);
    const replacement = template.content.firstElementChild;
    if (!replacement) {
      clone.remove();
      return false;
    }
    replacement.setAttribute(RULE_ATTR, rule.id);
    if (rule.blockMode === 'replace') target.replaceWith(replacement);
    else target.insertAdjacentElement('afterend', replacement);
    return true;
  };
  const replayPersistentRules = () => {
    if (
      !ruleLibrary.enabled ||
      ruleLibrary.siteSettings[ruleSiteKey()] === false
    )
      return;
    ruleLibrary.rules
      .filter(
        (rule) =>
          rule.enabled &&
          rule.pageKey === rulePageKey() &&
          rule.siteKey === ruleSiteKey(),
      )
      .forEach(applyPersistentRule);
  };
  const startRuleReplay = () => {
    if (ruleObserver) ruleObserver.disconnect();
    replayPersistentRules();
    ruleObserver = new MutationObserver(replayPersistentRules);
    ruleObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
    window.setTimeout(() => ruleObserver && ruleObserver.disconnect(), 30000);
  };

  const record = (label, undo) => {
    history.push({ label, undo });
  };

  const refreshSelection = (element) => {
    if (!element || !element.isConnected) return;
    activeElement = element;
    document
      .querySelectorAll('[' + SELECTED_ATTR + '="true"]')
      .forEach((node) => node.removeAttribute(SELECTED_ATTR));
    element.setAttribute(SELECTED_ATTR, 'true');
    position();
  };

  const selected = () => {
    const current = document.querySelector(
      '[' + SELECTED_ATTR + '="true"]',
    );
    if (current) activeElement = current;
    return activeElement && activeElement.isConnected ? activeElement : null;
  };

  const say = (message) => {
    feedback = message;
    render();
    window.setTimeout(() => {
      if (feedback === message) {
        feedback = '';
        render();
      }
    }, 2400);
  };

  const position = () => {
    const element = selected();
    if (!element || menu.style.display === 'none') return;
    const rect = element.getBoundingClientRect();
    const left = Math.min(
      Math.max(8, rect.left),
       Math.max(8, window.innerWidth - 428),
    );
    const top = Math.min(
      Math.max(8, rect.bottom + 8),
      Math.max(8, window.innerHeight - 56),
    );
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
  };

  const applyText = (preset) => {
    const element = selected();
    if (!element) return say('Select an element first.');
    const textChange = applyTextContentPreservingStructure(
      element,
      preset.content,
      pendingTextPaths.get(element),
    );
    record('Apply ' + preset.name, () => {
      textChange.restore();
    });
    const anchor = pendingAnchors.get(element);
    if (!anchor || !anchor.isConnected) return say(preset.name + ' applied.');
    const targetElement = textChange.target;
    const targetAnchor = pendingAnchors.get(targetElement) || anchor;
    const target =
      pendingOriginalTargets.get(targetElement) ||
      pendingOriginalTargets.get(element) ||
      anchor;
    savePersistentRule(
      targetAnchor,
      target,
      targetElement,
      'text',
      preset.content,
      'replace',
      preset.name,
      textChange.textPath,
    )
      .then(() => say(preset.name + ' applied and saved as a persistent rule.'))
      .catch(() => say(preset.name + ' applied, but could not be saved.'));
  };

  const applyBlock = (preset) => {
    const element = selected();
    if (!element) return say('Select an element first.');
    const html = safeHTML(preset.html);
    const template = document.createElement('template');
    template.innerHTML = html;
    const replacement = template.content.firstElementChild;
    if (!replacement) return say('This block has no safe content.');
    const anchor = pendingAnchors.get(element);
    const target = pendingOriginalTargets.get(element) || anchor;
    if (blockMode === 'replace') {
      const original = element;
      original.replaceWith(replacement);
      record('Replace with ' + preset.name, () => {
        if (replacement.isConnected) replacement.replaceWith(original);
      });
      if (anchor) {
        pendingAnchors.set(replacement, anchor);
        if (target) pendingOriginalTargets.set(replacement, target);
      }
    } else {
      element.insertAdjacentElement('afterend', replacement);
      record('Insert ' + preset.name, () => replacement.remove());
      if (anchor) {
        pendingAnchors.set(replacement, anchor);
        if (target) pendingOriginalTargets.set(replacement, target);
      }
    }
    refreshSelection(replacement);
    if (!anchor) return say(preset.name + ' applied.');
    const injectedElements =
      blockMode === 'replace' ? replacement : [element, replacement];
    savePersistentRule(
      anchor,
      target || element,
      injectedElements,
      'block',
      html,
      blockMode,
      preset.name,
    )
      .then(() => say(preset.name + ' applied and saved as a persistent rule.'))
      .catch(() => say(preset.name + ' applied, but could not be saved.'));
  };

  const saveCurrent = () => {
    const element = selected();
    const nameInput = menu.querySelector('[data-new-name]');
    const name = nameInput && nameInput.value.trim();
    if (!element || !name) return say('Add a name first.');
    const now = Date.now();
    const preset =
      mode === 'text'
        ? {
            id: safeId(),
            name,
            mode: 'text',
            content: element.textContent || '',
            createdAt: now,
            updatedAt: now,
          }
        : {
            id: safeId(),
            name,
            mode: 'block',
            html: sanitizeElement(element).outerHTML,
            tagName: element.tagName.toLowerCase(),
            createdAt: now,
            updatedAt: now,
          };
    library.presets.push(preset);
    persist()
      .then(() => {
        panel = 'apply';
        mode = preset.mode;
        say('Preset saved.');
      })
      .catch(() => say('Unable to save preset. Try again.'));
  };

  const duplicate = () => {
    const element = selected();
    if (!element) return say('Select an element first.');
    const scope = findDuplicateScope(element);
    if (!scope.parentElement) return say('Unable to duplicate this element.');
    const clone = uniqueClone(scope);
    const targetPath = getElementPath(scope, element) || [];
    const targetClone = getElementAtPath(clone, targetPath) || clone;
    scope.parentElement.insertBefore(clone, scope);
    normalizeDuplicatePlacement(clone, scope);
    Array.from([clone, ...clone.querySelectorAll('*')]).forEach((clonedElement) => {
      const path = getElementPath(clone, clonedElement) || [];
      const originalElement = getElementAtPath(scope, path) || scope;
      pendingAnchors.set(clonedElement, scope);
      pendingOriginalTargets.set(clonedElement, originalElement);
      pendingTextPaths.set(
        clonedElement,
        getPreferredTextNodePath(originalElement),
      );
    });
    record('Duplicate element', () => clone.remove());
    refreshSelection(targetClone);
    say('Element duplicated.');
  };

  const managePreset = (preset, action) => {
    if (action === 'delete') {
      if (!window.confirm('Delete "' + preset.name + '"?')) return;
      library.presets = library.presets.filter((item) => item.id !== preset.id);
      persist().then(() => say('Preset deleted.'));
      return;
    }
    if (action === 'copy') {
      const now = Date.now();
      library.presets.push({
        ...preset,
        id: safeId(),
        name: preset.name + ' copy',
        createdAt: now,
        updatedAt: now,
      });
      persist().then(() => say('Preset duplicated.'));
      return;
    }
    if (action === 'edit') {
      const name = window.prompt('Preset name', preset.name);
      if (!name || !name.trim()) return;
      const value =
        preset.mode === 'text'
          ? window.prompt('Preset text', preset.content)
          : window.prompt('Safe block HTML', preset.html);
      if (value === null) return;
      preset.name = name.trim();
      if (preset.mode === 'text') preset.content = value;
      else {
        const html = safeHTML(value);
        if (!html) return say('Block HTML must contain one safe element.');
        preset.html = html;
      }
      preset.updatedAt = Date.now();
      persist().then(() => say('Preset updated.'));
    }
  };

  const renderPresets = () => {
    const visible = library.presets.filter((preset) => preset.mode === mode);
    if (!visible.length)
      return '<div class="ic-muted">No ' + mode + ' presets yet.</div>';
    return (
      '<div class="ic-list">' +
      visible
        .map(
          (preset) =>
            '<div class="ic-item"><div class="ic-item-main"><span class="ic-name">' +
            escapeHTML(preset.name) +
            '</span></div><button class="ic-primary" data-apply="' +
            preset.id +
            '">Apply</button></div>',
        )
        .join('') +
      '</div>'
    );
  };

  const renderManage = () => {
    if (!library.presets.length)
      return '<div class="ic-muted">Your saved presets will appear here.</div>';
    return (
      '<div class="ic-list">' +
      library.presets
        .map(
          (preset) =>
            '<div class="ic-item"><div class="ic-item-main"><span class="ic-name">' +
            escapeHTML(preset.name) +
            '</span><span class="ic-meta">' +
            preset.mode +
            '</span></div><button class="ic-action" data-manage="edit" data-id="' +
            preset.id +
            '">Edit</button><button class="ic-action" data-manage="copy" data-id="' +
            preset.id +
            '">Copy</button><button class="ic-action" data-manage="delete" data-id="' +
            preset.id +
            '">Delete</button></div>',
        )
        .join('') +
      '</div>'
    );
  };

  const renderRules = () => {
    const site = ruleSiteKey();
    const siteRules = ruleLibrary.rules.filter((rule) => rule.siteKey === site);
    const siteEnabled = ruleLibrary.siteSettings[site] !== false;
    const rulesList = siteRules.length
      ? '<div class="ic-list">' +
        siteRules
          .map(
            (rule) =>
              '<div class="ic-item"><div class="ic-item-main"><span class="ic-name">' +
              escapeHTML(rule.name) +
              '</span><span class="ic-meta">' +
              escapeHTML(rule.mode) +
              ' · ' +
              (rule.enabled ? 'On' : 'Off') +
              '</span></div><button class="ic-action" data-rule-action="delete" data-id="' +
              escapeHTML(rule.id) +
              '">Delete</button></div>',
          )
          .join('') +
        '</div>'
      : '<div class="ic-muted">Apply a preset after duplicating an element to save a rule for this site.</div>';
    return (
      '<div class="ic-panel"><div class="ic-row"><strong style="flex:1">Persistent rules</strong><button class="ic-action" data-action="close">Close</button></div>' +
      '<div class="ic-row" style="margin:6px 0;flex-wrap:wrap"><button class="ic-action" data-rule-action="toggle-global">Persistent rules: ' +
      (ruleLibrary.enabled ? 'On' : 'Off') +
      '</button><button class="ic-action" data-rule-action="toggle-site">This site: ' +
      (siteEnabled ? 'On' : 'Off') +
      '</button><button class="ic-action" data-rule-action="clear" ' +
      (ruleLibrary.rules.length ? '' : 'disabled') +
      '>Clear all saved rules</button></div>' +
      rulesList +
      '</div>'
    );
  };

  const escapeHTML = (value) =>
    String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

  const render = () => {
    if (!selected()) {
      menu.style.display = 'none';
      return;
    }
    menu.style.display = 'block';
    menu.innerHTML =
       '<div class="ic-row"><button class="ic-action" data-action="duplicate">Show original</button><button class="ic-action" data-action="apply">Apply fix</button><button class="ic-action" data-action="rules">Persistent rules</button></div>' +
      (feedback ? '<div class="ic-feedback">' + escapeHTML(feedback) + '</div>' : '') +
      (panel === 'apply'
        ? '<div class="ic-panel">' +
          (mode === 'block'
            ? '<select data-block-mode><option value="replace"' +
              (blockMode === 'replace' ? ' selected' : '') +
              '>Replace selected</option><option value="insert"' +
              (blockMode === 'insert' ? ' selected' : '') +
              '>Insert after selected</option></select>'
            : '') +
          renderPresets() +
          '</div>'
        : '') +
      (panel === 'save'
        ? '<div class="ic-panel"><div class="ic-row"><strong style="flex:1">Save selected element</strong><button class="ic-action" data-action="close">Close</button></div><div class="ic-row" style="margin-top:6px"><button class="ic-action" data-save-mode="text">Text</button><button class="ic-action" data-save-mode="block">Block</button></div><input class="ic-input" data-new-name placeholder="' +
           (mode === 'text' ? 'Preset name' : 'Block name') +
           '" type="text" autocomplete="off" spellcheck="false"><button class="ic-primary" data-action="save-current">Save preset</button></div>'
        : '') +
      (panel === 'manage'
        ? '<div class="ic-panel"><div class="ic-row"><strong style="flex:1">Preset library</strong><button class="ic-action" data-action="close">Close</button></div><div class="ic-row" style="margin:6px 0;flex-wrap:wrap"><button class="ic-action" data-action="export">Export JSON</button><button class="ic-action" data-action="import">Import JSON</button><button class="ic-action" data-action="undo">Undo (' +
          history.length +
          ')</button><button class="ic-action" data-action="reset">Reset page</button></div>' +
          renderManage() +
          '</div>'
         : '') +
      (panel === 'rules' ? renderRules() : '');
    position();
  };

  const refreshRules = async () => {
    await loadRules();
    startRuleReplay();
    render();
  };

  chrome.runtime.onMessage.addListener(
    (message, _sender, sendResponse) => {
      if (message?.type === 'open-persistent-rules') {
        panel = 'rules';
        render();
        sendResponse({ persistentRulesOpened: true });
        return;
      }
      if (message?.type !== 'replay-persistent-rules') return;
      refreshRules()
        .then(() => sendResponse({ persistentReplayed: true }))
        .catch(() => sendResponse({ persistentReplayed: false }));
      return true;
    },
  );

  const manageRule = (action, id) => {
    if (action === 'toggle-global') {
      ruleLibrary.enabled = !ruleLibrary.enabled;
      return persistRules()
        .then(() => refreshRules())
        .then(() =>
          say(
            ruleLibrary.enabled
              ? 'Persistent rules enabled.'
              : 'Persistent rules disabled.',
          ),
        );
    }
    if (action === 'toggle-site') {
      const site = ruleSiteKey();
      ruleLibrary.siteSettings[site] = ruleLibrary.siteSettings[site] === false;
      return persistRules()
        .then(() => refreshRules())
        .then(() =>
          say(
            ruleLibrary.siteSettings[site]
              ? 'Persistent rules enabled for this site.'
              : 'Persistent rules disabled for this site.',
          ),
        );
    }
    if (action === 'clear') {
      if (!window.confirm('Clear all saved persistent rules?')) return;
      ruleLibrary.rules = [];
      return persistRules()
        .then(() => refreshRules())
        .then(() => say('All persistent rules cleared.'));
    }
    if (action === 'delete') {
      const rule = ruleLibrary.rules.find((item) => item.id === id);
      if (!rule || !window.confirm('Delete "' + rule.name + '"?')) return;
      ruleLibrary.rules = ruleLibrary.rules.filter((item) => item.id !== id);
      return persistRules()
        .then(() => refreshRules())
        .then(() => say('Persistent rule deleted.'));
    }
  };

  menu.addEventListener('click', (event) => {
    event.stopPropagation();
    const target = event.target.closest('button');
    if (!target) return;
    const action = target.dataset.action;
     if (action === 'edit') {
       window.dispatchEvent(new CustomEvent(OPEN_DETAIL_EVENT));
       return say('Inspector opened.');
     }
    if (action === 'duplicate') return duplicate();
    if (action === 'apply') {
      panel = panel === 'apply' ? '' : 'apply';
      return render();
    }
    if (action === 'rules') {
      panel = panel === 'rules' ? '' : 'rules';
      return render();
    }
    if (action === 'save') {
      panel = panel === 'save' ? '' : 'save';
      return render();
    }
    if (action === 'manage') {
      panel = panel === 'manage' ? '' : 'manage';
      return render();
    }
    if (action === 'close') {
      panel = '';
      return render();
    }
    if (action === 'save-current') return saveCurrent();
    if (target.dataset.ruleAction) {
      return manageRule(target.dataset.ruleAction, target.dataset.id);
    }
    if (action === 'export') {
      const blob = new Blob(
        [JSON.stringify({ version: VERSION, presets: library.presets }, null, 2)],
        { type: 'application/json' },
      );
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
       anchor.download = 'security-inspection-presets.json';
      anchor.click();
      URL.revokeObjectURL(url);
      return say('Preset library exported.');
    }
    if (action === 'import') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.onchange = async () => {
        const file = input.files && input.files[0];
        if (!file) return;
        try {
          const value = JSON.parse(await file.text());
          const incoming = Array.isArray(value) ? value : value.presets;
          if (!Array.isArray(incoming)) throw new Error('Invalid preset file');
          library = normalize({ presets: library.presets.concat(incoming) });
          await persist();
          say('Preset library imported.');
        } catch (_error) {
          say('Could not import that preset file.');
        }
      };
      input.click();
      return;
    }
    if (action === 'undo') {
      const entry = history.pop();
      if (entry) {
        entry.undo();
        say(entry.label + ' undone.');
      }
      return;
    }
    if (action === 'reset') {
      let count = 0;
      while (history.length) {
        history.pop().undo();
        count += 1;
      }
      say(count ? count + ' page change(s) reset.' : 'No page changes to reset.');
      return;
    }
    if (target.dataset.apply) {
      const preset = library.presets.find((item) => item.id === target.dataset.apply);
      if (preset) {
        if (preset.mode === 'text') applyText(preset);
        else applyBlock(preset);
      }
      return;
    }
    if (target.dataset.manage) {
      const preset = library.presets.find((item) => item.id === target.dataset.id);
      if (preset) managePreset(preset, target.dataset.manage);
      return;
    }
    if (target.dataset.mode) {
      mode = target.dataset.mode;
      return render();
    }
    if (target.dataset.saveMode) {
      mode = target.dataset.saveMode;
      return render();
    }
  });

  menu.addEventListener('change', (event) => {
    if (event.target.matches('[data-block-mode]')) {
      blockMode = event.target.value;
    }
  });

  const observer = new MutationObserver(() => {
    const next = document.querySelector('[' + SELECTED_ATTR + '="true"]');
    if (next !== activeElement) {
      activeElement = next;
      panel = '';
    }
    render();
  });
  observer.observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: [SELECTED_ATTR],
  });
  window.addEventListener('resize', position);
  window.addEventListener('scroll', position, true);
  document.addEventListener(
    'click',
    (event) => {
      if (!menu.contains(event.target) && !event.target.closest('[' + SELECTED_ATTR + ']')) {
        panel = '';
        render();
      }
    },
    true,
  );
  Promise.all([load(), loadRules()]).then(() => {
    startRuleReplay();
    render();
  });
  installHoverWarning();
})();
`;
