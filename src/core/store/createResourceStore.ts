import { createStore } from "@/core/store/createStore";

/**
 * Shared cache for a fetched collection (architecture §12's data-cache provider,
 * sized for React Native).
 *
 * On the web this role is filled by a query library. Pulling one in here would
 * add a provider and a dependency for a single collection, so the equivalent is
 * this: one store per resource, read by every screen's list hook, written after
 * every mutation. The effect the architecture actually wants is preserved —
 * three screens observing one truth, no refetch storm, no prop drilling.
 */
export type ResourceState<TItem> = {
  items: TItem[];
  isLoading: boolean;
  /** Distinguishes "fetched, genuinely empty" from "never fetched". */
  isLoaded: boolean;
};

export const createResourceStore = <TItem>(initialItems: TItem[] = []) => {
  const store = createStore<ResourceState<TItem>>({
    items: initialItems,
    isLoading: false,
    isLoaded: false,
  });

  return {
    useStore: store.useStore,
    getState: store.getState,
    subscribe: store.subscribe,
    setLoading: (isLoading: boolean) => store.setState({ isLoading }),
    setItems: (items: TItem[]) =>
      store.setState({ items, isLoading: false, isLoaded: true }),
    patchItems: (updater: (items: TItem[]) => TItem[]) =>
      store.setState((state) => ({ items: updater(state.items) })),
    reset: () =>
      store.setState({ items: [], isLoading: false, isLoaded: false }),
  };
};

export type ResourceStore<TItem> = ReturnType<typeof createResourceStore<TItem>>;
