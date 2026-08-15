import { useCallback } from "react";
import dialogStore, {
  type DialogEntry,
  type DialogType,
} from "@/core/store/dialogStore";

/**
 * Reactive binding to the global dialog store. A dialog component names the
 * instances it owns and receives derived open state plus its payload.
 */
export const useDialog = <TPayload = unknown>(...names: string[]) => {
  const state = dialogStore.useStore();

  const entry = ([state.current, ...state.extraDialogs].find(
    (candidate): candidate is DialogEntry =>
      Boolean(candidate) && names.includes(candidate!.name),
  ) ?? null) as DialogEntry<TPayload> | null;

  const close = useCallback(() => {
    dialogStore.close(entry?.name);
  }, [entry?.name]);

  return {
    isOpen: Boolean(entry),
    name: entry?.name ?? null,
    type: (entry?.type ?? null) as DialogType | null,
    payload: (entry?.payload ?? null) as TPayload | null,
    close,
    open: dialogStore.open,
  };
};

export default useDialog;
