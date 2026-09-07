import { createStorage, StorageType } from '@root/src/storages/base';

export const CONTENT_PRESETS_VERSION = 3;
export const CONTENT_PRESETS_KEY = 'content-presets';

export type ContentPresetMode = 'text' | 'block';
export type TextNodePath = number[];

export interface ContentPresetBase {
  id: string;
  name: string;
  mode: ContentPresetMode;
  createdAt: number;
  updatedAt: number;
}

export interface TextContentPreset extends ContentPresetBase {
  mode: 'text';
  content: string;
}

export interface BlockContentPreset extends ContentPresetBase {
  mode: 'block';
  html: string;
  tagName: string;
}

export type ContentPreset = TextContentPreset | BlockContentPreset;

export interface ContentPresetLibrary {
  version: typeof CONTENT_PRESETS_VERSION;
  presets: ContentPreset[];
}

const defaultTextPresets: TextContentPreset[] = [
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

const emptyLibrary: ContentPresetLibrary = {
  version: CONTENT_PRESETS_VERSION,
  presets: defaultTextPresets,
};

const starterTextPreset: TextContentPreset = {
  id: 'starter-demo-text',
  name: 'Demo text',
  mode: 'text',
  content: 'Sample text preset',
  createdAt: 0,
  updatedAt: 0,
};

const storage = createStorage<ContentPresetLibrary>(
  CONTENT_PRESETS_KEY,
  emptyLibrary,
  { storageType: StorageType.Local },
);

function createPresetId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `preset-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizePreset(input: unknown): ContentPreset | null {
  if (!input || typeof input !== 'object') return null;

  const candidate = input as Partial<ContentPreset>;
  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.name !== 'string' ||
    (candidate.mode !== 'text' && candidate.mode !== 'block')
  )
    return null;

  const base = {
    id: candidate.id,
    name: candidate.name.trim() || 'Untitled preset',
    mode: candidate.mode,
    createdAt:
      typeof candidate.createdAt === 'number'
        ? candidate.createdAt
        : Date.now(),
    updatedAt:
      typeof candidate.updatedAt === 'number'
        ? candidate.updatedAt
        : Date.now(),
  };

  if (candidate.mode === 'text' && typeof candidate.content === 'string') {
    return { ...base, mode: 'text', content: candidate.content };
  }

  if (
    candidate.mode === 'block' &&
    typeof candidate.html === 'string' &&
    typeof candidate.tagName === 'string'
  ) {
    return {
      ...base,
      mode: 'block',
      html: candidate.html,
      tagName: candidate.tagName,
    };
  }

  return null;
}

function normalizeLibrary(input: unknown): ContentPresetLibrary {
  if (!input || typeof input !== 'object') return emptyLibrary;

  const candidate = input as Partial<ContentPresetLibrary>;
  const presets = Array.isArray(candidate.presets)
    ? candidate.presets
        .map(normalizePreset)
        .filter((preset): preset is ContentPreset => Boolean(preset))
    : [];

  const storedVersion =
    typeof candidate.version === 'number' ? candidate.version : 0;
  const defaultPresetIds = new Set(
    defaultTextPresets.map((defaultPreset) => defaultPreset.id),
  );
  const migratedPresets =
    storedVersion < CONTENT_PRESETS_VERSION
      ? [
          ...defaultTextPresets,
          ...presets.filter(
            (preset) =>
              !defaultPresetIds.has(preset.id) &&
              preset.id !== starterTextPreset.id,
          ),
        ]
      : presets;

  return {
    version: CONTENT_PRESETS_VERSION,
    presets: migratedPresets,
  };
}

export async function loadContentPresetLibrary() {
  return normalizeLibrary(await storage.get());
}

export async function saveContentPresetLibrary(library: ContentPresetLibrary) {
  await storage.set(normalizeLibrary(library));
}

export function createTextContentPreset(name: string, content: string) {
  const timestamp = Date.now();

  return {
    id: createPresetId(),
    name: name.trim() || 'Untitled text preset',
    mode: 'text' as const,
    content,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function sanitizeBlockElement(element: Element) {
  const clone = element.cloneNode(true) as Element;
  const unsafeElements = clone.querySelectorAll(
    'script, iframe, object, embed, portal, base',
  );
  unsafeElements.forEach((unsafeElement) => unsafeElement.remove());

  clone.querySelectorAll('*').forEach((child) => {
    [...child.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim();

      if (
        name.startsWith('on') ||
        name === 'srcdoc' ||
        name.startsWith('inspect-css-')
      ) {
        child.removeAttribute(attribute.name);
        return;
      }

      if (
        ['href', 'src', 'action', 'formaction', 'poster'].includes(name) &&
        /^javascript:/i.test(value)
      ) {
        child.removeAttribute(attribute.name);
      }
    });
  });

  return clone;
}

export function createBlockContentPreset(name: string, element: Element) {
  const timestamp = Date.now();
  const safeElement = sanitizeBlockElement(element);

  return {
    id: createPresetId(),
    name: name.trim() || 'Untitled block preset',
    mode: 'block' as const,
    html: safeElement.outerHTML,
    tagName: safeElement.tagName.toLowerCase(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function sanitizeBlockHTML(html: string) {
  const template = document.createElement('template');
  template.innerHTML = html;

  const firstElement = template.content.firstElementChild;
  if (!firstElement) return '';

  return sanitizeBlockElement(firstElement).outerHTML;
}

export function getElementPath(root: Element, target: Element) {
  if (root === target) return [];
  if (!root.contains(target)) return null;

  const path: number[] = [];
  let current: Element | null = target;
  while (current && current !== root) {
    const parent = current.parentElement;
    if (!parent) return null;
    path.unshift([...parent.children].indexOf(current));
    current = parent;
  }
  return current === root ? path : null;
}

export function getElementAtPath(root: Element, path: number[]) {
  return path.reduce<Element | null>(
    (current, index) => current?.children[index] ?? null,
    root,
  );
}

export function getTextNodePath(root: Element, target: Text) {
  const path: number[] = [];
  let current: Node | null = target;

  while (current && current !== root) {
    const parent = current.parentNode;
    if (!parent) return null;
    path.unshift([...parent.childNodes].indexOf(current));
    current = parent;
  }

  return current === root ? path : null;
}

export function getTextNodeAtPath(root: Element, path: TextNodePath) {
  const target = path.reduce<Node | null>(
    (current, index) => current?.childNodes[index] ?? null,
    root,
  );
  return target?.nodeType === Node.TEXT_NODE ? (target as Text) : null;
}

export function getPreferredTextNodePath(element: Element) {
  const directTextNode = [...element.childNodes].find(
    (node): node is Text =>
      node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim()),
  );
  if (directTextNode) return getTextNodePath(element, directTextNode);

  const textElement = [...element.querySelectorAll('*')].find(
    (child) =>
      child.children.length === 0 && Boolean(child.textContent?.trim()),
  );
  if (!textElement) return null;

  const textNode = [...textElement.childNodes].find(
    (node): node is Text =>
      node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim()),
  );
  return textNode ? getTextNodePath(element, textNode) : null;
}

export function applyTextContentPreservingStructure(
  element: Element,
  content: string,
  preferredTextPath?: TextNodePath | null,
) {
  const preferredTextNode = preferredTextPath
    ? getTextNodeAtPath(element, preferredTextPath)
    : null;
  const directTextNode =
    preferredTextNode ??
    [...element.childNodes].find(
      (node): node is Text =>
        node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim()),
    );

  if (directTextNode) {
    const targetNode = directTextNode;
    const before = targetNode.textContent ?? '';
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
    [...element.querySelectorAll('*')].find(
      (child) =>
        child.children.length === 0 && Boolean(child.textContent?.trim()),
    ) ?? element;
  const textNode = [...textTarget.childNodes].find(
    (node): node is Text =>
      node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim()),
  );
  if (!textNode) {
    return {
      target: textTarget,
      textPath: null,
      restore: () => {},
    };
  }
  const before = textNode.textContent ?? '';
  textNode.textContent = content;
  return {
    target: textTarget,
    textPath: getTextNodePath(textTarget, textNode),
    restore: () => {
      if (textNode.isConnected) textNode.textContent = before;
    },
  };
}

export function findInteractiveScope(element: Element) {
  const details = element.closest('details');
  if (details) return details;

  const trigger = element.closest(
    'button, summary, [role="button"], [aria-controls], [data-target], [data-bs-target], [data-accordion-target], [data-content-target]',
  );
  if (!trigger) return element;

  const references = [
    trigger.getAttribute('aria-controls') ?? '',
    trigger.getAttribute('aria-owns') ?? '',
    trigger.getAttribute('data-target') ?? '',
    trigger.getAttribute('data-bs-target') ?? '',
    trigger.getAttribute('data-accordion-target') ?? '',
    trigger.getAttribute('data-content-target') ?? '',
  ];
  const targetIds = references
    .flatMap((value) => value.match(/[A-Za-z][\w:.-]*/g) ?? [])
    .filter((id, index, values) => values.indexOf(id) === index);
  const targets = targetIds
    .map((id) => document.getElementById(id))
    .filter((target): target is HTMLElement => Boolean(target));

  if (!targets.length) return trigger === element ? element : trigger;

  let scope: Element | null = trigger.parentElement;
  while (
    scope &&
    scope !== document.body &&
    !targets.every((target) => scope?.contains(target))
  ) {
    scope = scope.parentElement;
  }
  return scope && scope !== document.body ? scope : trigger;
}

export function findDuplicateScope(element: Element) {
  const interactiveScope = findInteractiveScope(element);
  if (interactiveScope !== element) return interactiveScope;

  const position = getComputedStyle(element).position;
  if (position !== 'absolute' && position !== 'fixed') return element;

  let ancestor = element.parentElement;
  while (ancestor && ancestor !== document.body) {
    if (getComputedStyle(ancestor).position !== 'static') return ancestor;
    ancestor = ancestor.parentElement;
  }

  return element.parentElement && element.parentElement !== document.body
    ? element.parentElement
    : element;
}

export function createUniqueClone(element: Element) {
  const clone = element.cloneNode(true) as Element;
  const idMap = new Map<string, string>();

  const elementsWithIds = [
    ...(clone.matches('[id]') ? [clone] : []),
    ...clone.querySelectorAll('[id]'),
  ];
  elementsWithIds.forEach((child) => {
    const originalId = child.getAttribute('id');
    if (!originalId) return;

    let nextId = `${originalId}-copy`;
    let suffix = 2;

    while (document.getElementById(nextId) || idMap.has(nextId)) {
      nextId = `${originalId}-copy-${suffix}`;
      suffix += 1;
    }

    idMap.set(originalId, nextId);
    child.setAttribute('id', nextId);
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

  const rewriteReference = (name: string, value: string) => {
    const normalizedName = name.toLowerCase();
    if (normalizedName === 'for' || tokenReferenceAttributes.has(normalizedName)) {
      return value
        .split(/\s+/)
        .map((token) => idMap.get(token) ?? token)
        .join(' ');
    }

    if (
      normalizedName === 'href' ||
      normalizedName === 'xlink:href' ||
      selectorReferenceAttributes.has(normalizedName)
    ) {
      let nextValue = value;
      idMap.forEach((replacement, original) => {
        nextValue = nextValue.replaceAll(`#${original}`, `#${replacement}`);
        if (nextValue === original) nextValue = replacement;
      });
      return nextValue;
    }

    return value;
  };

  [clone, ...clone.querySelectorAll('*')].forEach((child) => {
    [...child.attributes].forEach((attribute) => {
      const nextValue = rewriteReference(attribute.name, attribute.value);
      if (nextValue !== attribute.value) {
        child.setAttribute(attribute.name, nextValue);
      }
    });
  });

  return sanitizeBlockElement(clone);
}
