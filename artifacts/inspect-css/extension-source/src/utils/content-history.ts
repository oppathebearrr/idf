export interface ContentHistoryEntry {
  label: string;
  undo: () => void;
}

const entries: ContentHistoryEntry[] = [];

export function recordContentHistory(entry: ContentHistoryEntry) {
  entries.push(entry);
}

export function undoLastContentChange() {
  const entry = entries.pop();
  if (!entry) return null;

  entry.undo();
  return entry;
}

export function resetContentChanges() {
  let count = 0;
  while (entries.length > 0) {
    entries.pop()?.undo();
    count += 1;
  }
  return count;
}

export function getContentHistoryCount() {
  return entries.length;
}
