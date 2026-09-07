<template>
  <Teleport to="body">
    <div
      v-if="!appProvider.state.paused && !appProvider.state.interactive"
      ref="overlayRef"
      :style="{
        zIndex: CONTENT_ZINDEX.overlay,
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100%',
        width: '100%',
      }"
    />
  </Teleport>
  <div
    v-show="elProperties"
    ref="containerRef"
    :style="{ ...floatingStyles, zIndex: CONTENT_ZINDEX.content }"
    class="scanner-warning-panel w-auto overflow-visible bg-transparent text-foreground"
    data-inspect-css-scanner-warning
  >
    <ScannerNavigation v-show="false" ref="scannerNavigation" @select="hoverElement" />
    <div
      class="flex min-h-9 items-center gap-2 rounded-lg border border-amber-300/90 bg-amber-400 px-3 text-xs font-semibold text-amber-950 shadow-[0_8px_24px_rgb(120_53_15_/_28%)]"
      role="status"
      aria-label="Unable to display your latest transaction at the moment."
      title="Unable to display your latest transaction at the moment."
    >
      <TriangleAlert class="h-5 w-5" aria-hidden="true" />
      <span>Unable to display your latest transaction at the moment.</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef } from 'vue';
import { emitter } from '@src/lib/mitt';
import {
  CONTENT_ZINDEX,
  EL_ATTR_NAME,
} from '@src/utils/constant';
import { PERSISTENT_RULE_ATTR } from '@root/src/utils/content-rules';
import { generateBoundingClientRect } from '@root/src/utils/helper';
import { ClientRectObject, flip, offset, useFloating } from '@floating-ui/vue';
import getElProperties from '@root/src/utils/getElProperties';
import { TriangleAlert } from 'lucide-vue-next';
import { useAppProvider } from '../app-plugin';
import ScannerNavigation from './scanner/ScannerNavigation.vue';

const NAVIGATION_KEY_MAP = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
} as const;

const scannerNavigation = ref<InstanceType<typeof ScannerNavigation> | null>(
  null,
);

const appProvider = useAppProvider();

const overlayRef = ref<HTMLDivElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);

const elProperties = shallowRef<ElementProperties | null>(null);
const floatingReference = shallowRef<{
  getBoundingClientRect: () => ClientRectObject;
}>();

const { floatingStyles } = useFloating(floatingReference, containerRef, {
  placement: 'bottom-start',
  middleware: [offset(10), flip()],
});

let selectedEl: Element | null = null;
let previousSelectedEl: Element | null = null;

function selectElement(element: Element) {
  if (!isInspectableTarget(element)) return;

  selectedEl?.removeAttribute(EL_ATTR_NAME.selected);
  previousSelectedEl?.removeAttribute(EL_ATTR_NAME.hover);

  selectedEl = element;
  previousSelectedEl = element;
  selectedEl.setAttribute(EL_ATTR_NAME.selected, 'true');

  elProperties.value = getElProperties(element).getAll();
  scannerNavigation.value?.updateNavigation(element);
  emitter.emit('content:el-selected', {
    el: element,
    properties: elProperties.value,
  });
}
function hoverElement(element: Element, updateNavigation = false) {
  if (!isInspectableTarget(element)) return;
  if (element === previousSelectedEl) return;

  element.setAttribute(EL_ATTR_NAME.hover, '');
  previousSelectedEl?.removeAttribute(EL_ATTR_NAME.hover);

  if (updateNavigation) scannerNavigation.value?.updateNavigation(element);

  elProperties.value = getElProperties(element).getAll();
  previousSelectedEl = element;
}

function isInspectableTarget(element: Element | null): element is Element {
  if (!element) return false;
  if (element === overlayRef.value) return false;
  if (element === appProvider.shadowRoot.host) return false;
  if (appProvider.shadowRoot.contains(element)) return false;
  if (element.hasAttribute(PERSISTENT_RULE_ATTR)) return false;
  return element.id !== 'inspect-css-root';
}

function getTargetAtPoint(
  clientX: number,
  clientY: number,
  eventTarget?: EventTarget | null,
) {
  if (appProvider.state.interactive) {
    return eventTarget instanceof Element && isInspectableTarget(eventTarget)
      ? eventTarget
      : null;
  }

  return (
    document
      .elementsFromPoint(clientX, clientY)
      .find((element) => isInspectableTarget(element)) ?? null
  );
}

function clearHover() {
  previousSelectedEl?.removeAttribute(EL_ATTR_NAME.hover);
  previousSelectedEl = null;
  elProperties.value = null;
}

function handlePointerMove({
  clientX,
  clientY,
  target: eventTarget,
}: PointerEvent) {
  if (
    appProvider.state.paused ||
    appProvider.state.tempHide ||
    document.body.hasAttribute(EL_ATTR_NAME.dragging)
  )
    return;

  floatingReference.value = {
    getBoundingClientRect: generateBoundingClientRect(clientX, clientY),
  };

  const target = getTargetAtPoint(clientX, clientY, eventTarget);

  if (
    !target ||
    !isInspectableTarget(target)
  ) {
    clearHover();
    return;
  }

  if (target === previousSelectedEl) return;

  hoverElement(target, true);
}
function handleKeyDown(event: KeyboardEvent) {
  if (
    appProvider?.state.paused ||
    document.activeElement === appProvider.shadowRoot.host
  )
    return;

  switch (event.code) {
    case 'Space': {
      if (previousSelectedEl) {
        event.preventDefault();
        event.stopPropagation();

        selectElement(previousSelectedEl);
      }
      break;
    }
    case 'ArrowUp':
    case 'ArrowDown':
    case 'ArrowLeft':
    case 'ArrowRight':
      event.preventDefault();
      event.stopPropagation();
      scannerNavigation.value?.navigate(NAVIGATION_KEY_MAP[event.code]);
      break;
    default:
      break;
  }
}
function handleClick(event: MouseEvent) {
  const target = getTargetAtPoint(
    event.clientX,
    event.clientY,
    event.target,
  );

  if (target) selectElement(target);
}
function handleExternalSelect(element: Element) {
  if (!element.isConnected) return;

  hoverElement(element, true);
  selectElement(element);
}

onMounted(() => {
  window.addEventListener('click', handleClick);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('pointermove', handlePointerMove);
  emitter.on('content:select-element', handleExternalSelect);
});
onUnmounted(() => {
  window.removeEventListener('click', handleClick);
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('pointermove', handlePointerMove);
  emitter.off('content:select-element', handleExternalSelect);

  selectedEl?.removeAttribute(EL_ATTR_NAME.selected);
  previousSelectedEl?.removeAttribute(EL_ATTR_NAME.hover);

  selectedEl = null;
  previousSelectedEl = null;
});
</script>
