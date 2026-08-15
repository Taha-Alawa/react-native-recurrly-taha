/**
 * Global feedback (architecture §6).
 *
 * A register/emit micro-service rather than a React context, so non-React code
 * — notably the Firestore wrapper — can raise user-visible feedback without
 * holding a hook. One renderer mounted at the root layout registers its queue
 * push function on mount.
 */
export type FeedbackType = "success" | "info" | "warn" | "error";

export type FeedbackMessage = {
  type: FeedbackType;
  message: string;
};

type Emitter = (message: FeedbackMessage) => void;

let emit: Emitter | null = null;

/** Called once by the renderer at the root layout. */
export const register = (emitter: Emitter | null) => {
  emit = emitter;
};

export const show = (type: FeedbackType, message: string) => {
  if (!emit) {
    // No renderer mounted yet (very early startup). Log so the message is not
    // silently swallowed during development.
    if (__DEV__) console.warn(`[feedback:${type}] ${message}`);
    return;
  }
  emit({ type, message });
};

export const feedbackService = { register, show };

export default feedbackService;
