import { createStorage, StorageType } from '@root/src/storages/base';
import {
  applyTextContentPreservingStructure,
  createUniqueClone,
  getElementAtPath,
  getElementPath,
  normalizeDuplicatePlacement,
  sanitizeBlockHTML,
} from './content-presets';

export const CONTENT_RULES_VERSION = 2;
export const CONTENT_RULES_KEY = 'content-rules';
export const PERSISTENT_RULE_ATTR = 'data-security-inspection-rule-id';
export const PERSISTENT_TEXT_RULE_ATTR =
  'data-security-inspection-text-rule-id';

export type PersistentRuleMode = 'text' | 'block' | 'duplicate';
export type PersistentBlockMode = 'replace' | 'insert';

export interface PersistentContentRule {
  id: string;
  name: string;
  pageKey: string;
  siteKey: string;
  selector: string;
  anchorTagName: string;
  mode: PersistentRuleMode;
  blockMode: PersistentBlockMode;
  content: string;
  targetPath?: number[];
  textPath?: number[];
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ContentRuleLibrary {
  version: typeof CONTENT_RULES_VERSION;
  enabled: boolean;
  siteSettings: Record<string, boolean>;
  rules: PersistentContentRule[];
}

const emptyLibrary: ContentRuleLibrary = {
  version: CONTENT_RULES_VERSION,
  enabled: true,
  siteSettings: {},
  rules: [],
};

const storage = createStorage<ContentRuleLibrary>(
  CONTENT_RULES_KEY,
  emptyLibrary,
  { storageType: StorageType.Local },
);

function createRuleId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `rule-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeRule(input: unknown): PersistentContentRule | null {
  if (!input || typeof input !== 'object') return null;

  const candidate = input as Partial<PersistentContentRule>;
  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.name !== 'string' ||
    typeof candidate.pageKey !== 'string' ||
    typeof candidate.siteKey !== 'string' ||
    typeof candidate.selector !== 'string' ||
    typeof candidate.anchorTagName !== 'string' ||
    (candidate.mode !== 'text' &&
      candidate.mode !== 'block' &&
      candidate.mode !== 'duplicate') ||
    (candidate.blockMode !== 'replace' && candidate.blockMode !== 'insert') ||
    typeof candidate.content !== 'string'
  ) {
    return null;
  }

  const timestamp = Date.now();
  return {
    id: candidate.id,
    name: candidate.name.trim() || 'Untitled rule',
    pageKey: candidate.pageKey,
    siteKey: candidate.siteKey,
    selector: candidate.selector,
    anchorTagName: candidate.anchorTagName.toLowerCase(),
    mode: candidate.mode,
    blockMode: candidate.blockMode,
    content: candidate.content,
    targetPath: Array.isArray(candidate.targetPath)
      ? candidate.targetPath.filter(
          (segment): segment is number =>
            Number.isInteger(segment) && segment >= 0,
        )
      : [],
    textPath: Array.isArray(candidate.textPath)
      ? candidate.textPath.filter(
          (segment): segment is number =>
            Number.isInteger(segment) && segment >= 0,
        )
      : undefined,
    enabled: candidate.enabled !== false,
    createdAt:
      typeof candidate.createdAt === 'number'
        ? candidate.createdAt
        : timestamp,
    updatedAt:
      typeof candidate.updatedAt === 'number'
        ? candidate.updatedAt
        : timestamp,
  };
}

function normalizeLibrary(input: unknown): ContentRuleLibrary {
  if (!input || typeof input !== 'object') return emptyLibrary;

  const candidate = input as Partial<ContentRuleLibrary>;
  const storedVersion =
    typeof candidate.version === 'number' ? candidate.version : 0;
  const normalizedRules = Array.isArray(candidate.rules)
    ? candidate.rules
        .map(normalizeRule)
        .filter((rule) => storedVersion >= CONTENT_RULES_VERSION || rule.mode !== 'text')
        .filter((rule): rule is PersistentContentRule => Boolean(rule))
    : [];
  const seenTextTargets = new Set<string>();
  const rules = [...normalizedRules]
    .reverse()
    .filter((rule) => {
      if (rule.mode !== 'text') return true;
      const key = [
        rule.pageKey,
        rule.siteKey,
        rule.selector,
        rule.anchorTagName,
        (rule.targetPath ?? []).join(','),
      ].join('|');
      if (seenTextTargets.has(key)) return false;
      seenTextTargets.add(key);
      return true;
    })
    .reverse();

  const siteSettings =
    candidate.siteSettings && typeof candidate.siteSettings === 'object'
      ? Object.fromEntries(
          Object.entries(candidate.siteSettings).filter(
            ([siteKey, enabled]) =>
              typeof siteKey === 'string' && typeof enabled === 'boolean',
          ),
        )
      : {};

  return {
    version: CONTENT_RULES_VERSION,
    enabled: candidate.enabled !== false,
    siteSettings,
    rules,
  };
}

export async function loadContentRuleLibrary() {
  return normalizeLibrary(await storage.get());
}

export async function saveContentRuleLibrary(library: ContentRuleLibrary) {
  await storage.set(normalizeLibrary(library));
}

export function getPageKey(location: Location = window.location) {
  return `${location.origin}${location.pathname}`;
}

export function getSiteKey(location: Location = window.location) {
  return location.origin;
}

function escapeIdentifier(value: string) {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }

  return value.replace(/[^\w-]/g, '\\$&');
}

function isExtensionOwned(element: Element) {
  return (
    element.id === 'inspect-css-root' ||
    element.hasAttribute(PERSISTENT_RULE_ATTR) ||
    element.closest('#inspect-css-root') !== null
  );
}

export function createElementSelector(
  element: Element,
  allowPersistentAnchor = false,
) {
  const segments: string[] = [];
  let current: Element | null = element;

  while (current && current !== document.documentElement) {
    if (
      current.id === 'inspect-css-root' ||
      current.closest('#inspect-css-root') !== null ||
      (!allowPersistentAnchor &&
        current.hasAttribute(PERSISTENT_RULE_ATTR))
    ) {
      break;
    }

    const tagName = current.tagName.toLowerCase();
    const id = current.getAttribute('id');
    if (id && !id.startsWith('inspect-css-')) {
      segments.unshift(`${tagName}#${escapeIdentifier(id)}`);
      break;
    }

    const classes = [...current.classList]
      .filter((className) => !className.startsWith('inspect-css-'))
      .slice(0, 2)
      .map(escapeIdentifier);
    const classSuffix = classes.length ? `.${classes.join('.')}` : '';
    const siblings = current.parentElement
      ? [...current.parentElement.children].filter(
          (sibling) => sibling.tagName === current?.tagName,
        )
      : [];
    const index = siblings.indexOf(current) + 1;
    const positionSuffix = siblings.length > 1 ? `:nth-of-type(${index})` : '';

    segments.unshift(`${tagName}${classSuffix}${positionSuffix}`);
    current = current.parentElement;
  }

  return segments.join(' > ') || element.tagName.toLowerCase();
}

export function createPersistentContentRule(
  name: string,
  anchor: Element,
  mode: PersistentRuleMode,
  content: string,
  blockMode: PersistentBlockMode = 'replace',
  target: Element = anchor,
  textPath?: number[] | null,
) {
  const timestamp = Date.now();
  return {
    id: createRuleId(),
    name: name.trim() || 'Untitled rule',
    pageKey: getPageKey(),
    siteKey: getSiteKey(),
    selector: createElementSelector(anchor, mode === 'text'),
    anchorTagName: anchor.tagName.toLowerCase(),
    mode,
    blockMode,
    content: mode === 'block' ? sanitizeBlockHTML(content) : content,
    targetPath: getElementPath(anchor, target) ?? [],
    textPath: textPath ?? undefined,
    enabled: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  } satisfies PersistentContentRule;
}

function findAnchor(rule: PersistentContentRule) {
  try {
    return [...document.querySelectorAll(rule.selector)].find(
      (element) =>
        (rule.mode === 'text' || !isExtensionOwned(element)) &&
        element.tagName.toLowerCase() === rule.anchorTagName,
    );
  } catch {
    return null;
  }
}

function applyRule(rule: PersistentContentRule) {
  const ruleAttr =
    rule.mode === 'text' ? PERSISTENT_TEXT_RULE_ATTR : PERSISTENT_RULE_ATTR;
  if (
    document.querySelector(
      `[${ruleAttr}="${escapeIdentifier(rule.id)}"]`,
    )
  ) {
    return false;
  }

  const anchor = findAnchor(rule);
  if (!anchor) return false;

  if (rule.mode === 'text') {
    const target = getElementAtPath(anchor, rule.targetPath ?? []);
    if (!target) return false;
    applyTextContentPreservingStructure(target, rule.content, rule.textPath);
    anchor.setAttribute(PERSISTENT_TEXT_RULE_ATTR, rule.id);
    return true;
  }

  if (!anchor.parentElement) return false;

  const clone = createUniqueClone(anchor);
  clone.setAttribute(PERSISTENT_RULE_ATTR, rule.id);
  anchor.parentElement.insertBefore(clone, anchor);
  normalizeDuplicatePlacement(clone, anchor);
  if (rule.mode === 'duplicate') return true;

  const target = getElementAtPath(clone, rule.targetPath ?? []);
  if (!target) {
    clone.remove();
    return false;
  }

  const replacementHTML = sanitizeBlockHTML(rule.content);
  const template = document.createElement('template');
  template.innerHTML = replacementHTML;
  const replacement = template.content.firstElementChild;
  if (!replacement) {
    clone.remove();
    return false;
  }

  replacement.setAttribute(PERSISTENT_RULE_ATTR, rule.id);
  if (rule.blockMode === 'replace') {
    target.replaceWith(replacement);
  } else {
    target.insertAdjacentElement('afterend', replacement);
  }

  return true;
}

export async function startContentRuleReplay(
  library: ContentRuleLibrary,
) {
  let stopped = false;
  const pageKey = getPageKey();
  const siteKey = getSiteKey();
  const pageRules = library.rules.filter(
    (rule) =>
      rule.enabled &&
      rule.pageKey === pageKey &&
      rule.siteKey === siteKey,
  );

  const replay = () => {
    if (
      stopped ||
      !library.enabled ||
      library.siteSettings[siteKey] === false
    ) {
      return;
    }

    pageRules.forEach(applyRule);
  };

  replay();
  const observer = new MutationObserver(replay);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  const timeout = window.setTimeout(() => observer.disconnect(), 30000);

  return () => {
    stopped = true;
    observer.disconnect();
    window.clearTimeout(timeout);
  };
}