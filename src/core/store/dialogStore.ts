import { createStore } from "@/core/store/createStore";

/**
 * Global dialog orchestration (architecture §5).
 *
 * The single source of truth for which modal is open. Because any component can
 * call `open()`, no screen holds `useState` for modal visibility and no dialog
 * needs its `visible` flag prop-drilled to it.
 */
export type DialogType = "add" | "update" | "delete" | "read";

export type DialogEntry<TPayload = unknown> = {
  /** Globally unique per dialog instance: `add<Entity>`, `update<Entity>`, … */
  name: string;
  type: DialogType;
  payload?: TPayload;
};

type DialogState = {
  current: DialogEntry | null;
  /** Stacked dialogs, for the rare case two must be open simultaneously. */
  extraDialogs: DialogEntry[];
};

const store = createStore<DialogState>({ current: null, extraDialogs: [] });

const open = <TPayload>(
  name: string,
  type: DialogType,
  payload?: TPayload,
  allowMultiple = false,
) => {
  const entry: DialogEntry<TPayload> = { name, type, payload };

  if (allowMultiple && store.getState().current) {
    store.setState((state) => ({
      extraDialogs: [...state.extraDialogs, entry as DialogEntry],
    }));
    return;
  }

  store.setState({ current: entry as DialogEntry });
};

/** `close()` with no name closes everything. */
const close = (name?: string) => {
  if (!name) {
    store.setState({ current: null, extraDialogs: [] });
    return;
  }

  store.setState((state) => ({
    current: state.current?.name === name ? null : state.current,
    extraDialogs: state.extraDialogs.filter((entry) => entry.name !== name),
  }));
};

const isOpen = (name?: string) => {
  const { current, extraDialogs } = store.getState();
  if (!name) return Boolean(current) || extraDialogs.length > 0;
  return current?.name === name || extraDialogs.some((e) => e.name === name);
};

const getEntry = (name: string): DialogEntry | null => {
  const { current, extraDialogs } = store.getState();
  if (current?.name === name) return current;
  return extraDialogs.find((entry) => entry.name === name) ?? null;
};

export const dialogStore = {
  useStore: store.useStore,
  getState: store.getState,
  open,
  close,
  isOpen,
  getEntry,
};

export default dialogStore;
