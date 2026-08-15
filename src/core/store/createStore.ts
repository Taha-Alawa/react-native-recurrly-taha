import { useSyncExternalStore } from "react";

/**
 * Minimal external store. Deliberately dependency-free — the app only needs
 * subscribe/notify semantics, and `useSyncExternalStore` is built into React.
 *
 * `useStore()` returns the whole state object. Its identity only changes when
 * `setState` actually runs, so returning it wholesale is safe for the
 * tearing checks `useSyncExternalStore` performs (a selector that built a new
 * object each call would loop forever).
 */
export type Store<T> = {
  getState: () => T;
  setState: (next: Partial<T> | ((current: T) => Partial<T>)) => void;
  subscribe: (listener: () => void) => () => void;
  useStore: () => T;
};

export const createStore = <T extends object>(initialState: T): Store<T> => {
  let state = initialState;
  const listeners = new Set<() => void>();

  const getState = () => state;

  const setState: Store<T>["setState"] = (next) => {
    const patch = typeof next === "function" ? next(state) : next;
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const useStore = () => useSyncExternalStore(subscribe, getState, getState);

  return { getState, setState, subscribe, useStore };
};
