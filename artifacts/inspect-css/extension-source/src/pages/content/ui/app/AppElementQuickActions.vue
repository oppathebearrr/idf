<template>
  <div
    v-if="selectedEl"
    class="fixed w-[min(22rem,calc(100vw-1rem))] rounded-lg border bg-popover p-1.5 text-popover-foreground shadow-xl"
    :style="menuStyle"
    @click.stop
    @pointerdown.stop
  >
    <div class="flex items-center gap-1">
      <button
        class="quick-action-button"
        type="button"
        @click="duplicateElement"
      >
        Show original
      </button>
      <button
        class="quick-action-button"
        type="button"
        @click="togglePanel('apply')"
      >
        Apply fix
      </button>
      <button
        class="quick-action-button"
        type="button"
        @click="togglePanel('rules')"
      >
        Persistent rules
      </button>
    </div>

    <p v-if="feedback" class="mt-1 px-1 text-[11px] text-primary">
      {{ feedback }}
    </p>

    <div v-if="panel === 'apply'" class="mt-2 border-t pt-2">
      <label
        v-if="applyMode === 'block'"
        class="mb-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground"
      >
        Apply as
        <select
          v-model="blockApplyMode"
          class="rounded border bg-background px-1.5 py-1 text-[11px] text-foreground"
        >
          <option value="replace">Replace selected element</option>
          <option value="insert">Insert after selected element</option>
        </select>
      </label>
      <div
        v-if="filteredPresets.length"
        class="max-h-44 space-y-1 overflow-auto"
      >
          <div
            v-for="preset in filteredPresets"
            :key="preset.id"
            class="flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5"
          >
            <p class="min-w-0 flex-1 truncate text-xs">{{ preset.name }}</p>
          <button
            class="rounded bg-primary px-2 py-1 text-[11px] text-primary-foreground hover:bg-primary/90"
            type="button"
            @click="applyPreset(preset)"
          >
            Apply
          </button>
        </div>
      </div>
      <p
        v-else
        class="rounded bg-muted/30 p-2 text-[11px] text-muted-foreground"
      >
        No {{ applyMode }} presets yet. Save the selected element to create one.
      </p>
    </div>

    <div v-if="panel === 'save'" class="mt-2 border-t pt-2">
      <div class="mb-2 flex items-center justify-between">
        <p class="text-xs font-semibold">Save selected element</p>
        <button
          class="text-[11px] text-muted-foreground hover:text-foreground"
          type="button"
          @click="panel = ''"
        >
          Close
        </button>
      </div>
      <div class="mb-2 flex gap-1">
        <button
          v-for="mode in presetModes"
          :key="mode"
          :class="[
            'rounded px-2 py-1 text-[11px]',
            saveMode === mode
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground',
          ]"
          type="button"
          @click="saveMode = mode"
        >
          {{ mode === 'text' ? 'Text preset' : 'Reusable block' }}
        </button>
      </div>
      <input
        v-model="newPresetName"
        class="mb-2 h-8 w-full rounded border bg-background px-2 text-xs outline-none focus:border-primary"
        type="text"
        autocomplete="off"
        spellcheck="false"
        :placeholder="saveMode === 'text' ? 'Preset name' : 'Block name'"
        @keydown.enter.prevent="saveCurrentPreset"
      />
      <button
        class="w-full rounded bg-primary px-2 py-1.5 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        type="button"
        :disabled="!newPresetName.trim()"
        @click="saveCurrentPreset"
      >
        Save {{ saveMode === 'text' ? 'text' : 'block' }} preset
      </button>
    </div>

    <div v-if="panel === 'rules'" class="mt-2 border-t pt-2">
      <div class="mb-2 flex items-center justify-between">
        <p class="text-xs font-semibold">Persistent rules</p>
        <button
          class="text-[11px] text-muted-foreground hover:text-foreground"
          type="button"
          @click="panel = ''"
        >
          Close
        </button>
      </div>
      <div class="mb-2 space-y-1">
        <label
          class="flex cursor-pointer items-center justify-between gap-2 rounded bg-muted/40 px-2 py-1.5 text-[11px]"
        >
          <span>Persistent rules</span>
          <input
            type="checkbox"
            :checked="persistentRulesEnabled"
            @change="togglePersistentRules"
          />
        </label>
        <button
          class="flex w-full items-center justify-between rounded bg-muted/40 px-2 py-1.5 text-left text-[11px] hover:bg-accent"
          type="button"
          @click="toggleSiteRules"
        >
          <span>This site</span>
          <span>{{ siteRulesEnabled ? 'On' : 'Off' }}</span>
        </button>
        <button
          class="w-full rounded bg-muted px-2 py-1.5 text-left text-[11px] hover:bg-accent disabled:opacity-50"
          type="button"
          :disabled="!persistentRules.length"
          @click="clearAllPersistentRules"
        >
          Clear all saved rules
        </button>
      </div>
      <div
        v-if="currentSiteRules.length"
        class="max-h-48 space-y-1 overflow-auto"
      >
        <div
          v-for="rule in currentSiteRules"
          :key="rule.id"
          class="flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5"
        >
          <div class="min-w-0 flex-1">
            <p class="truncate text-xs">{{ rule.name }}</p>
            <p class="truncate text-[10px] uppercase text-muted-foreground">
              {{ rule.mode }} · {{ rule.enabled ? 'On' : 'Off' }}
            </p>
          </div>
          <button
            class="text-[11px] text-destructive hover:underline"
            type="button"
            @click="deletePersistentRule(rule)"
          >
            Delete
          </button>
        </div>
      </div>
      <p v-else class="text-[11px] text-muted-foreground">
        Apply a preset after duplicating an element to save a rule for this site.
      </p>
    </div>

    <div v-if="panel === 'manage'" class="mt-2 border-t pt-2">
      <div class="mb-2 flex items-center justify-between">
        <p class="text-xs font-semibold">Preset library</p>
        <button
          class="text-[11px] text-muted-foreground hover:text-foreground"
          type="button"
          @click="panel = ''"
        >
          Close
        </button>
      </div>
      <div class="mb-2 flex flex-wrap gap-1">
        <button
          class="rounded bg-muted px-2 py-1 text-[11px] hover:bg-accent"
          type="button"
          @click="exportPresets"
        >
          Export JSON
        </button>
        <button
          class="rounded bg-muted px-2 py-1 text-[11px] hover:bg-accent"
          type="button"
          @click="importInput?.click()"
        >
          Import JSON
        </button>
        <input
          ref="importInput"
          class="hidden"
          type="file"
          accept="application/json,.json"
          @change="importPresets"
        />
        <button
          class="rounded bg-muted px-2 py-1 text-[11px] hover:bg-accent disabled:opacity-50"
          type="button"
          :disabled="!historyCount"
          @click="undoChange"
        >
          Undo ({{ historyCount }})
        </button>
        <button
          class="rounded bg-muted px-2 py-1 text-[11px] hover:bg-accent disabled:opacity-50"
          type="button"
          :disabled="!historyCount"
          @click="resetChanges"
        >
          Reset page changes
        </button>
      </div>
      <div v-if="presets.length" class="max-h-60 space-y-1 overflow-auto">
        <div
          v-for="preset in presets"
          :key="preset.id"
          class="rounded-md bg-muted/40 p-2"
        >
          <div v-if="editingId !== preset.id" class="flex items-start gap-2">
            <div class="min-w-0 flex-1">
              <p class="truncate text-xs">{{ preset.name }}</p>
              <p class="text-[10px] uppercase text-muted-foreground">
                {{ preset.mode }}
              </p>
            </div>
            <button
              class="text-[11px] text-muted-foreground hover:text-foreground"
              type="button"
              @click="startEditing(preset)"
            >
              Edit
            </button>
            <button
              class="text-[11px] text-muted-foreground hover:text-foreground"
              type="button"
              @click="duplicatePreset(preset)"
            >
              Copy
            </button>
            <button
              class="text-[11px] text-destructive hover:underline"
              type="button"
              @click="deletePreset(preset)"
            >
              Delete
            </button>
          </div>
          <div v-else class="space-y-1.5">
            <input
              v-model="editName"
              class="h-7 w-full rounded border bg-background px-2 text-xs"
              type="text"
            />
            <textarea
              v-if="preset.mode === 'text'"
              v-model="editContent"
              class="min-h-14 w-full rounded border bg-background p-2 text-xs"
            />
            <textarea
              v-else
              v-model="editContent"
              class="min-h-20 w-full rounded border bg-background p-2 font-mono text-[10px]"
            />
            <div class="flex justify-end gap-1">
              <button
                class="rounded px-2 py-1 text-[11px] hover:bg-accent"
                type="button"
                @click="editingId = ''"
              >
                Cancel
              </button>
              <button
                class="rounded bg-primary px-2 py-1 text-[11px] text-primary-foreground"
                type="button"
                @click="saveEditedPreset(preset)"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-[11px] text-muted-foreground">
        Your saved presets will appear here.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { emitter, EmitterEvents } from '@root/src/lib/mitt';
import { downloadFile } from '@root/src/utils/helper';
import {
  CONTENT_PRESETS_VERSION,
  applyTextContentPreservingStructure,
  createBlockContentPreset,
  createTextContentPreset,
  createUniqueClone,
  findDuplicateScope,
  getElementAtPath,
  getElementPath,
  getPreferredTextNodePath,
  loadContentPresetLibrary,
  sanitizeBlockHTML,
  saveContentPresetLibrary,
  type ContentPreset,
  type ContentPresetLibrary,
  type ContentPresetMode,
} from '@root/src/utils/content-presets';
import {
  createPersistentContentRule,
  getSiteKey,
  loadContentRuleLibrary,
  PERSISTENT_RULE_ATTR,
  saveContentRuleLibrary,
  type ContentRuleLibrary,
  type PersistentContentRule,
} from '@root/src/utils/content-rules';
import {
  getContentHistoryCount,
  recordContentHistory,
  resetContentChanges,
  undoLastContentChange,
} from '@root/src/utils/content-history';

type Panel = '' | 'apply' | 'save' | 'manage' | 'rules';

const selectedEl = ref<Element | null>(null);
const menuStyle = ref<Record<string, string>>({
  left: '1rem',
  top: '1rem',
  zIndex: String(999999),
});
const panel = ref<Panel>('');
const presetModes: ContentPresetMode[] = ['text', 'block'];
const applyMode = ref<ContentPresetMode>('text');
const saveMode = ref<ContentPresetMode>('text');
const presets = ref<ContentPreset[]>([]);
const newPresetName = ref('');
const feedback = ref('');
const editingId = ref('');
const editName = ref('');
const editContent = ref('');
const historyCount = ref(0);
const importInput = ref<HTMLInputElement | null>(null);
const persistentRules = ref<PersistentContentRule[]>([]);
const persistentRulesEnabled = ref(true);
const siteRulesEnabled = ref(true);
const currentSiteKey = getSiteKey();
const currentSiteRules = computed(() =>
  persistentRules.value.filter((rule) => rule.siteKey === currentSiteKey),
);
const pendingAnchors = new WeakMap<Element, Element>();
const pendingOriginalTargets = new WeakMap<Element, Element>();
const pendingTextPaths = new WeakMap<Element, number[] | null>();
let feedbackTimer: ReturnType<typeof setTimeout> | undefined;

const filteredPresets = computed(() =>
  presets.value.filter((preset) => preset.mode === applyMode.value),
);

function showFeedback(message: string) {
  feedback.value = message;
  if (feedbackTimer) clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => {
    feedback.value = '';
  }, 2600);
}

function updateMenuPosition(element: Element) {
  const rect = element.getBoundingClientRect();
  const top = Math.min(
    Math.max(8, rect.bottom + 8),
    Math.max(8, window.innerHeight - 56),
  );
  menuStyle.value = {
    left: `${Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - 360))}px`,
    top: `${top}px`,
    zIndex: '999999',
  };
}

function onElementSelected({ el }: EmitterEvents['content:el-selected']) {
  selectedEl.value = el;
  updateMenuPosition(el);
  panel.value = '';
}

function onSelectionRemoved() {
  selectedEl.value = null;
  panel.value = '';
}

function togglePanel(nextPanel: Exclude<Panel, ''>) {
  panel.value = panel.value === nextPanel ? '' : nextPanel;
}

function openDetail() {
  if (!selectedEl.value?.isConnected) {
    showFeedback('Select an element first.');
    return;
  }

  emitter.emit('content:open-detail');
  showFeedback('Inspector opened.');
}

function refreshHistoryCount() {
  historyCount.value = getContentHistoryCount();
}

function emitSelected(element: Element) {
  if (element.isConnected) emitter.emit('content:select-element', element);
}

function duplicateElement() {
  if (!selectedEl.value?.isConnected) {
    showFeedback('Select an element first.');
    return;
  }

  const source = selectedEl.value;
  const scope = findDuplicateScope(source);
  if (!scope.parentElement) {
    showFeedback('Unable to duplicate this element.');
    return;
  }
  const clone = createUniqueClone(scope);
  const targetPath = getElementPath(scope, source) ?? [];
  const targetClone = getElementAtPath(clone, targetPath) ?? clone;
  scope.parentElement.insertBefore(clone, scope);
  [clone, ...clone.querySelectorAll('*')].forEach((clonedElement) => {
    const path = getElementPath(clone, clonedElement) ?? [];
    const originalElement = getElementAtPath(scope, path) ?? scope;
    pendingAnchors.set(clonedElement, scope);
    pendingOriginalTargets.set(clonedElement, originalElement);
    pendingTextPaths.set(
      clonedElement,
      getPreferredTextNodePath(originalElement),
    );
  });
  recordContentHistory({
    label: 'Duplicate element',
    undo: () => clone.remove(),
  });
  refreshHistoryCount();
  emitSelected(targetClone);
  showFeedback('Element duplicated.');
}

async function savePersistentRule(
  anchor: Element,
  target: Element,
  injectedElements: Element | Element[],
  mode: 'text' | 'block',
  content: string,
  blockMode: 'replace' | 'insert',
  name: string,
  textPath?: number[] | null,
) {
  const rule = createPersistentContentRule(
    name,
    anchor,
    mode,
    content,
    blockMode,
    target,
    textPath,
  );
  const library = await loadContentRuleLibrary();
  const nextLibrary: ContentRuleLibrary = {
    ...library,
    rules: [...library.rules, rule],
  };

  const elements = Array.isArray(injectedElements)
    ? injectedElements
    : [injectedElements];
  elements.forEach((element) =>
    element.setAttribute(PERSISTENT_RULE_ATTR, rule.id),
  );
  try {
    await saveContentRuleLibrary(nextLibrary);
  } catch (error) {
    elements.forEach((element) =>
      element.removeAttribute(PERSISTENT_RULE_ATTR),
    );
    throw error;
  }
  persistentRules.value = nextLibrary.rules;
  persistentRulesEnabled.value = nextLibrary.enabled;
  siteRulesEnabled.value = nextLibrary.siteSettings[currentSiteKey] !== false;
  return rule;
}

async function saveCurrentPreset() {
  const element = selectedEl.value;
  if (!element) {
    showFeedback('Select an element first.');
    return;
  }
  if (!newPresetName.value.trim()) {
    showFeedback('Add a preset name first.');
    return;
  }

  const preset =
    saveMode.value === 'text'
      ? createTextContentPreset(newPresetName.value, element.textContent ?? '')
      : createBlockContentPreset(newPresetName.value, element);

  const library: ContentPresetLibrary = {
    version: CONTENT_PRESETS_VERSION,
    presets: [...presets.value, preset],
  };
  try {
    await saveContentPresetLibrary(library);
    presets.value = library.presets;
    newPresetName.value = '';
    panel.value = 'apply';
    applyMode.value = preset.mode;
    showFeedback(`${preset.mode === 'text' ? 'Text' : 'Block'} preset saved.`);
  } catch {
    showFeedback('Unable to save preset. Try again.');
  }
}

async function applyTextPreset(
  preset: Extract<ContentPreset, { mode: 'text' }>,
) {
  const element = selectedEl.value;
  if (!element?.isConnected) return false;

  const textChange = applyTextContentPreservingStructure(
    element,
    preset.content,
    pendingTextPaths.get(element),
  );
  recordContentHistory({
    label: `Apply ${preset.name}`,
    undo: textChange.restore,
  });
  refreshHistoryCount();
  emitSelected(textChange.target);
  const anchor = pendingAnchors.get(textChange.target) ?? pendingAnchors.get(element);
  if (!anchor?.isConnected) return false;
  const target =
    pendingOriginalTargets.get(textChange.target) ??
    pendingOriginalTargets.get(element) ??
    anchor;
  await savePersistentRule(
    anchor,
    target,
    textChange.target,
    'text',
    preset.content,
    'replace',
    preset.name,
    textChange.textPath,
  );
  return true;
}

async function applyBlockPreset(
  preset: Extract<ContentPreset, { mode: 'block' }>,
) {
  const element = selectedEl.value;
  if (!element?.isConnected) return false;

  const html = sanitizeBlockHTML(preset.html);
  const template = document.createElement('template');
  template.innerHTML = html;
  const replacement = template.content.firstElementChild;
  if (!replacement) {
    showFeedback('This block preset has no safe content.');
    return false;
  }

  if (!element.parentElement) return false;
  const anchor = pendingAnchors.get(element);
  const target = pendingOriginalTargets.get(element) ?? anchor;

  if (blockApplyMode.value === 'replace') {
    const original = element;
    original.replaceWith(replacement);
    recordContentHistory({
      label: `Replace with ${preset.name}`,
      undo: () => {
        if (replacement.isConnected) replacement.replaceWith(original);
      },
    });
    if (anchor) {
      pendingAnchors.set(replacement, anchor);
      if (target) pendingOriginalTargets.set(replacement, target);
    }
  } else {
    element.insertAdjacentElement('afterend', replacement);
    recordContentHistory({
      label: `Insert ${preset.name}`,
      undo: () => replacement.remove(),
    });
    if (anchor) {
      pendingAnchors.set(replacement, anchor);
      if (target) pendingOriginalTargets.set(replacement, target);
    }
  }

  refreshHistoryCount();
  emitSelected(replacement);
  if (!anchor) return false;
  const rule = await savePersistentRule(
    anchor,
    target ?? element,
    blockApplyMode.value === 'replace' ? replacement : element,
    'block',
    html,
    blockApplyMode.value,
    preset.name,
  );
  if (blockApplyMode.value === 'insert') {
    replacement.setAttribute(PERSISTENT_RULE_ATTR, rule.id);
  }
  return true;
}

const blockApplyMode = ref<'replace' | 'insert'>('replace');

async function applyPreset(preset: ContentPreset) {
  let saved = false;
  if (preset.mode === 'text') {
    saved = await applyTextPreset(preset);
  } else {
    saved = await applyBlockPreset(preset);
  }
  panel.value = '';
  showFeedback(
    saved
      ? `${preset.name} applied and saved as a persistent rule.`
      : `${preset.name} applied.`,
  );
}

async function refreshPersistentRules() {
  const library = await loadContentRuleLibrary();
  persistentRules.value = library.rules;
  persistentRulesEnabled.value = library.enabled;
  siteRulesEnabled.value = library.siteSettings[currentSiteKey] !== false;
}

async function togglePersistentRules() {
  const library = await loadContentRuleLibrary();
  await saveContentRuleLibrary({
    ...library,
    enabled: !library.enabled,
  });
  await refreshPersistentRules();
  showFeedback(
    persistentRulesEnabled.value
      ? 'Persistent rules enabled.'
      : 'Persistent rules disabled.',
  );
}

async function toggleSiteRules() {
  const library = await loadContentRuleLibrary();
  const enabled = library.siteSettings[currentSiteKey] !== false;
  await saveContentRuleLibrary({
    ...library,
    siteSettings: {
      ...library.siteSettings,
      [currentSiteKey]: !enabled,
    },
  });
  await refreshPersistentRules();
  showFeedback(
    siteRulesEnabled.value
      ? 'Persistent rules enabled for this site.'
      : 'Persistent rules disabled for this site.',
  );
}

async function deletePersistentRule(rule: PersistentContentRule) {
  const confirmed = window.confirm(`Delete "${rule.name}"?`);
  if (!confirmed) return;
  const library = await loadContentRuleLibrary();
  await saveContentRuleLibrary({
    ...library,
    rules: library.rules.filter((item) => item.id !== rule.id),
  });
  await refreshPersistentRules();
  showFeedback('Persistent rule deleted.');
}

async function clearAllPersistentRules() {
  if (!window.confirm('Clear all saved persistent rules?')) return;
  const library = await loadContentRuleLibrary();
  await saveContentRuleLibrary({
    ...library,
    rules: [],
  });
  await refreshPersistentRules();
  showFeedback('All persistent rules cleared.');
}

function startEditing(preset: ContentPreset) {
  editingId.value = preset.id;
  editName.value = preset.name;
  editContent.value = preset.mode === 'text' ? preset.content : preset.html;
}

async function saveEditedPreset(preset: ContentPreset) {
  const name = editName.value.trim();
  if (!name) return;

  const nextContent =
    preset.mode === 'text'
      ? editContent.value
      : sanitizeBlockHTML(editContent.value);
  if (preset.mode === 'block' && !nextContent) {
    showFeedback('Block HTML must contain one safe element.');
    return;
  }

  const updatedPreset: ContentPreset =
    preset.mode === 'text'
      ? { ...preset, name, content: nextContent, updatedAt: Date.now() }
      : { ...preset, name, html: nextContent, updatedAt: Date.now() };
  const nextPresets = presets.value.map((item) =>
    item.id === preset.id ? updatedPreset : item,
  );
  await saveContentPresetLibrary({
    version: CONTENT_PRESETS_VERSION,
    presets: nextPresets,
  });
  presets.value = nextPresets;
  editingId.value = '';
  showFeedback('Preset updated.');
}

async function duplicatePreset(preset: ContentPreset) {
  const timestamp = Date.now();
  const duplicate: ContentPreset =
    preset.mode === 'text'
      ? {
          ...preset,
          id: `preset-${timestamp}-${Math.random().toString(36).slice(2)}`,
          name: `${preset.name} copy`,
          createdAt: timestamp,
          updatedAt: timestamp,
        }
      : {
          ...preset,
          id: `preset-${timestamp}-${Math.random().toString(36).slice(2)}`,
          name: `${preset.name} copy`,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
  const nextPresets = [...presets.value, duplicate];
  await saveContentPresetLibrary({
    version: CONTENT_PRESETS_VERSION,
    presets: nextPresets,
  });
  presets.value = nextPresets;
  showFeedback('Preset duplicated.');
}

async function deletePreset(preset: ContentPreset) {
  if (!window.confirm(`Delete "${preset.name}"?`)) return;

  const nextPresets = presets.value.filter((item) => item.id !== preset.id);
  await saveContentPresetLibrary({
    version: CONTENT_PRESETS_VERSION,
    presets: nextPresets,
  });
  presets.value = nextPresets;
  showFeedback('Preset deleted.');
}

function exportPresets() {
  const blob = new Blob(
    [
      JSON.stringify(
        { version: CONTENT_PRESETS_VERSION, presets: presets.value },
        null,
        2,
      ),
    ],
    {
      type: 'application/json',
    },
  );
  downloadFile('security-inspection-presets.json', blob);
  showFeedback('Preset library exported.');
}

async function importPresets(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    const parsed = JSON.parse(await file.text()) as
      Partial<ContentPresetLibrary> | ContentPreset[];
    const incoming = Array.isArray(parsed) ? parsed : parsed.presets;
    if (!Array.isArray(incoming)) throw new Error('Invalid preset file');

    await saveContentPresetLibrary({
      version: CONTENT_PRESETS_VERSION,
      presets: [...presets.value, ...incoming],
    });
    presets.value = await loadContentPresetLibrary().then(
      (library) => library.presets,
    );
    showFeedback('Preset library imported.');
  } catch (_error) {
    showFeedback('Could not import that preset file.');
  } finally {
    input.value = '';
  }
}

function undoChange() {
  const entry = undoLastContentChange();
  if (!entry) return;
  refreshHistoryCount();
  showFeedback(`${entry.label} undone.`);
}

function resetChanges() {
  const count = resetContentChanges();
  refreshHistoryCount();
  showFeedback(
    count
      ? `${count} page change${count === 1 ? '' : 's'} reset.`
      : 'No page changes to reset.',
  );
}

function handleResize() {
  if (selectedEl.value?.isConnected) updateMenuPosition(selectedEl.value);
}

onMounted(async () => {
  emitter.on('content:el-selected', onElementSelected);
  emitter.on('content:remove-selected', onSelectionRemoved);
  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleResize, true);
  const library = await loadContentPresetLibrary();
  presets.value = library.presets;
  refreshHistoryCount();
  await refreshPersistentRules();
});

onUnmounted(() => {
  emitter.off('content:el-selected', onElementSelected);
  emitter.off('content:remove-selected', onSelectionRemoved);
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleResize, true);
  if (feedbackTimer) clearTimeout(feedbackTimer);
});
</script>

<style scoped>
.quick-action-button {
  border-radius: 0.375rem;
  padding: 0.375rem 0.5rem;
  font-size: 0.6875rem;
  line-height: 1rem;
  white-space: nowrap;
  transition:
    background-color 150ms ease,
    color 150ms ease;
}

.quick-action-primary {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.quick-action-button:hover {
  background: hsl(var(--muted));
  color: hsl(var(--foreground));
}

.quick-action-primary:hover {
  background: hsl(var(--primary) / 0.86);
  color: hsl(var(--primary-foreground));
}
</style>
