export type PromptUsageEvent = {
  name: string;
  variables: Record<string, string | number | boolean>;
  timestamp: number;
};

type Listener = (event: PromptUsageEvent) => void;

const listeners: Listener[] = [];

export const subscribePromptUsage = (listener: Listener): (() => void) => {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
};

export const emitPromptUsage = (name: string, variables: Record<string, string | number | boolean>): void => {
  const event: PromptUsageEvent = {
    name,
    variables,
    timestamp: Date.now(),
  };
  listeners.forEach(fn => {
    try {
      fn(event);
    } catch (err) {
      console.error('[PromptEvents] listener error', err);
    }
  });
};
