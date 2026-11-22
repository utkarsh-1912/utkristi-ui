'use client';

import type { TableProps, TableRowKey } from './Table.js';

export interface DataTablePatch<Row> { upsert?: readonly Row[]; remove?: readonly TableRowKey[] }
type Snapshot<Row> = { rows: Row[]; past: ReadonlyMap<TableRowKey, Row>; revision: number; announced: number };
export interface DataTableStreamView<Row> {
  getSnapshot: () => Snapshot<Row> | undefined;
  subscribe: (listener: () => void) => () => void;
}
export interface DataTableStream<Row> {
  applyPatch: (patch: DataTablePatch<Row>) => void;
  forRows: (rows: Row[], getKey: TableProps<Row>['getRowKey']) => DataTableStreamView<Row>;
}

export function createDataTableStream<Row>(): DataTableStream<Row> {
  const listeners = new Set<(patch: DataTablePatch<Row>) => void>();
  return {
    applyPatch(patch) { for (const listener of listeners) listener(patch); },
    forRows(rows, getKey) {
      let snapshot: Snapshot<Row> | undefined;
      let frame: number | undefined;
      let announcement: ReturnType<typeof setTimeout> | undefined;
      let pending: DataTablePatch<Row>[] = [];
      let newRows = 0;
      const subscribers = new Set<() => void>();
      const notify = () => { for (const subscriber of subscribers) subscriber(); };
      const accept = (patch: DataTablePatch<Row>) => {
        pending.push(patch);
        frame ??= requestAnimationFrame(() => {
          frame = undefined;
          const byId = new Map((snapshot?.rows ?? rows).map((row, index) => [getKey(row, index), row]));
          const past = new Map<TableRowKey, Row>();
          const added = new Set<TableRowKey>();
          for (const { upsert = [], remove = [] } of pending) {
            for (const id of remove) { byId.delete(id); added.delete(id); past.delete(id); }
            for (const row of upsert) {
              const id = getKey(row, byId.size);
              const old = byId.get(id);
              if (!byId.has(id)) added.add(id);
              else if (!added.has(id) && !past.has(id) && old !== undefined) past.set(id, old);
              byId.set(id, row);
            }
          }
          pending = [];
          newRows += added.size;
          snapshot = { rows: [...byId.values()], past, revision: (snapshot?.revision ?? 0) + 1, announced: snapshot?.announced ?? 0 };
          notify();
          if (newRows !== snapshot.announced) announcement ??= setTimeout(() => {
            announcement = undefined;
            if (!snapshot) return;
            snapshot = { ...snapshot, announced: newRows };
            notify();
          }, 500);
        });
      };
      return {
        getSnapshot: () => snapshot,
        subscribe(listener) {
          subscribers.add(listener);
          listeners.add(accept);
          return () => {
            subscribers.delete(listener);
            if (subscribers.size) return;
            listeners.delete(accept);
            if (frame !== undefined) cancelAnimationFrame(frame);
            clearTimeout(announcement);
            frame = undefined;
            announcement = undefined;
            pending = [];
          };
        },
      };
    },
  };
}
