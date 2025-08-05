type ActionFunction = (params: {event: Event, element: HTMLElement}) => void;
// prettier-ignore
type EventName = 
  | "click" | "dblclick" | "mousedown" | "mouseup" | "submit" | "input"| "change"
  | "focus" | "blur" | "reset" | "invalid" | "keydown" | "keyup" | "keypress"
  | "mouseenter" | "mouseleave" | "mouseover" | "mouseout" | "mousemove" | "contextmenu"
  | "touchstart" | "touchend" | "touchmove" | "scroll" | "wheel" | "resize" | "load"
  | "DOMContentLoaded" | "beforeunload" | "error" | "abort" | "loadstart" | "progress"
  | "timeout" | "loadend" | "play" | "pause" | "ended" | "volumechange" | "seeking"
  | "animationend" | "transitionend";

interface OnEventsOptions {
  actions: Record<string, ActionFunction>;
  root?: HTMLElement | Document;
  preloadEvents?: EventName[];
}

export default function onEvents({
  actions,
  root = document,
  preloadEvents = [],
}: OnEventsOptions): () => void {
  if (!actions || typeof actions !== "object") {
    throw new Error('onEvents: "actions" is required and must be an object.');
  }

  const listeners: { type: EventName; handler: EventListener }[] = [];
  const usedEvents = new Set<EventName>(preloadEvents);

  const elements = root.querySelectorAll("*");
  elements.forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      if (attr.name.startsWith("on-")) {
        const type = attr.name.slice(3);
        // Runtime check to ensure event is allowed
        if (isValidEventName(type)) {
          usedEvents.add(type as EventName);
        }
      }
    }
  });

  Array.from(usedEvents).forEach((type) => {
    const handler = function (event: Event): void {
      const target = event.target as HTMLElement | null;
      const element = target?.closest(`[on-${type}]`) as HTMLElement | null;
      if (!element || !root.contains(element)) return;

      const fnName = element.getAttribute(`on-${type}`);
      const fn = fnName && actions[fnName];

      if (typeof fn === "function") {
        fn({ event, element });
      } else {
        console.warn(
          `onEvents: Function '${fnName}' not found for event '${type}'.`
        );
      }
    };

    root.addEventListener(type, handler);
    listeners.push({ type, handler });
  });

  return function destroy(): void {
    listeners.forEach(({ type, handler }) => {
      root.removeEventListener(type, handler);
    });
  };
}

// Helper function to check if event name is valid
function isValidEventName(name: string): name is EventName {
  // prettier-ignore
  const validEvents: EventName[] = [
    "click", "dblclick", "mousedown", "mouseup", "submit", "input", "change",
    "focus", "blur", "reset", "invalid", "keydown", "keyup", "keypress",
    "mouseenter", "mouseleave", "mouseover", "mouseout", "mousemove", "contextmenu",
    "touchstart", "touchend", "touchmove", "scroll", "wheel", "resize", "load",
    "DOMContentLoaded", "beforeunload", "error", "abort", "loadstart", "progress",
    "timeout", "loadend", "play", "pause", "ended", "volumechange", "seeking",
    "animationend", "transitionend"
  ];
  return validEvents.includes(name as EventName);
}
